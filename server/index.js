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
app.use(helmet({
  contentSecurityPolicy: false, // Permitir assets en producción
}))
app.use(cors())
app.use(express.json())

// Servir archivos estáticos del frontend en producción
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist')
if (fs.existsSync(frontendPath)) {
  console.log('✅ Sirviendo frontend desde:', frontendPath)
  app.use(express.static(frontendPath))
} else {
  console.log('⚠️ Frontend dist no encontrado, solo API disponible')
}

// Servir archivos de mantenimiento desde /mantenimiento
const scriptsPath = path.join(__dirname, '..', 'scripts')
if (fs.existsSync(scriptsPath)) {
  console.log('✅ Panel de mantenimiento disponible en /mantenimiento')
  app.use('/mantenimiento', express.static(scriptsPath))
} else {
  console.log('⚠️ Carpeta scripts no encontrada')
}

// LoL Esports API - No requiere API key personal, usa la key pública oficial
const LOL_ESPORTS_API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'
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
    // LoL Esports API - API Key pública oficial de lolesports.com
    const LOL_ESPORTS_API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
    const FLYQUEST_SLUG = 'flyquest';

    console.log('🔍 Obteniendo partidos de FlyQuest desde LoL Esports API...');

    // Obtener el schedule completo (últimos 3 meses + próximos 3 meses)
    const scheduleResp = await fetch(
      'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US',
      {
        headers: {
          'x-api-key': LOL_ESPORTS_API_KEY
        }
      }
    );

    if (!scheduleResp.ok) {
      console.error('❌ Error al obtener schedule:', scheduleResp.status);
      return res.status(500).json({
        error: 'No se pudo conectar con LoL Esports API',
        status: scheduleResp.status,
        matches: []
      });
    }

    const scheduleData = await scheduleResp.json();

    if (!scheduleData || !scheduleData.data || !scheduleData.data.schedule) {
      console.error('❌ Estructura de respuesta inesperada');
      return res.json({
        error: 'Estructura de datos inválida',
        matches: []
      });
    }

    // Filtrar todos los eventos de FlyQuest
    let flyquestMatches = [];
    const events = scheduleData.data.schedule.events || [];

    console.log(`📊 Total de eventos en el schedule: ${events.length}`);

    for (const event of events) {
      const match = event.match;
      if (!match || !match.teams) continue;

      // Verificar si FlyQuest está en este partido
      const hasFlyQuest = match.teams.some(team =>
        team.slug === FLYQUEST_SLUG ||
        team.code === 'FLY' ||
        team.name.toLowerCase().includes('flyquest')
      );

      if (hasFlyQuest) {
        flyquestMatches.push({
          eventId: event.id,
          startTime: event.startTime,
          state: event.state, // unstarted, inProgress, completed
          blockName: event.blockName,
          league: event.league ? {
            name: event.league.name,
            slug: event.league.slug,
            image: event.league.image
          } : null,
          match: {
            id: match.id,
            teams: match.teams.map(team => ({
              name: team.name,
              code: team.code,
              slug: team.slug,
              image: team.image,
              result: team.result ? {
                outcome: team.result.outcome, // win, loss
                gameWins: team.result.gameWins || 0
              } : null
            })),
            strategy: match.strategy ? {
              type: match.strategy.type, // bestOf
              count: match.strategy.count // 1, 3, 5
            } : null
          }
        });
      }
    }

    console.log(`✅ Partidos de FlyQuest encontrados: ${flyquestMatches.length}`);

    // Formatear para el frontend (mantener compatibilidad con el formato anterior)
    const formatted = flyquestMatches.map(event => {
      const teams = event.match.teams;
      const flyquestTeam = teams.find(t => t.slug === FLYQUEST_SLUG || t.code === 'FLY');
      const opponentTeam = teams.find(t => t.slug !== FLYQUEST_SLUG && t.code !== 'FLY');

      // Determinar el estado del partido
      let status = 'not_started';
      if (event.state === 'completed') status = 'finished';
      else if (event.state === 'inProgress') status = 'running';

      // Scores
      const flyquestScore = flyquestTeam?.result?.gameWins || 0;
      const opponentScore = opponentTeam?.result?.gameWins || 0;

      return {
        id: event.eventId,
        status: status,
        startTime: event.startTime,
        teams: [
          {
            name: flyquestTeam?.name || 'FlyQuest',
            code: flyquestTeam?.code || 'FLY',
            logo: flyquestTeam?.image || '',
            score: flyquestScore
          },
          {
            name: opponentTeam?.name || 'TBD',
            code: opponentTeam?.code || 'TBD',
            logo: opponentTeam?.image || '',
            score: opponentScore
          }
        ],
        format: event.match.strategy?.count ? `bo${event.match.strategy.count}` : 'bo1',
        league: event.league?.name || event.blockName || 'League of Legends'
      };
    });

    // Ordenar por fecha (más recientes primero)
    formatted.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    if (formatted.length === 0) {
      return res.json({
        matches: [],
        message: 'No hay partidos de FlyQuest en los últimos 3 meses ni próximos 3 meses',
        info: 'Usando LoL Esports API oficial'
      });
    }

    console.log(`🎮 Enviando ${formatted.length} partidos al frontend`);
    return res.json({
      matches: formatted,
      total: formatted.length,
      api: 'LoL Esports Official API',
      team: 'FlyQuest'
    });

  } catch (e) {
    console.error('❌ Error del servidor:', e.message);
    console.error(e.stack);
    return res.status(500).json({
      error: 'Error al obtener partidos desde LoL Esports API',
      message: e.message,
      matches: []
    });
  }
})

// Proxy: Roster de FlyQuest (oculta la API key al cliente)
app.get('/api/flyquest/roster', async (req, res) => {
  try {
    const resp = await fetch('https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US', {
      headers: { 'x-api-key': LOL_ESPORTS_API_KEY }
    });

    if (!resp.ok) {
      console.error('❌ Error getTeams:', resp.status);
      return res.status(502).json({ error: 'Error al obtener equipos', status: resp.status, roster: [] });
    }

    const data = await resp.json();
    const teams = data?.data?.teams || [];
    const fly = teams.find(t => t.slug === 'flyquest' || t.code === 'FLY' || t.name?.toLowerCase() === 'flyquest');

    if (!fly) {
      return res.json({ roster: [], message: 'FlyQuest no encontrado en LoL Esports API' });
    }

    const roleMap = {
      top: 'Top',
      jungle: 'Jungla',
      jungler: 'Jungla',
      mid: 'Mid',
      bottom: 'ADC',
      adc: 'ADC',
      support: 'Soporte'
    };

    const roster = (fly.players || []).map((p, idx) => ({
      id: idx + 1,
      name: p.fullName || p.name || p.summonerName,
      role: roleMap[(p.role || '').toLowerCase()] || p.role || 'N/A',
      country: p.country || p.hometown || '—',
      image: p.photoURL || p.image || ''
    }));

    return res.json({ team: fly.name || 'FlyQuest', roster });
  } catch (e) {
    console.error('❌ roster proxy', e);
    return res.status(500).json({ error: 'Error interno obteniendo roster', roster: [] });
  }
});

// Bug reporting endpoint (public) with validation and atomic write + backup
app.post(
  '/api/flyquest/bugs',
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

// Endpoints de mantenimiento
app.get('/api/mantenimiento/test-api', async (req, res) => {
  try {
    // Probar LoL Esports API
    const resp = await fetch('https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US', {
      headers: { 'x-api-key': LOL_ESPORTS_API_KEY }
    });

    if (!resp.ok) return res.status(502).send('❌ Error al conectar con LoL Esports API: ' + resp.status);

    const data = await resp.json();
    const teams = data?.data?.teams || [];
    const flyquest = teams.find(t => t.slug === 'flyquest');

    if (flyquest) {
      res.send(`✅ API LoL Esports OK. FlyQuest encontrado: ${flyquest.name} (${flyquest.code}). Total equipos: ${teams.length}`);
    } else {
      res.send(`⚠️ API OK pero FlyQuest no encontrado. Total equipos: ${teams.length}`);
    }
  } catch (e) {
    res.status(500).send('❌ Error: ' + e.message);
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

// Endpoint para mostrar el estado de FlyQuest en LoL Esports API
app.get('/api/mantenimiento/estado-flyquest', async (req, res) => {
  try {
    // Consultar API en tiempo real
    const resp = await fetch('https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US', {
      headers: { 'x-api-key': LOL_ESPORTS_API_KEY }
    });

    if (!resp.ok) {
      return res.type('text/plain').send(`❌ Error al consultar API: ${resp.status}`);
    }

    const data = await resp.json();
    const events = data?.data?.schedule?.events || [];

    // Filtrar eventos de FlyQuest
    const flyquestEvents = events.filter(e =>
      e.match?.teams?.some(t => t.slug === 'flyquest' || t.code === 'FLY')
    );

    const completed = flyquestEvents.filter(e => e.state === 'completed').length;
    const upcoming = flyquestEvents.filter(e => e.state === 'unstarted').length;
    const inProgress = flyquestEvents.filter(e => e.state === 'inProgress').length;

    const output = [
      '=== ESTADO DE FLYQUEST EN LOL ESPORTS API ===',
      `Fecha: ${new Date().toISOString()}`,
      `Total de eventos: ${flyquestEvents.length}`,
      `- Completados: ${completed}`,
      `- Próximos: ${upcoming}`,
      `- En progreso: ${inProgress}`,
      '',
      'API: LoL Esports Official (lolesports.com)',
      'Estado: ✅ Activo'
    ].join('\n');

    res.type('text/plain').send(output);
  } catch (e) {
    res.status(500).send('Error al consultar estado de FlyQuest: ' + e.message);
  }
});

// Catch-all route: Servir index.html para todas las rutas no API (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Frontend not built. Run: cd frontend && npm run build')
  }
})

// Iniciar servidor
const port = process.env.PORT || 4001
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`)
  console.log(`📡 API: http://localhost:${port}/api/flyquest/matches`)
  if (fs.existsSync(frontendPath)) {
    console.log(`🎨 Frontend: http://localhost:${port}`)
  }
})
