import React, { useEffect, useState, useCallback, useMemo } from 'react'
import useLanguage from '../hooks/useLanguage'
import FlyQuestRoster from './FlyQuestRoster'
import FooterFlyQuest from './FooterFlyQuest'
import BugReport from './BugReport'
import AdminDashboard from './AdminDashboard'

function MatchCard({ match, timezone, showDate = false }) {
  const [hovered, setHovered] = useState(false)
  const [imageErrors, setImageErrors] = useState({})

  const matchDate = new Date(match.startTime)
  const startLocal = matchDate.toLocaleString(undefined, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  })

  const dateLabel = matchDate.toLocaleDateString(undefined, {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Función para generar link de Google Calendar
  const generateGoogleCalendarLink = () => {
    const startTime = new Date(match.startTime)
    // Duración estimada: 1 hora para BO1, 2 horas para BO3, 3 horas para BO5
    const durationHours = match.format === 'bo5' ? 3 : match.format === 'bo3' ? 2 : 1
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000)

    // Formatear fechas para Google Calendar (formato: YYYYMMDDTHHmmssZ)
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const opponent = match.teams.find(t => !t.name.toLowerCase().includes('flyquest'))?.name || 'TBD'
    const title = encodeURIComponent(`FlyQuest vs ${opponent} - ${match.league || 'LoL Esports'}`)
    const details = encodeURIComponent(`
🎮 ${match.league || 'League of Legends'}
⚔️ FlyQuest vs ${opponent}
📊 Formato: ${match.format?.toUpperCase() || 'BO1'}
🔗 Ver en: https://lolesports.com/live/lcs
    `.trim())
    const location = encodeURIComponent('Online - lolesports.com')

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=${details}&location=${location}&sf=true&output=xml`
  }

  // Determinar el estado del partido
  const getStatusBadge = () => {
    if (match.status === 'completed') {
      return { text: '✅ Completado', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50' }
    }
    if (match.status === 'inProgress') {
      return { text: '🔴 EN VIVO', bg: 'bg-red-500 animate-pulse', glow: 'shadow-red-500/50 neon-glow' }
    }
    if (match.status === 'unstarted' || match.status === 'upcoming') {
      return { text: '⏰ Próximo', bg: 'bg-blue-500', glow: 'shadow-blue-500/50' }
    }
    return { text: match.status, bg: 'bg-gray-500', glow: '' }
  }

  const statusBadge = getStatusBadge()
  const isFlyQuestMatch = match.teams.some(t => t.name.toLowerCase().includes('flyquest'))

  return (
    <>
      {showDate && (
        <div className="mt-6 mb-4 animate-slide-in">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-flyquest-green/30 dark:border-flyquest-neon/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-flyquest-black dark:via-flyquest-dark dark:to-flyquest-black px-6 py-2 text-sm font-bold text-flyquest-green dark:text-flyquest-neon uppercase tracking-wider border border-flyquest-green/30 dark:border-flyquest-neon/30 rounded-full">
                📅 {dateLabel}
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        className={`card mb-4 cursor-pointer relative overflow-hidden group animate-fade-in ${isFlyQuestMatch ? 'border-2 border-flyquest-green/50 dark:border-flyquest-neon/50 scan-effect' : ''
          }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Efecto de brillo de fondo */}
        {isFlyQuestMatch && (
          <div className="absolute inset-0 bg-gradient-to-r from-flyquest-green/5 via-transparent to-flyquest-green/5 dark:from-flyquest-neon/5 dark:via-transparent dark:to-flyquest-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}

        <div className="relative z-10">
          {/* Badge de estado flotante */}
          <div className="absolute -top-2 -right-2 z-20">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${statusBadge.bg} shadow-lg ${statusBadge.glow}`}>
              {statusBadge.text}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-between pt-2 gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6 flex-1">
              {match.teams.map((t, idx) => (
                <React.Fragment key={t.name}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`relative ${t.name.toLowerCase().includes('flyquest') ? 'animate-pulse-slow' : ''} flex-shrink-0`}>
                      {t.logo && !imageErrors[t.name] ? (
                        <img
                          src={t.logo}
                          alt={t.name}
                          className="w-12 h-12 rounded-lg object-contain bg-white/5 p-1 transition-transform duration-300 group-hover:scale-110"
                          onError={() => {
                            console.warn(`❌ Error al cargar logo de ${t.name}:`, t.logo)
                            setImageErrors(prev => ({ ...prev, [t.name]: true }))
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 dark:from-flyquest-dark to-flyquest-darker flex items-center justify-center font-bold text-white dark:text-flyquest-neon text-sm border-2 border-gray-600 dark:border-flyquest-neon/30 shadow-lg">
                          {t.code || t.name.substring(0, 3).toUpperCase()}
                        </div>
                      )}
                      {t.name.toLowerCase().includes('flyquest') && (
                        <div className="absolute inset-0 rounded-lg bg-flyquest-green/20 dark:bg-flyquest-neon/20 blur-xl"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base text-flyquest-green dark:text-flyquest-neon">
                        {t.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-flyquest-green dark:text-flyquest-neon">{t.score ?? '-'}</span>
                        {match.status === 'completed' && t.score > (match.teams[1 - idx]?.score ?? 0) && (
                          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500">👑 WINNER</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="hidden md:flex text-2xl font-black text-gray-300 dark:text-flyquest-gray/30 mx-2 items-center self-center">VS</div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-right ml-6">
              <div className="text-sm font-medium text-gray-600 dark:text-flyquest-gray">{startLocal}</div>
              {match.league && (
                <div className="text-xs font-semibold text-flyquest-green dark:text-flyquest-neon/80 mt-1 px-2 py-0.5 bg-flyquest-green/10 dark:bg-flyquest-neon/10 rounded inline-block">
                  {match.league}
                </div>
              )}
            </div>
          </div>

          {hovered && (
            <div className="mt-4 pt-4 border-t border-flyquest-green/20 dark:border-flyquest-neon/20 animate-fade-in">
              <div className="flex justify-between items-center text-sm flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-flyquest-gray">Formato:</span>
                  <span className="font-bold text-flyquest-green dark:text-flyquest-neon">{match.format || 'BO1'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-flyquest-gray">UTC:</span>
                  <span className="font-mono text-gray-800 dark:text-flyquest-white">{new Date(match.startTime).toUTCString().slice(17, 22)}</span>
                </div>
              </div>
              
              {/* Links de partido/VOD */}
              <div className="mt-3 flex gap-2 flex-wrap">
                {match.status === 'inProgress' && (
                  <a
                    href="https://lolesports.com/live/lcs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg animate-pulse"
                  >
                    🔴 Ver EN VIVO
                  </a>
                )}
                {match.status === 'completed' && (
                  <>
                    <a
                      href={`https://www.youtube.com/@lolesports/videos`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                    >
                      ▶️ Ver VOD (YouTube)
                    </a>
                    <a
                      href={`https://www.twitch.tv/lcs/videos`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                    >
                      🎮 Ver VOD (Twitch)
                    </a>
                  </>
                )}
                {(match.status === 'unstarted' || match.status === 'upcoming') && (
                  <>
                    <a
                      href="https://lolesports.com/schedule"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                    >
                      📅 Ver en Calendario
                    </a>
                    <a
                      href={generateGoogleCalendarLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                    >
                      🗓️ Añadir a Google Calendar
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'week', 'month'
  const [leagueFilter, setLeagueFilter] = useState('all') // 'all', 'lcs', 'worlds', 'msi', 'firststand'
  const [headerLogoError, setHeaderLogoError] = useState(false)

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/flyquest/matches')

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()

      // Verificar si la API está en modo fallback (PandaScore caída)
      if (data.fallback || data.apiError) {
        const message = data.message || data.apiError || 'La API de PandaScore está temporalmente fuera de servicio'
        setError(message)
        setMatches([])
        console.warn('⚠️ API en modo fallback:', message)
        return
      }

      // Manejar ambos formatos: array directo o objeto con propiedad matches
      let matchesData = []
      let apiMessage = null

      if (Array.isArray(data)) {
        matchesData = data
      } else if (data.matches && Array.isArray(data.matches)) {
        matchesData = data.matches
        apiMessage = data.message
      } else {
        // Si no hay estructura esperada
        matchesData = []
        apiMessage = data.message
      }

      setMatches(matchesData)
      console.log('✅ Partidos cargados:', matchesData.length)

      if (matchesData.length === 0 && apiMessage) {
        setError(apiMessage)
      } else if (matchesData.length === 0) {
        setError('No hay partidos de FlyQuest disponibles en este momento')
      }
    } catch (e) {
      console.error('❌ Error al cargar partidos:', e)
      setError('Error al conectar con el servidor. Por favor, verifica tu conexión.')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Cargar logos (no bloqueante)
    fetch('/teamLogos.json')
      .then((r) => r.json())
      .then(setLogos)
      .catch((e) => {
        console.error('Error al cargar logos:', e)
        setLogos({}) // Continuar sin logos personalizados
      })

    // also prefetch roster summary for admin
    fetch('/rosterFlyQuest.json')
      .then((r) => r.json())
      .then((d) => setRosterData(d))
      .catch(() => { })

    // Cargar partidos inmediatamente (no esperar logos)
    fetchMatches()
    const iv = setInterval(fetchMatches, 30000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    // small list for selector - usar Set para evitar duplicados
    const uniqueTimezones = [...new Set([tz, 'UTC', 'America/Los_Angeles', 'Europe/Madrid'])]
    setTzList(uniqueTimezones)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Combinar partidos con logos personalizados (priorizar API, luego personalizados, luego fallback)
  const matchesWithLogos = useMemo(() => {
    return matches.map(match => ({
      ...match,
      teams: match.teams.map(team => {
        // Prioridad: 1) Logo de API, 2) Logo personalizado, 3) Sin logo (se manejará con fallback)
        let finalLogo = team.logo || logos[team.name] || null
        
        // Si el logo es de lolesports, usar el proxy de Akamai para mejor rendimiento
        if (finalLogo && finalLogo.includes('static.lolesports.com')) {
          finalLogo = `https://am-a.akamaihd.net/image?resize=60:&f=${encodeURIComponent(finalLogo)}`
        }
        
        return {
          ...team,
          logo: finalLogo
        }
      })
    }))
  }, [matches, logos])

  // Función para filtrar partidos por fecha y liga
  const getFilteredMatches = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    let filtered = [...matchesWithLogos]

    // Filtrar por fecha
    if (dateFilter === 'week') {
      filtered = filtered.filter(m => {
        const matchDate = new Date(m.startTime)
        return matchDate >= startOfWeek && matchDate < endOfWeek
      })
    } else if (dateFilter === 'month') {
      filtered = filtered.filter(m => {
        const matchDate = new Date(m.startTime)
        return matchDate >= startOfMonth && matchDate <= endOfMonth
      })
    }

    // Filtrar por liga/competición
    if (leagueFilter !== 'all') {
      filtered = filtered.filter(m => {
        const league = m.league?.toLowerCase() || ''

        switch (leagueFilter) {
          case 'lcs':
            return league.includes('lcs') && !league.includes('worlds') && !league.includes('msi')
          case 'worlds':
            return league.includes('worlds') || league.includes('world')
          case 'msi':
            return league.includes('msi')
          case 'firststand':
            return league.includes('first') || league.includes('proving')
          default:
            return true
        }
      })
    }

    // Ordenar por fecha: más recientes primero (descendente)
    return filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }

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
    <div className="min-h-screen p-6">
      {/* Header espectacular con efecto glassmorphism */}
      <header className="card mb-8 p-6 relative overflow-hidden animate-slide-in border-2 border-flyquest-green/30 dark:border-flyquest-neon/30">
        {/* Efecto de brillo de fondo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-flyquest-green to-transparent dark:via-flyquest-neon"></div>

        <div className="flex items-center justify-between relative z-10 flex-col md:flex-row gap-4 md:gap-0">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative">
              {!headerLogoError ? (
                <img
                  src={logos.FlyQuest || 'https://upload.wikimedia.org/wikipedia/en/f/f7/FlyQuestlogo.png'}
                  alt="FlyQuest"
                  className="w-16 h-16 animate-pulse-slow drop-shadow-2xl object-contain"
                  onError={() => {
                    console.warn('❌ Error al cargar logo principal de FlyQuest')
                    setHeaderLogoError(true)
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-flyquest-green to-flyquest-neon rounded-xl flex items-center justify-center font-black text-white text-2xl animate-pulse-slow drop-shadow-2xl">
                  FQ
                </div>
              )}
              <div className="absolute inset-0 bg-flyquest-green/20 dark:bg-flyquest-neon/30 blur-2xl rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-flyquest-green via-emerald-600 to-flyquest-green dark:from-flyquest-neon dark:via-flyquest-green dark:to-flyquest-neon truncate">
                FlyQuest Dashboard
              </h1>
              <div className="text-sm text-gray-600 dark:text-flyquest-gray mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-flyquest-green dark:bg-flyquest-neon rounded-full animate-pulse"></span>
                Horario: <span className="font-semibold text-flyquest-green dark:text-flyquest-neon">{timezone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-flyquest-dark/50 hover:bg-flyquest-green/10 dark:hover:bg-flyquest-neon/20 border border-flyquest-green/30 dark:border-flyquest-neon/30 text-gray-800 dark:text-flyquest-white font-semibold transition-all hover:scale-105 hover:shadow-lg"
            >
              {lang === 'es' ? 'ES 🇪🇸' : 'EN 🇺🇸'}
            </button>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-flyquest-dark/50 border border-flyquest-green/30 dark:border-flyquest-neon/30 text-gray-800 dark:text-flyquest-white font-medium cursor-pointer hover:border-flyquest-green/50 dark:hover:border-flyquest-neon/50 transition-all"
            >
              {tzList.map((tz) => (
                <option key={tz} value={tz} className="bg-white dark:bg-flyquest-darker">
                  {tz}
                </option>
              ))}
            </select>
            <button
              onClick={fetchMatches}
              className="px-4 py-2 rounded-xl bg-flyquest-green/10 dark:bg-flyquest-neon/10 hover:bg-flyquest-green/20 dark:hover:bg-flyquest-neon/20 border border-flyquest-green/50 dark:border-flyquest-neon/50 text-flyquest-green dark:text-flyquest-neon font-bold transition-all hover:scale-105 hover:shadow-lg"
            >
              🔄 {t.refresh}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-flyquest-dark/50 hover:bg-flyquest-green/10 dark:hover:bg-flyquest-neon/20 border border-flyquest-green/30 dark:border-flyquest-neon/30 text-2xl transition-all hover:scale-110 hover:rotate-180 duration-500"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowBugForm((s) => !s)}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400 font-semibold transition-all hover:scale-105"
            >
              🐛 Reportar
            </button>
            <button
              onClick={() => setShowAdmin((s) => !s)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-flyquest-green to-emerald-500 dark:from-flyquest-neon dark:to-flyquest-green text-white dark:text-flyquest-black font-bold transition-all hover:scale-105 hover:shadow-lg"
            >
              ⚙️ Admin
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2">
          {/* Sección de filtros espectacular */}
          <div className="card p-6 mb-6 animate-slide-in border border-flyquest-green/20 dark:border-flyquest-neon/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-flyquest-green to-emerald-600 dark:from-flyquest-neon dark:to-flyquest-green">
                ⚔️ {t.matches}
              </h2>

              {/* Contador animado */}
              {matches.length > 0 && (
                <div className="px-4 py-2 bg-flyquest-green/10 dark:bg-flyquest-neon/10 border border-flyquest-green/30 dark:border-flyquest-neon/30 rounded-full">
                  <span className="text-sm font-bold text-flyquest-green dark:text-flyquest-neon">
                    {getFilteredMatches().length} / {matches.length} partidos
                  </span>
                </div>
              )}
            </div>

            {/* Filtro de fechas con diseño gaming */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setDateFilter('all')}
                className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 ${dateFilter === 'all'
                  ? 'bg-gradient-to-r from-flyquest-green to-emerald-500 dark:from-flyquest-neon dark:to-flyquest-green text-white dark:text-flyquest-black shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50 border border-flyquest-green/20 dark:border-flyquest-neon/20 hover:border-flyquest-green/50 dark:hover:border-flyquest-neon/50'
                  }`}
              >
                {dateFilter === 'all' && <span className="absolute inset-0 rounded-xl bg-flyquest-green/20 dark:bg-flyquest-neon/20 blur-xl"></span>}
                <span className="relative flex items-center gap-2">
                  📅 Todos
                </span>
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 ${dateFilter === 'week'
                  ? 'bg-gradient-to-r from-flyquest-green to-emerald-500 dark:from-flyquest-neon dark:to-flyquest-green text-white dark:text-flyquest-black shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50 border border-flyquest-green/20 dark:border-flyquest-neon/20 hover:border-flyquest-green/50 dark:hover:border-flyquest-neon/50'
                  }`}
              >
                {dateFilter === 'week' && <span className="absolute inset-0 rounded-xl bg-flyquest-green/20 dark:bg-flyquest-neon/20 blur-xl"></span>}
                <span className="relative flex items-center gap-2">
                  📆 Esta semana
                </span>
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 ${dateFilter === 'month'
                  ? 'bg-gradient-to-r from-flyquest-green to-emerald-500 dark:from-flyquest-neon dark:to-flyquest-green text-white dark:text-flyquest-black shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50 border border-flyquest-green/20 dark:border-flyquest-neon/20 hover:border-flyquest-green/50 dark:hover:border-flyquest-neon/50'
                  }`}
              >
                {dateFilter === 'month' && <span className="absolute inset-0 rounded-xl bg-flyquest-green/20 dark:bg-flyquest-neon/20 blur-xl"></span>}
                <span className="relative flex items-center gap-2">
                  🗓️ Este mes
                </span>
              </button>
            </div>

            {/* Filtro de competiciones */}
            <div className="mt-4 pt-4 border-t border-flyquest-green/20 dark:border-flyquest-neon/20">
              <h3 className="text-sm font-bold text-flyquest-green dark:text-flyquest-neon mb-3 uppercase tracking-wider">
                🏆 Competición
              </h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setLeagueFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${leagueFilter === 'all'
                    ? 'bg-flyquest-green dark:bg-flyquest-neon text-white dark:text-flyquest-black shadow-lg'
                    : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50'
                    }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setLeagueFilter('lcs')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${leagueFilter === 'lcs'
                    ? 'bg-flyquest-green dark:bg-flyquest-neon text-white dark:text-flyquest-black shadow-lg'
                    : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50'
                    }`}
                >
                  LCS
                </button>
                <button
                  onClick={() => setLeagueFilter('worlds')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${leagueFilter === 'worlds'
                    ? 'bg-flyquest-green dark:bg-flyquest-neon text-white dark:text-flyquest-black shadow-lg'
                    : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50'
                    }`}
                >
                  Worlds
                </button>
                <button
                  onClick={() => setLeagueFilter('msi')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${leagueFilter === 'msi'
                    ? 'bg-flyquest-green dark:bg-flyquest-neon text-white dark:text-flyquest-black shadow-lg'
                    : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50'
                    }`}
                >
                  MSI
                </button>
                <button
                  onClick={() => setLeagueFilter('firststand')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${leagueFilter === 'firststand'
                    ? 'bg-flyquest-green dark:bg-flyquest-neon text-white dark:text-flyquest-black shadow-lg'
                    : 'bg-gray-100 dark:bg-flyquest-dark/30 text-gray-700 dark:text-flyquest-white hover:bg-gray-200 dark:hover:bg-flyquest-dark/50'
                    }`}
                >
                  First Stand
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="card text-center py-12 border-2 border-flyquest-neon/30 animate-pulse">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-flyquest-neon/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-flyquest-neon rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-transparent border-t-flyquest-green rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="text-xl font-bold text-flyquest-neon animate-pulse">Cargando partidos...</p>
              <p className="text-sm text-flyquest-gray mt-2">Conectando con LoL Esports API</p>
            </div>
          )}

          {error && (
            <div className="card border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-600/5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                  <p className="font-bold text-xl text-red-400 mb-2">Error al cargar partidos</p>
                  <p className="text-sm text-flyquest-gray mb-4">{error}</p>
                  <button
                    onClick={fetchMatches}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-red-500/50"
                  >
                    🔄 Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div>
              {getFilteredMatches().length === 0 && (
                <div className="card text-center py-16 border-2 border-flyquest-green/20 dark:border-flyquest-neon/20 animate-fade-in relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-flyquest-green/5 to-transparent dark:from-flyquest-neon/5 dark:to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-7xl mb-4 animate-bounce-slow">📅</div>
                    <p className="text-2xl font-bold text-flyquest-green dark:text-flyquest-neon mb-2">
                      No hay partidos
                      {dateFilter === 'week' && ' esta semana'}
                      {dateFilter === 'month' && ' este mes'}
                      {dateFilter === 'all' && ' programados'}
                    </p>
                    <p className="text-gray-600 dark:text-flyquest-gray">Intenta con otro filtro de fecha</p>
                  </div>
                </div>
              )}
              {getFilteredMatches().map((m, index, arr) => {
                // Detectar si este partido es el primero del día
                const currentDate = new Date(m.startTime).toLocaleDateString();
                const prevDate = index > 0 ? new Date(arr[index - 1].startTime).toLocaleDateString() : null;
                const showDate = currentDate !== prevDate;

                return (
                  <div key={m.id} className="relative">
                    <MatchCard
                      match={m}
                      timezone={timezone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone}
                      showDate={showDate}
                    />
                    <div className="absolute right-4 top-4 z-20 flex gap-2">
                      <button
                        onClick={() => handleShare(m)}
                        className="px-3 py-2 rounded-lg bg-flyquest-neon/10 hover:bg-flyquest-neon/20 border border-flyquest-neon/30 text-flyquest-neon font-semibold text-sm transition-all hover:scale-110"
                      >
                        🔗 Compartir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          {/* Roster con diseño mejorado */}
          <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-flyquest-green to-emerald-600 dark:from-flyquest-neon dark:to-flyquest-green mb-4 flex items-center gap-2">
              👥 {t.roster}
            </h2>
            <div className="card border-2 border-flyquest-green/20 dark:border-flyquest-neon/20 hover:border-flyquest-green/40 dark:hover:border-flyquest-neon/40 transition-all">
              <FlyQuestRoster />
            </div>
          </div>

          {showBugForm && (
            <div className="animate-slide-in">
              <div className="card border-2 border-red-500/30">
                <BugReport />
              </div>
            </div>
          )}

          {showAdmin && (
            <div className="animate-slide-in">
              <div className="card border-2 border-flyquest-neon/30">
                <AdminDashboard matches={matches} roster={rosterData?.roster} />
              </div>
            </div>
          )}
        </aside>
      </main>

      <FooterFlyQuest t={t} />
    </div>
  )
}
