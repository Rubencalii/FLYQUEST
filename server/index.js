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
    // Configuración de ligas - IDs oficiales de Riot para 2025
    // Fuente: https://esports-api.lolesports.com/persisted/gw/getLeagues?hl=en-US
    const leagues = [
      { id: '98767975604431411', name: 'Worlds 2025' },           // World Championship
      { id: '98767991299243165', name: 'LCS' },                   // LCS North America
      { id: '107898214974993351', name: 'MSI 2025' },             // Mid-Season Invitational
      { id: '98767991302996019', name: 'LEC' },                   // LEC Europe
      { id: '98767991310872058', name: 'LCK' },                   // LCK Korea
      { id: '98767991314006698', name: 'LPL' },                   // LPL China
      { id: '105709090213554609', name: 'CBLOL' },                // Brazil
      { id: '105266108767593290', name: 'LLA' },                  // Latin America
      { id: '110988878756156222', name: 'LCS Championship' },     // LCS Playoffs
    ]

    let allMatches = []
    const errors = []

    // Intentar obtener partidos de todas las ligas
    for (const league of leagues) {
      try {
        const url = `https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=${league.id}`

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://lolesports.com',
            'Referer': 'https://lolesports.com/',
          },
          timeout: 5000
        })

        if (!response.ok) {
          console.log(`⚠️  ${league.name}: HTTP ${response.status}`)
          errors.push({ league: league.name, error: `HTTP ${response.status}` })
          continue
        }

        const data = await response.json()
        const events = data?.data?.schedule?.events || []

        // Filtrar solo partidos de FlyQuest
        const flyQuestMatches = events.filter(event => {
          const teams = event.match?.teams || []
          return teams.some(team =>
            team.name?.toLowerCase().includes('flyquest') ||
            team.code?.toLowerCase().includes('fly')
          )
        })

        // Transformar a nuestro formato
        for (const event of flyQuestMatches) {
          const teams = (event.match?.teams || []).map(team => ({
            name: team.name || 'Unknown',
            code: team.code || team.name?.substring(0, 3).toUpperCase() || 'TBD',
            logo: team.image || '',
            score: team.result?.gameWins ?? 0
          }))

          allMatches.push({
            id: event.match?.id || event.id || `${league.id}-${event.startTime}`,
            status: event.state || 'unstarted', // unstarted, inProgress, completed
            startTime: event.startTime,
            teams,
            format: event.match?.strategy?.type || 'bestOf',
            league: league.name
          })
        }

        if (flyQuestMatches.length > 0) {
          console.log(`✅ ${league.name}: ${flyQuestMatches.length} partidos`)
        }

      } catch (err) {
        console.log(`❌ ${league.name}: ${err.message}`)
        errors.push({ league: league.name, error: err.message })
      }
    }

    // Ordenar por fecha, más recientes primero
    allMatches.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))

    console.log(`\n📊 Total: ${allMatches.length} partidos de FlyQuest encontrados`)

    // Si no hay partidos, devolver mensaje informativo
    if (allMatches.length === 0) {
      console.log('⚠️  No se encontraron partidos de FlyQuest en ninguna liga')
      return res.json({
        matches: [],
        message: 'No hay partidos programados de FlyQuest en este momento',
        searchedLeagues: leagues.map(l => l.name),
        errors: errors.length > 0 ? errors : undefined
      })
    }

    return res.json(allMatches)

  } catch (e) {
    console.error('❌ Error del servidor:', e.message)
    return res.status(500).json({
      error: 'Error al obtener partidos',
      message: e.message,
      matches: []
    })
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
