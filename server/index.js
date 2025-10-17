import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import helmet from 'helmet'
import { body, validationResult } from 'express-validator'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(helmet())
app.use(cors())

const RIOT_API_KEY = process.env.RIOT_API_KEY || 'REPLACE_WITH_YOUR_KEY'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin_secret_token'
const bugsFile = path.join(__dirname, 'data', 'bugs.json')

// ensure data directory and file exist
try {
  const dataDir = path.join(__dirname, 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
  if (!fs.existsSync(bugsFile)) fs.writeFileSync(bugsFile, JSON.stringify([]))
} catch (e) {
  console.error('could not ensure data dir', e)
}

app.get('/api/flyquest/matches', async (req, res) => {
  try {
    const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY || '';
    if (!PANDASCORE_API_KEY) {
      return res.status(500).json({
        error: 'No se encontró el token de PandaScore en .env',
        matches: [],
        fallback: true
      });
    }

    // Buscar el ID del equipo FlyQuest en PandaScore
    // Documentación: https://developer.pandascore.io/
    // Endpoint: https://api.pandascore.io/lol/teams?search=flyquest
    const teamResp = await fetch('https://api.pandascore.io/lol/teams?search=flyquest', {
      headers: { 'Authorization': `Bearer ${PANDASCORE_API_KEY}` }
    });

    // Verificar si la API devuelve error 500 o estructura de error de PandaScore
    const teamData = await teamResp.json();

    // Detectar error del servidor de PandaScore
    if (teamData.errorCode === 500 || teamData.status === 'fail') {
      console.error('⚠️ API de PandaScore caída:', teamData.errorMsg || 'Error del servidor');
      return res.json({
        matches: [],
        message: '⚠️ La API de PandaScore está temporalmente fuera de servicio. Por favor, intenta de nuevo más tarde.',
        apiError: teamData.errorMsg || 'Servidor no disponible',
        fallback: true
      });
    }

    if (!teamResp.ok) {
      return res.json({
        error: 'No se pudo obtener el equipo FlyQuest',
        status: teamResp.status,
        matches: [],
        fallback: true
      });
    }

    let teams = teamData;
    if (!Array.isArray(teams)) {
      teams = teams && teams.data ? teams.data : [];
    }

    const flyQuest = Array.isArray(teams)
      ? teams.find(t => t.name && t.name.toLowerCase().includes('flyquest'))
      : null;

    if (!flyQuest) {
      return res.json({
        matches: [],
        message: 'No se encontró el equipo FlyQuest en PandaScore. La API puede estar en mantenimiento.',
        fallback: true
      });
    }

    // Obtener todos los partidos del año actual
    const year = new Date().getFullYear();
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;
    let allMatches = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.pandascore.io/lol/matches?filter[team_id]=${flyQuest.id}&range[begin_at]=${startDate},${endDate}&sort=-begin_at&page[size]=100&page[number]=${page}`;
      const matchesResp = await fetch(url, {
        headers: { 'Authorization': `Bearer ${PANDASCORE_API_KEY}` }
      });

      const matchesData = await matchesResp.json();

      // Verificar error de servidor de PandaScore
      if (matchesData.errorCode === 500 || matchesData.status === 'fail') {
        console.error('⚠️ Error al obtener partidos:', matchesData.errorMsg);
        return res.json({
          matches: [],
          message: '⚠️ La API de PandaScore está temporalmente fuera de servicio.',
          fallback: true
        });
      }

      if (!matchesResp.ok) {
        return res.json({
          error: 'No se pudieron obtener los partidos de FlyQuest',
          status: matchesResp.status,
          matches: [],
          fallback: true
        });
      }

      const matches = Array.isArray(matchesData) ? matchesData : [];
      allMatches = allMatches.concat(matches);
      hasMore = matches.length === 100;
      page++;

      // Límite de seguridad para evitar loops infinitos
      if (page > 10) hasMore = false;
    }

    // Formatear los datos para el frontend
    const formatted = allMatches.map(match => ({
      id: match.id,
      status: match.status, // not_started, running, finished, canceled
      startTime: match.begin_at,
      teams: match.opponents.map(op => ({
        name: op.opponent.name,
        code: op.opponent.acronym || op.opponent.name.substring(0, 3).toUpperCase(),
        logo: op.opponent.image_url || '',
        score: match.results?.find(r => r.team_id === op.opponent.id)?.score || 0
      })),
      format: match.number_of_games ? `bo${match.number_of_games}` : 'bo1',
      league: match.league?.name || 'Desconocida'
    }));

    // Ordenar por fecha descendente
    formatted.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    if (formatted.length === 0) {
      return res.json({ matches: [], message: 'No hay partidos programados de FlyQuest en este momento' });
    }

    return res.json(formatted);
  } catch (e) {
    console.error('❌ Error del servidor:', e.message);
    return res.status(500).json({
      error: 'Error al obtener partidos desde PandaScore',
      message: e.message,
      matches: []
    });
  }
})

// Bug reporting endpoint (public) with validation and atomic write + backup
app.post(
  '/api/flyquest/bugs',
  express.json(),
  body('title').isLength({ min: 3 }).trim().escape(),
  body('description').isLength({ min: 5 }).trim().escape(),
  body('url').optional().isURL().trim(),
  body('severity').optional().isIn(['low', 'medium', 'high']).trim(),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    try {
      const { title, description, url, severity } = req.body
      const raw = fs.readFileSync(bugsFile, 'utf8') || '[]'
      const bugs = JSON.parse(raw)
      const id = `bug_${Date.now()}`
      const entry = { id, title, description, url: url || null, severity: severity || 'low', createdAt: new Date().toISOString() }
      bugs.unshift(entry)

      // backup current file
      try {
        fs.copyFileSync(bugsFile, `${bugsFile}.bak`)
      } catch (e) {
        console.warn('backup failed', e)
      }

      // atomic write: write to tmp then rename
      const tmp = `${bugsFile}.${Date.now()}.tmp`
      fs.writeFileSync(tmp, JSON.stringify(bugs, null, 2))
      fs.renameSync(tmp, bugsFile)

      res.status(201).json(entry)
    } catch (e) {
      console.error('save bug', e)
      res.status(500).json({ error: 'could not save' })
    }
  }
)

// Admin: list bugs (protected via header x-admin-token)
app.get('/api/flyquest/bugs', (req, res) => {
  try {
    const token = req.header('x-admin-token')
    if (!token || token !== ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' })
    const bugs = JSON.parse(fs.readFileSync(bugsFile, 'utf8') || '[]')
    res.json(bugs)
  } catch (e) {
    console.error('read bugs', e)
    res.status(500).json({ error: 'could not read' })
  }
})

const port = process.env.PORT || 4001
app.listen(port, () => console.log(`✅ Server running on port ${port}`))

// Endpoints de mantenimiento
app.get('/api/mantenimiento/test-api', async (req, res) => {
  try {
    const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY || '';
    if (!PANDASCORE_API_KEY) return res.status(500).send('No se encontró el token de PandaScore');
    const resp = await fetch('https://api.pandascore.io/lol/teams?search=flyquest', {
      headers: { 'Authorization': `Bearer ${PANDASCORE_API_KEY}` }
    });
    if (!resp.ok) return res.status(502).send('Error al conectar con PandaScore: ' + resp.status);
    const data = await resp.json();
    res.send('API PandaScore OK. Equipos encontrados: ' + (Array.isArray(data) ? data.length : 0));
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.get('/api/mantenimiento/reiniciar-backend', (req, res) => {
  res.send('Reiniciando backend...');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

app.get('/api/mantenimiento/logs', (req, res) => {
  try {
    const logPath = path.join(__dirname, '../logs/server.log');
    if (fs.existsSync(logPath)) {
      const logs = fs.readFileSync(logPath, 'utf8');
      res.type('text/plain').send(logs.slice(-4000));
    } else {
      res.send('No hay logs disponibles.');
    }
  } catch (e) {
    res.status(500).send('Error al leer logs: ' + e.message);
  }
});

app.get('/api/mantenimiento/estado', (req, res) => {
  try {
    // Estado básico: puerto, uptime, memoria
    const estado = {
      puerto: port,
      uptime: process.uptime(),
      memoria: process.memoryUsage(),
      fecha: new Date().toISOString()
    };
    res.json(estado);
  } catch (e) {
    res.status(500).send('Error al consultar estado: ' + e.message);
  }
});

app.get('/api/mantenimiento/actualizar', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    exec('npm install', { cwd: __dirname }, (err, stdout, stderr) => {
      if (err) return res.status(500).send('Error al actualizar dependencias: ' + err.message);
      res.type('text/plain').send(stdout + '\n' + stderr);
    });
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// Endpoint para mostrar el estado de FlyQuest en la API (lee el log de monitorización)
app.get('/api/mantenimiento/estado-flyquest', (req, res) => {
  try {
    const logPath = path.join(__dirname, 'logs', 'monitor_flyquest.log');
    if (fs.existsSync(logPath)) {
      const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(l => l.trim() !== '');
      res.type('text/plain').send(lines.slice(-50).join('\n') || 'No hay registros de FlyQuest aún.');
    } else {
      res.send('No hay registros de FlyQuest aún.');
    }
  } catch (e) {
    res.status(500).send('Error al leer estado FlyQuest: ' + e.message);
  }
});
