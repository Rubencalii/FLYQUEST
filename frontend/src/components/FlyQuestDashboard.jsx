import React, { useEffect, useState, useCallback } from 'react'
import useLanguage from '../hooks/useLanguage'
import FlyQuestRoster from './FlyQuestRoster'
import FooterFlyQuest from './FooterFlyQuest'
import BugReport from './BugReport'
import AdminDashboard from './AdminDashboard'

function MatchCard({ match, timezone }) {
  const [hovered, setHovered] = useState(false)

  const startLocal = new Date(match.startTime).toLocaleString(undefined, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  })

  return (
    <div
      className="card mb-3 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {match.teams.map((t) => (
            <div key={t.name} className="flex items-center gap-2">
              <img src={t.logo} alt={t.name} className="w-10 h-10 rounded-md" />
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-flyquest-gray">Score: {t.score ?? '-'}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right">
          <div className="font-medium">{match.status}</div>
          <div className="text-sm text-flyquest-gray">{startLocal}</div>
        </div>
      </div>

      {hovered && (
        <div className="mt-3 text-sm text-flyquest-gray">
          <div>Format: {match.format || 'BO1'}</div>
          <div>Start (UTC): {match.startTime}</div>
        </div>
      )}
    </div>
  )
}

export default function FlyQuestDashboard() {
  const { lang, toggleLanguage, t } = useLanguage()
  const [matches, setMatches] = useState([])
  const [timezone, setTimezone] = useState('local')
  const [tzList, setTzList] = useState([])
  const [dark, setDark] = useState(false)
  const [logos, setLogos] = useState({})
  const [showBugForm, setShowBugForm] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [rosterData, setRosterData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/flyquest/matches')

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      setMatches(data)
      console.log('Matches loaded:', data.length)
    } catch (e) {
      console.error('fetch matches error:', e)
      setError(e.message || 'Error al cargar partidos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
    const iv = setInterval(fetchMatches, 30000)
    return () => clearInterval(iv)
  }, [fetchMatches])

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    // small list for selector
    setTzList([tz, 'UTC', 'America/Los_Angeles', 'Europe/Madrid'])
  }, [])

  useEffect(() => {
    fetch('/teamLogos.json')
      .then((r) => r.json())
      .then(setLogos)
      .catch((e) => console.error('load logos', e))

    // also prefetch roster summary for admin
    fetch('/rosterFlyQuest.json')
      .then((r) => r.json())
      .then((d) => setRosterData(d))
      .catch(() => { })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const handleShare = async (match) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FlyQuest vs ${match.teams.find((x) => x.name !== 'FlyQuest')?.name}`,
          text: `Result: ${match.teams.map((t) => `${t.name} ${t.score}`).join(' vs ')}`
        })
      } catch (e) {
        console.error('share failed', e)
      }
    } else {
      alert('Sharing not supported on this browser')
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-flyquest-white to-white">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img src={logos.FlyQuest || 'https://upload.wikimedia.org/wikipedia/en/f/f7/FlyQuestlogo.png'} alt="FlyQuest" className="w-12 h-12" />
          <h1 className="text-2xl font-bold">FlyQuest Dashboard</h1>
          <div className="text-sm text-flyquest-gray ml-3">Horario mostrado en: {timezone}</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleLanguage} className="px-3 py-2 rounded-2xl card">
            {lang === 'es' ? 'ES 🇪🇸' : 'EN 🇺🇸'}
          </button>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="px-3 py-2 rounded-2xl card">
            {tzList.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <button onClick={fetchMatches} className="px-3 py-2 rounded-2xl card">{t.refresh}</button>
          <button onClick={() => setDark((d) => !d)} className="px-3 py-2 rounded-2xl card">{dark ? '☀️' : '🌙'}</button>
          <button onClick={() => setShowBugForm((s) => !s)} className="px-3 py-2 rounded-2xl card">Reportar fallo</button>
          <button onClick={() => setShowAdmin((s) => !s)} className="px-3 py-2 rounded-2xl bg-flyquest-blue text-white">Admin</button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">{t.matches}</h2>

          {loading && (
            <div className="card text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flyquest-blue mx-auto mb-3"></div>
              <p>Cargando partidos...</p>
            </div>
          )}

          {error && (
            <div className="card bg-red-50 border-red-200 text-red-800">
              <p className="font-semibold">⚠️ Error al cargar partidos</p>
              <p className="text-sm mt-2">{error}</p>
              <button
                onClick={fetchMatches}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            <div>
              {matches.length === 0 && (
                <div className="card">
                  <p className="text-center py-4">
                    📅 No hay partidos de FlyQuest programados próximamente
                  </p>
                </div>
              )}
              {matches.map((m) => (
                <div key={m.id} className="relative">
                  <MatchCard match={m} timezone={timezone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone} />
                  <div className="absolute right-2 top-2 flex gap-2">
                    <button onClick={() => handleShare(m)} className="px-2 py-1 rounded-md card">Share</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside>
          <h2 className="text-xl font-semibold mb-3">{t.roster}</h2>
          <div className="card">
            <FlyQuestRoster />
          </div>
          {showBugForm && <div className="mt-4"><BugReport /></div>}
          {showAdmin && <div className="mt-4"><AdminDashboard matches={matches} roster={rosterData?.roster} /></div>}
        </aside>
      </main>

      <FooterFlyQuest t={t} />
    </div>
  )
}
