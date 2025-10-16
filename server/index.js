const express = require('express')
const fetch = require('node-fetch')
const cors = require('cors')
const app = express()
app.use(cors())

const RIOT_API_KEY = process.env.RIOT_API_KEY || 'REPLACE_WITH_YOUR_KEY'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin_secret_token'
const fs = require('fs')
const path = require('path')
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
    const url = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?leagueId=98767991299243165'
    const r = await fetch(url, { headers: { 'x-api-key': RIOT_API_KEY } })
    if (!r.ok) return res.status(502).json({ error: 'upstream error' })
    const json = await r.json()

    // navigate the payload safely
    const events = json.data?.schedule?.events || []
    const matches = []

    for (const ev of events) {
      const competitors = ev.match?.teams || []
      if (!competitors) continue

      const hasFly = competitors.some((c) => c.name && c.name.toLowerCase().includes('flyquest'))
      if (!hasFly) continue

      const teams = competitors.map((c) => ({
        name: c.name,
        logo: c.image || '',
        score: c.result?.gameWins ?? 0
      }))

      matches.push({
        id: ev.id || ev.match?.id || `${ev.startTime}`,
        status: ev.state || ev.match?.state || 'unknown',
        startTime: ev.startTime || ev.match?.startTime,
        teams,
        format: ev.match?.format
      })
    }

    res.json(matches)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'server error' })
  }
})

// Bug reporting endpoint (public)
app.post('/api/flyquest/bugs', express.json(), (req, res) => {
  try {
    const { title, description, url, severity } = req.body
    if (!title || !description) return res.status(400).json({ error: 'title and description required' })

    const bugs = JSON.parse(fs.readFileSync(bugsFile, 'utf8') || '[]')
    const id = `bug_${Date.now()}`
    const entry = { id, title, description, url: url || null, severity: severity || 'low', createdAt: new Date().toISOString() }
    bugs.unshift(entry)
    fs.writeFileSync(bugsFile, JSON.stringify(bugs, null, 2))
    res.status(201).json(entry)
  } catch (e) {
    console.error('save bug', e)
    res.status(500).json({ error: 'could not save' })
  }
})

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

const port = process.env.PORT || 4000
app.listen(port, () => console.log('Server running on', port))
