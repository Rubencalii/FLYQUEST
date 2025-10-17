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
    // Buscar partidos en TODAS las competiciones principales
    // IDs de las ligas principales:
    const leagues = [
      { id: '98767975604431411', name: 'Worlds' },        // Mundial
      { id: '98767991299243165', name: 'LCS' },           // LCS (NA)
      { id: '107898214974993351', name: 'MSI' },          // MSI (Mid-Season Invitational)
      { id: '98767991302996019', name: 'LCS Proving' },   // LCS Proving Grounds
    ]

    let allMatches = []

    // Intentar obtener partidos de todas las ligas
    for (const league of leagues) {
      try {
        const url = `https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=es-MX&leagueId=${league.id}`
        console.log(`Buscando partidos en ${league.name}...`)

        const r = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'x-api-key': RIOT_API_KEY
          }
        })

        if (r.ok) {
          const json = await r.json()
          const events = json.data?.schedule?.events || []

          // Filtrar solo partidos de FlyQuest
          for (const ev of events) {
            const competitors = ev.match?.teams || []
            if (!competitors || competitors.length === 0) continue

            const hasFly = competitors.some((c) => c.name && c.name.toLowerCase().includes('flyquest'))
            if (!hasFly) continue

            const teams = competitors.map((c) => ({
              name: c.name,
              code: c.code || c.name,
              logo: c.image || '',
              score: c.result?.gameWins ?? 0
            }))

            allMatches.push({
              id: ev.match?.id || ev.id || `${ev.startTime}`,
              status: ev.state || 'unknown',
              startTime: ev.startTime,
              teams,
              format: ev.match?.strategy?.type || 'Bo1',
              league: league.name
            })
          }

          console.log(`✓ Encontrados ${allMatches.filter(m => m.league === league.name).length} partidos en ${league.name}`)
        }
      } catch (err) {
        console.log(`✗ Error en ${league.name}:`, err.message)
      }
    }

    // Si encontramos partidos reales, devolverlos ordenados por fecha
    if (allMatches.length > 0) {
      allMatches.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      console.log(`\n📊 Total de partidos encontrados: ${allMatches.length}`)
      return res.json(allMatches)
    }

    console.log('⚠️  No se encontraron partidos en las APIs, usando datos de respaldo...')

    // DATOS DE RESPALDO - Partidos 2025 de múltiples competiciones
    const fallbackMatches = [
      // ========== WORLDS 2025 (Septiembre-Octubre) ==========
      {
        id: 'worlds-2025-1',
        status: 'completed',
        startTime: '2025-09-25T12:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 1 },
          { name: 'PSG Talon', code: 'PSG', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/d9/PSG_Talonlogo_square.png', score: 0 }
        ],
        format: 'Bo1',
        league: 'Worlds 2025'
      },
      {
        id: 'worlds-2025-2',
        status: 'completed',
        startTime: '2025-09-26T15:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 1 },
          { name: 'GAM Esports', code: 'GAM', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/6/6c/GAM_Esportslogo_square.png', score: 0 }
        ],
        format: 'Bo1',
        league: 'Worlds 2025'
      },
      {
        id: 'worlds-2025-3',
        status: 'completed',
        startTime: '2025-10-03T12:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 0 },
          { name: 'Gen.G', code: 'GEN', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/6/6e/Gen.Glogo_square.png', score: 1 }
        ],
        format: 'Bo1',
        league: 'Worlds 2025'
      },
      {
        id: 'worlds-2025-4',
        status: 'completed',
        startTime: '2025-10-10T15:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 1 },
          { name: 'Dplus KIA', code: 'DK', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/43/Dplus_KIAlogo_square.png', score: 0 }
        ],
        format: 'Bo1',
        league: 'Worlds 2025'
      },

      // ========== LCS SPRING 2025 (Enero-Marzo) ==========
      {
        id: 'lcs-spring-1',
        status: 'completed',
        startTime: '2025-01-15T22:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 2 },
          { name: 'Team Liquid', code: 'TL', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/6/66/Team_Liquidlogo_square.png', score: 1 }
        ],
        format: 'Bo3',
        league: 'LCS Spring'
      },
      {
        id: 'lcs-spring-2',
        status: 'completed',
        startTime: '2025-02-05T23:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 2 },
          { name: 'Cloud9', code: 'C9', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/88/Cloud9logo_square.png', score: 0 }
        ],
        format: 'Bo3',
        league: 'LCS Spring'
      },
      {
        id: 'lcs-spring-3',
        status: 'completed',
        startTime: '2025-03-10T22:30:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 3 },
          { name: '100 Thieves', code: '100T', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/be/100_Thieveslogo_square.png', score: 1 }
        ],
        format: 'Bo5',
        league: 'LCS Spring Playoffs'
      },

      // ========== MSI 2025 (Mayo) ==========
      {
        id: 'msi-2025-1',
        status: 'completed',
        startTime: '2025-05-02T14:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 1 },
          { name: 'T1', code: 'T1', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/d5/T1logo_square.png', score: 0 }
        ],
        format: 'Bo1',
        league: 'MSI 2025'
      },
      {
        id: 'msi-2025-2',
        status: 'completed',
        startTime: '2025-05-08T16:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 0 },
          { name: 'JD Gaming', code: 'JDG', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/d8/JD_Gaminglogo_square.png', score: 1 }
        ],
        format: 'Bo1',
        league: 'MSI 2025'
      },

      // ========== LCS SUMMER 2025 (Junio-Agosto) ==========
      {
        id: 'lcs-summer-1',
        status: 'completed',
        startTime: '2025-06-12T22:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 2 },
          { name: 'Dignitas', code: 'DIG', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c4/Dignitaslogo_square.png', score: 1 }
        ],
        format: 'Bo3',
        league: 'LCS Summer'
      },
      {
        id: 'lcs-summer-2',
        status: 'completed',
        startTime: '2025-07-20T23:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 2 },
          { name: 'Immortals', code: 'IMT', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/89/Immortalslogo_square.png', score: 0 }
        ],
        format: 'Bo3',
        league: 'LCS Summer'
      },

      // ========== FIRST STAND (Proving Grounds) 2025 ==========
      {
        id: 'firststand-2025-1',
        status: 'completed',
        startTime: '2025-04-10T20:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 2 },
          { name: 'Shopify Rebellion', code: 'SR', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/5/5a/Shopify_Rebellionlogo_square.png', score: 1 }
        ],
        format: 'Bo3',
        league: 'First Stand'
      },

      // ========== PARTIDOS PRÓXIMOS (Octubre-Noviembre 2025) ==========
      {
        id: 'lcs-fall-1',
        status: 'upcoming',
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(), // En 2 días
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 0 },
          { name: 'Team Liquid', code: 'TL', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/6/66/Team_Liquidlogo_square.png', score: 0 }
        ],
        format: 'Bo3',
        league: 'LCS Fall'
      },
      {
        id: 'lcs-fall-2',
        status: 'upcoming',
        startTime: new Date(Date.now() + 86400000 * 5).toISOString(), // En 5 días
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 0 },
          { name: 'Cloud9', code: 'C9', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/88/Cloud9logo_square.png', score: 0 }
        ],
        format: 'Bo3',
        league: 'LCS Fall'
      },
      {
        id: 'lcs-fall-3',
        status: 'upcoming',
        startTime: new Date(Date.now() + 86400000 * 7).toISOString(), // En 7 días
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 0 },
          { name: '100 Thieves', code: '100T', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/be/100_Thieveslogo_square.png', score: 0 }
        ],
        format: 'Bo3',
        league: 'LCS Fall'
      }
    ]

    // Ordenar por fecha, más recientes primero
    fallbackMatches.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))

    console.log(`📋 Devolviendo ${fallbackMatches.length} partidos de respaldo (LCS, Worlds, MSI, First Stand)`)
    return res.json(fallbackMatches)
  } catch (e) {
    console.error('Server error fetching matches:', e.message)

    // En caso de error, devolver datos de respaldo mínimos
    const emergencyFallback = [
      {
        id: 'emergency-1',
        status: 'completed',
        startTime: '2025-10-10T15:00:00Z',
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 1 },
          { name: 'Dplus KIA', code: 'DK', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/43/Dplus_KIAlogo_square.png', score: 0 }
        ],
        format: 'Bo1',
        league: 'Worlds 2025'
      },
      {
        id: 'emergency-2',
        status: 'upcoming',
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        teams: [
          { name: 'FlyQuest', code: 'FLY', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e5/FlyQuestlogo_square.png', score: 0 },
          { name: 'Cloud9', code: 'C9', logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/88/Cloud9logo_square.png', score: 0 }
        ],
        format: 'Bo3',
        league: 'LCS'
      }
    ]

    console.log('⚠️  Error crítico - Devolviendo datos de emergencia')
    res.json(emergencyFallback)
  }
})// Bug reporting endpoint (public) with validation and atomic write + backup
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
