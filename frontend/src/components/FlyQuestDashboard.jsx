import React, { useEffect, useState, useCallback, useMemo } from 'react'
import useLanguage from '../hooks/useLanguage'
import FooterFlyQuest from './FooterFlyQuest'
import BugReport from './BugReport'
import AdminDashboard from './AdminDashboard'
import FlyQuestStats from './FlyQuestStats'
import StatsBoard from './StatsBoard'
import NotificationManager from './NotificationManager'
import Achievements from './Achievements'
import AdvancedAlerts from './AdvancedAlerts'
import PlayerStats from './PlayerStats'

function MatchCard({ match, timezone, showDate = false, isFavorite = false, onToggleFavorite }) {
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
            <div className="flex flex-col items-end gap-2 ml-6">
              <div className="text-sm font-medium text-gray-600 dark:text-flyquest-gray">{startLocal}</div>
              {match.league && (
                <div className="text-xs font-semibold text-flyquest-green dark:text-flyquest-neon/80 px-2 py-0.5 bg-flyquest-green/10 dark:bg-flyquest-neon/10 rounded inline-block">
                  {match.league}
                </div>
              )}
              
              {/* Botones de acción rápida */}
              <div className="flex gap-2 mt-2">
                {/* Botón de Google Calendar para partidos futuros */}
                {(match.status === 'unstarted' || match.status === 'upcoming') && (
                  <a
                    href={generateGoogleCalendarLink()}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="group relative p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 hover:border-green-500/50 text-green-600 dark:text-green-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/20"
                    title="Añadir a Google Calendar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm2 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                    </svg>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Google Calendar
                    </div>
                  </a>
                )}
                
                {/* Botón de favorito */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite && onToggleFavorite(match.id)
                  }}
                  className={`group relative p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                    isFavorite 
                      ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border-yellow-500/30 hover:border-yellow-500/50 text-yellow-500 hover:shadow-yellow-500/20' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400'
                  }`}
                  title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isFavorite ? 'Quitar favorito' : 'Añadir favorito'}
                  </div>
                </button>
              </div>
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
                    <a
                      href={generateGoogleCalendarLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg animate-bounce"
                      title="Añadir este partido a Google Calendar"
                    >
                      🗓️ Google Calendar
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
  const [logos, setLogos] = useState({})
  const [showBugForm, setShowBugForm] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [rosterData, setRosterData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'week', 'month'
  const [leagueFilter, setLeagueFilter] = useState('all') // 'all', 'lcs', 'worlds', 'msi', 'firststand'
  const [headerLogoError, setHeaderLogoError] = useState(false)
  const [favorites, setFavorites] = useState([]) // IDs de partidos favoritos
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false) // Filtro de favoritos
  const [historicalMatches, setHistoricalMatches] = useState([]) // Datos históricos de Leaguepedia
  const [allMatches, setAllMatches] = useState([]) // Combina matches recientes + históricos

  // Cargar favoritos desde localStorage al iniciar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('flyquest_favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Error al cargar favoritos:', e)
        setFavorites([])
      }
    }
  }, [])

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('flyquest_favorites', JSON.stringify(favorites))
  }, [favorites])

  // Función para alternar favorito
  const toggleFavorite = useCallback((matchId) => {
    setFavorites(prev => {
      if (prev.includes(matchId)) {
        return prev.filter(id => id !== matchId)
      } else {
        return [...prev, matchId]
      }
    })
  }, [])

  // Verificar si un partido es favorito
  const isFavorite = useCallback((matchId) => {
    return favorites.includes(matchId)
  }, [favorites])

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

  const fetchHistoricalMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/flyquest/historical-matches')
      if (!res.ok) throw new Error('Historical fetch failed')
      const data = await res.json()
      const hist = Array.isArray(data.matches) ? data.matches : []
      setHistoricalMatches(hist)
      console.log('✅ Datos históricos:', hist.length, 'partidos')
    } catch (e) {
      console.warn('⚠️ No se pudieron cargar datos históricos:', e.message)
      setHistoricalMatches([])
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
    fetchHistoricalMatches() // Cargar datos históricos una vez
    const iv = setInterval(fetchMatches, 30000)
    return () => clearInterval(iv)
  }, [fetchMatches, fetchHistoricalMatches])

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    // small list for selector - usar Set para evitar duplicados
    const uniqueTimezones = [...new Set([tz, 'UTC', 'America/Los_Angeles', 'Europe/Madrid'])]
    setTzList(uniqueTimezones)
  }, [])

  // Forzar modo oscuro siempre
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Combinar partidos recientes y históricos para stats/achievements
  useEffect(() => {
    // Unir matches recientes (LoL Esports) con históricos (Leaguepedia)
    // Evitar duplicados por ID
    const recentIds = new Set(matches.map(m => m.id))
    const uniqueHistorical = historicalMatches.filter(h => !recentIds.has(h.id))
    const combined = [...matches, ...uniqueHistorical]
    setAllMatches(combined)
    console.log('📊 Total partidos para stats:', combined.length, '(recientes:', matches.length, '+ históricos:', uniqueHistorical.length, ')')
  }, [matches, historicalMatches])

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

    // Filtrar por favoritos
    if (showOnlyFavorites) {
      filtered = filtered.filter(m => favorites.includes(m.id))
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
    <div className="min-h-screen bg-gradient-to-br from-black via-flyquest-green to-flyquest-neon text-white flex flex-col">
      {/* Encabezado tipo landing */}
      <header className="py-12 flex flex-col items-center justify-center bg-black/60 border-b border-flyquest-neon/30">
        <img src="/public/logo.png" alt="FlyQuest" className="h-16 w-16 mb-4" />
        <h1 className="text-5xl font-extrabold text-flyquest-neon mb-2 tracking-wide text-center drop-shadow-lg">FlyQuest Dashboard</h1>
        <p className="text-lg text-flyquest-green text-center max-w-2xl">Bienvenido al panel oficial de FlyQuest. Aquí puedes ver el calendario, roster, estadísticas y logros del equipo, todo en un solo lugar.</p>
      </header>

      {/* Sección principal vertical y elegante */}
      <main className="flex flex-col items-center justify-center w-full px-4">
        {/* Calendario y partidos destacados */}
        <section className="w-full max-w-3xl mt-12 mb-8" id="calendario">
          {/* ...aquí va tu componente de calendario y filtros, tal como ya está... */}
          {/* ...aquí va la lista de partidos destacados... */}
        </section>

        {/* Panel de alertas/notificaciones vertical */}
        <section className="w-full max-w-2xl mb-8">
          <div className="bg-black/80 rounded-2xl shadow-xl border-2 border-flyquest-neon p-6">
            <h3 className="text-lg font-bold text-flyquest-neon mb-4 text-center">Alertas & Notificaciones</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><span>🔔</span> <span>Notificaciones</span></div>
              <div className="flex items-center gap-2"><span>⚡</span> <span>Alertas Avanzadas</span></div>
              <div className="flex items-center gap-2"><span>⏰</span> <span>Inicio exacto</span></div>
              <div className="flex items-center gap-2"><span>🎯</span> <span>Remontadas en vivo</span></div>
              <div className="flex items-center gap-2"><span>🛡️</span> <span>Draft Phase</span></div>
            </div>
          </div>
        </section>

        {/* Roster FlyQuest centrado y destacado */}
        <section className="w-full max-w-3xl mb-8" id="roster">
          <PlayerStats />
        </section>

        {/* Módulos adicionales en vertical debajo del roster */}
        <section className="w-full max-w-3xl mb-16 flex flex-col gap-8" id="stats">
          <FlyQuestStats matches={allMatches} lang={lang} />
          <StatsBoard matches={allMatches} lang={lang} />
          <Achievements matches={allMatches} lang={lang} />
        </section>
      </main>

      <FooterFlyQuest t={t} />
    </div>
  )
}
