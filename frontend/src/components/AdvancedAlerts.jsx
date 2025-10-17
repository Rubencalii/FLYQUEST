import React, { useState, useEffect } from 'react'

/**
 * Sistema de alertas personalizadas avanzadas
 * - Remontadas en vivo
 * - Draft phase (5 min antes)
 * - MVP anunciado
 * - Contexto de clasificación
 */
export default function AdvancedAlerts({ matches, favorites = [], lang = 'es', onSendNotification }) {
  const [alertsEnabled, setAlertsEnabled] = useState({
    comeback: true,        // Remontadas
    draftPhase: true,      // Draft phase (5 min antes)
    matchStart: true,      // Inicio exacto del partido
    closeGame: true,       // Partido cerrado (2-2 en BO5)
    playoff: true          // Contexto de playoffs
  })

  const [notifiedAlerts, setNotifiedAlerts] = useState(new Set())

  // Cargar configuración desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flyquest_advanced_alerts')
    if (saved) {
      try {
        setAlertsEnabled(JSON.parse(saved))
      } catch (e) {
        console.error('Error al cargar configuración de alertas:', e)
      }
    }
  }, [])

  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem('flyquest_advanced_alerts', JSON.stringify(alertsEnabled))
  }, [alertsEnabled])

  // Monitorear partidos y enviar alertas
  useEffect(() => {
    if (!onSendNotification || !matches || matches.length === 0) return

    const now = new Date()

    matches.forEach(match => {
      const matchTime = new Date(match.startTime)
      const timeDiff = matchTime - now
      const minutesUntilStart = Math.floor(timeDiff / 60000)

      // Solo procesar partidos favoritos o todos si no hay filtro
      const shouldProcess = favorites.length === 0 || favorites.includes(match.id)
      if (!shouldProcess) return

      const flyquestTeam = match.teams?.find(t => 
        t.name?.toLowerCase().includes('flyquest') || t.code === 'FLY'
      )
      const opponentTeam = match.teams?.find(t => 
        !t.name?.toLowerCase().includes('flyquest') && t.code !== 'FLY'
      )

      // 1. 🎮 Alerta de Draft Phase (5 minutos antes)
      if (
        alertsEnabled.draftPhase && 
        match.status === 'unstarted' && 
        minutesUntilStart === 5 &&
        !notifiedAlerts.has(`draft-${match.id}`)
      ) {
        onSendNotification(
          lang === 'es' ? '🎮 Draft Phase en 5 minutos' : '🎮 Draft Phase in 5 minutes',
          {
            body: `FlyQuest vs ${opponentTeam?.name || 'TBD'}\n${match.league || 'League of Legends'}`,
            icon: '/flyquest-logo.png',
            tag: `draft-${match.id}`,
            requireInteraction: true
          }
        )
        setNotifiedAlerts(prev => new Set([...prev, `draft-${match.id}`]))
      }

      // 2. ⚡ Alerta de inicio exacto del partido
      if (
        alertsEnabled.matchStart && 
        match.status === 'unstarted' && 
        minutesUntilStart === 0 &&
        !notifiedAlerts.has(`start-${match.id}`)
      ) {
        onSendNotification(
          lang === 'es' ? '⚡ ¡Partido comenzando AHORA!' : '⚡ Match starting NOW!',
          {
            body: `FlyQuest vs ${opponentTeam?.name || 'TBD'}`,
            icon: '/flyquest-logo.png',
            tag: `start-${match.id}`,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200]
          }
        )
        setNotifiedAlerts(prev => new Set([...prev, `start-${match.id}`]))
      }

      // 3. 🔥 Alerta de remontada (si están perdiendo pero remontan)
      if (
        alertsEnabled.comeback && 
        match.status === 'inProgress' &&
        flyquestTeam && opponentTeam &&
        flyquestTeam.score < opponentTeam.score &&
        flyquestTeam.score === opponentTeam.score - 1 && // A punto de empatar
        !notifiedAlerts.has(`comeback-${match.id}-${flyquestTeam.score}`)
      ) {
        onSendNotification(
          lang === 'es' ? '🔥 ¡FlyQuest está remontando!' : '🔥 FlyQuest is making a comeback!',
          {
            body: lang === 'es' 
              ? `Marcador: ${flyquestTeam.score}-${opponentTeam.score}. ¡Un juego más para empatar!`
              : `Score: ${flyquestTeam.score}-${opponentTeam.score}. One more game to tie!`,
            icon: '/flyquest-logo.png',
            tag: `comeback-${match.id}`,
            requireInteraction: true,
            vibrate: [300, 100, 300]
          }
        )
        setNotifiedAlerts(prev => new Set([...prev, `comeback-${match.id}-${flyquestTeam.score}`]))
      }

      // 4. 💥 Alerta de partido cerrado (2-2 en BO5)
      if (
        alertsEnabled.closeGame && 
        match.status === 'inProgress' &&
        match.format === 'bo5' &&
        flyquestTeam && opponentTeam &&
        flyquestTeam.score === 2 && opponentTeam.score === 2 &&
        !notifiedAlerts.has(`close-${match.id}`)
      ) {
        onSendNotification(
          lang === 'es' ? '💥 ¡Partido igualado 2-2!' : '💥 Match tied 2-2!',
          {
            body: lang === 'es' 
              ? 'Todo se decide en el último juego. ¡No te lo pierdas!'
              : 'Everything is decided in the last game. Don\'t miss it!',
            icon: '/flyquest-logo.png',
            tag: `close-${match.id}`,
            requireInteraction: true,
            vibrate: [500, 200, 500]
          }
        )
        setNotifiedAlerts(prev => new Set([...prev, `close-${match.id}`]))
      }

      // 5. 🏆 Alerta de contexto de playoffs
      if (
        alertsEnabled.playoff && 
        match.league?.toLowerCase().includes('playoff') &&
        match.status === 'unstarted' &&
        minutesUntilStart <= 60 && minutesUntilStart > 50 &&
        !notifiedAlerts.has(`playoff-${match.id}`)
      ) {
        onSendNotification(
          lang === 'es' ? '🏆 Partido de Playoffs en 1 hora' : '🏆 Playoff Match in 1 hour',
          {
            body: lang === 'es'
              ? `FlyQuest vs ${opponentTeam?.name || 'TBD'} - ¡Partido eliminatorio!`
              : `FlyQuest vs ${opponentTeam?.name || 'TBD'} - Elimination match!`,
            icon: '/flyquest-logo.png',
            tag: `playoff-${match.id}`,
            requireInteraction: true
          }
        )
        setNotifiedAlerts(prev => new Set([...prev, `playoff-${match.id}`]))
      }
    })

    // Limpiar alertas antiguas cada 5 minutos
    const cleanupInterval = setInterval(() => {
      const oldAlerts = Array.from(notifiedAlerts).filter(alertId => {
        const matchId = alertId.split('-')[1]
        const match = matches.find(m => m.id === matchId)
        return match && (match.status === 'completed' || new Date(match.startTime) < new Date(now - 24 * 60 * 60 * 1000))
      })
      
      if (oldAlerts.length > 0) {
        setNotifiedAlerts(prev => {
          const newSet = new Set(prev)
          oldAlerts.forEach(id => newSet.delete(id))
          return newSet
        })
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(cleanupInterval)
  }, [matches, favorites, alertsEnabled, onSendNotification, notifiedAlerts, lang])

  const t = {
    es: {
      title: '🔔 Alertas Avanzadas',
      description: 'Notificaciones personalizadas para momentos especiales',
      comeback: 'Remontadas en vivo',
      comebackDesc: 'Cuando FlyQuest está a punto de empatar',
      draftPhase: 'Draft Phase',
      draftPhaseDesc: '5 minutos antes del partido',
      matchStart: 'Inicio exacto',
      matchStartDesc: 'Cuando comienza el partido',
      closeGame: 'Partidos cerrados',
      closeGameDesc: 'Series igualadas (2-2 en BO5)',
      playoff: 'Contexto de Playoffs',
      playoffDesc: 'Partidos eliminatorios importantes',
      alertsSent: 'alertas enviadas'
    },
    en: {
      title: '🔔 Advanced Alerts',
      description: 'Custom notifications for special moments',
      comeback: 'Live comebacks',
      comebackDesc: 'When FlyQuest is about to tie',
      draftPhase: 'Draft Phase',
      draftPhaseDesc: '5 minutes before match',
      matchStart: 'Exact start',
      matchStartDesc: 'When match begins',
      closeGame: 'Close games',
      closeGameDesc: 'Tied series (2-2 in BO5)',
      playoff: 'Playoff context',
      playoffDesc: 'Important elimination matches',
      alertsSent: 'alerts sent'
    }
  }

  const translations = t[lang] || t.es

  const toggleAlert = (key) => {
    setAlertsEnabled(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {translations.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {translations.description}
          </p>
        </div>
        <div className="text-2xl">🎯</div>
      </div>

      <div className="space-y-3">
        {/* Remontadas */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔥</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-white">
                {translations.comeback}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {translations.comebackDesc}
            </p>
          </div>
          <button
            onClick={() => toggleAlert('comeback')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              alertsEnabled.comeback ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              alertsEnabled.comeback ? 'transform translate-x-6' : ''
            }`} />
          </button>
        </div>

        {/* Draft Phase */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🎮</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-white">
                {translations.draftPhase}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {translations.draftPhaseDesc}
            </p>
          </div>
          <button
            onClick={() => toggleAlert('draftPhase')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              alertsEnabled.draftPhase ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              alertsEnabled.draftPhase ? 'transform translate-x-6' : ''
            }`} />
          </button>
        </div>

        {/* Inicio exacto */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">⚡</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-white">
                {translations.matchStart}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {translations.matchStartDesc}
            </p>
          </div>
          <button
            onClick={() => toggleAlert('matchStart')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              alertsEnabled.matchStart ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              alertsEnabled.matchStart ? 'transform translate-x-6' : ''
            }`} />
          </button>
        </div>

        {/* Partidos cerrados */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💥</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-white">
                {translations.closeGame}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {translations.closeGameDesc}
            </p>
          </div>
          <button
            onClick={() => toggleAlert('closeGame')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              alertsEnabled.closeGame ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              alertsEnabled.closeGame ? 'transform translate-x-6' : ''
            }`} />
          </button>
        </div>

        {/* Playoffs */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏆</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-white">
                {translations.playoff}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {translations.playoffDesc}
            </p>
          </div>
          <button
            onClick={() => toggleAlert('playoff')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              alertsEnabled.playoff ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              alertsEnabled.playoff ? 'transform translate-x-6' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* Contador de alertas */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          {notifiedAlerts.size} {translations.alertsSent}
        </p>
      </div>
    </div>
  )
}
