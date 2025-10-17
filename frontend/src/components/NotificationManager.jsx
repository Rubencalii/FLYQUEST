import React, { useState, useEffect, useCallback } from 'react'

/**
 * Hook y componente para gestionar notificaciones push
 */

// Hook personalizado para notificaciones
export const useNotifications = () => {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    // Verificar soporte de notificaciones
    const supported = 'Notification' in window && 'serviceWorker' in navigator
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return { success: false, message: 'Las notificaciones no están soportadas en este navegador' }
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        // Registrar service worker
        const reg = await navigator.serviceWorker.register('/service-worker.js')
        setRegistration(reg)
        console.log('✅ Service Worker registrado:', reg)
        return { success: true, message: 'Notificaciones activadas correctamente' }
      } else if (result === 'denied') {
        return { success: false, message: 'Permiso de notificaciones denegado' }
      } else {
        return { success: false, message: 'Permiso de notificaciones no otorgado' }
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error)
      return { success: false, message: `Error: ${error.message}` }
    }
  }, [isSupported])

  const sendNotification = useCallback(async (title, options = {}) => {
    if (permission !== 'granted') {
      console.warn('⚠️ No hay permiso para enviar notificaciones')
      return false
    }

    try {
      if (registration && registration.showNotification) {
        // Usar service worker para la notificación (más robusto)
        await registration.showNotification(title, {
          body: options.body || '',
          icon: options.icon || '/flyquest-logo.png',
          badge: options.badge || '/flyquest-badge.png',
          vibrate: options.vibrate || [200, 100, 200],
          tag: options.tag || 'flyquest-notification',
          requireInteraction: options.requireInteraction || false,
          data: options.data || {},
          ...options
        })
      } else {
        // Fallback a notificación directa
        new Notification(title, options)
      }
      return true
    } catch (error) {
      console.error('Error al enviar notificación:', error)
      return false
    }
  }, [permission, registration])

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    isGranted: permission === 'granted'
  }
}

// Componente UI para gestionar notificaciones
export default function NotificationManager({ matches = [], favorites = [], lang = 'es' }) {
  const { permission, isSupported, requestPermission, sendNotification, isGranted } = useNotifications()
  const [scheduledNotifications, setScheduledNotifications] = useState(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [notifyBefore, setNotifyBefore] = useState(15) // minutos antes
  const [notifyResults, setNotifyResults] = useState(true)
  const [onlyFavorites, setOnlyFavorites] = useState(false) // Solo notificar favoritos
  const [message, setMessage] = useState(null)

  // Cargar preferencias desde localStorage
  useEffect(() => {
    const savedBefore = localStorage.getItem('flyquest_notify_before')
    const savedResults = localStorage.getItem('flyquest_notify_results')
    const savedOnlyFavorites = localStorage.getItem('flyquest_notify_only_favorites')
    
    if (savedBefore) setNotifyBefore(parseInt(savedBefore))
    if (savedResults !== null) setNotifyResults(savedResults === 'true')
    if (savedOnlyFavorites !== null) setOnlyFavorites(savedOnlyFavorites === 'true')
  }, [])

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('flyquest_notify_before', notifyBefore.toString())
    localStorage.setItem('flyquest_notify_results', notifyResults.toString())
    localStorage.setItem('flyquest_notify_only_favorites', onlyFavorites.toString())
  }, [notifyBefore, notifyResults, onlyFavorites])

  // Programar notificaciones para partidos próximos
  useEffect(() => {
    if (!isGranted || matches.length === 0) return

    const now = new Date()
    const upcomingMatches = matches.filter(m => 
      (m.status === 'unstarted' || m.status === 'upcoming') && 
      new Date(m.startTime) > now &&
      (!onlyFavorites || favorites.includes(m.id)) // Solo notificar favoritos si está activado
    )

    upcomingMatches.forEach(match => {
      const matchTime = new Date(match.startTime)
      const notifyTime = new Date(matchTime.getTime() - notifyBefore * 60 * 1000)
      const timeUntilNotify = notifyTime - now

      // Si ya pasó el tiempo de notificación o ya se programó, skip
      if (timeUntilNotify < 0 || scheduledNotifications.has(match.id)) return

      // Programar notificación
      const timeoutId = setTimeout(() => {
        const opponent = match.teams?.find(t => !t.name?.toLowerCase().includes('flyquest'))
        sendNotification(
          '🎮 Partido de FlyQuest en ' + notifyBefore + ' minutos',
          {
            body: `FlyQuest vs ${opponent?.name || 'TBD'}\n${match.league || 'League of Legends'}`,
            icon: '/flyquest-logo.png',
            tag: `match-${match.id}`,
            requireInteraction: true,
            data: { matchId: match.id, type: 'upcoming' }
          }
        )
        
        setScheduledNotifications(prev => new Set([...prev, match.id]))
      }, timeUntilNotify)

      // Limpiar timeout cuando se desmonte
      return () => clearTimeout(timeoutId)
    })
  }, [matches, isGranted, notifyBefore, sendNotification, scheduledNotifications, onlyFavorites, favorites])

  const handleEnableNotifications = async () => {
    const result = await requestPermission()
    setMessage({ type: result.success ? 'success' : 'error', text: result.message })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleTestNotification = () => {
    sendNotification(
      '🔔 Notificación de Prueba',
      {
        body: 'Las notificaciones están funcionando correctamente! 🎉',
        icon: '/flyquest-logo.png',
        tag: 'test-notification'
      }
    )
    setMessage({ type: 'success', text: 'Notificación de prueba enviada' })
    setTimeout(() => setMessage(null), 3000)
  }

  const texts = {
    es: {
      title: '🔔 Notificaciones',
      enable: 'Activar Notificaciones',
      enabled: 'Notificaciones Activadas',
      disabled: 'Notificaciones Desactivadas',
      notSupported: 'Tu navegador no soporta notificaciones',
      settings: 'Configuración',
      notifyBefore: 'Notificar antes del partido',
      notifyResults: 'Notificar resultados',
      minutes: 'minutos',
      test: 'Probar Notificación',
      description: 'Recibe alertas de partidos próximos y resultados en tiempo real'
    },
    en: {
      title: '🔔 Notifications',
      enable: 'Enable Notifications',
      enabled: 'Notifications Enabled',
      disabled: 'Notifications Disabled',
      notSupported: 'Your browser does not support notifications',
      settings: 'Settings',
      notifyBefore: 'Notify before match',
      notifyResults: 'Notify results',
      minutes: 'minutes',
      test: 'Test Notification',
      description: 'Receive alerts for upcoming matches and real-time results'
    }
  }

  const t = texts[lang] || texts.es

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-400 text-sm">
          ⚠️ {t.notSupported}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-flyquest-dark/50 rounded-xl shadow-lg p-4 backdrop-blur-sm border border-flyquest-green/20 dark:border-flyquest-neon/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${isGranted ? 'animate-pulse' : ''}`}>
            {isGranted ? (
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01L18 14.68z"/>
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{t.title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGranted && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t.settings}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </button>
          )}
          
          {!isGranted ? (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-flyquest-green to-emerald-500 dark:from-flyquest-neon dark:to-flyquest-green text-white font-semibold text-sm transition-all hover:scale-105 shadow-lg"
            >
              {t.enable}
            </button>
          ) : (
            <div className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {t.enabled}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {isGranted && showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-fade-in">
          {/* Notificar antes */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.notifyBefore}
            </label>
            <select
              value={notifyBefore}
              onChange={(e) => setNotifyBefore(parseInt(e.target.value))}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
            >
              <option value={5}>5 {t.minutes}</option>
              <option value={15}>15 {t.minutes}</option>
              <option value={30}>30 {t.minutes}</option>
              <option value={60}>60 {t.minutes}</option>
            </select>
          </div>

          {/* Notificar resultados */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.notifyResults}
            </label>
            <button
              onClick={() => setNotifyResults(!notifyResults)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifyResults ? 'bg-flyquest-green dark:bg-flyquest-neon' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                notifyResults ? 'transform translate-x-6' : ''
              }`} />
            </button>
          </div>

          {/* Solo notificar favoritos */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              {t.onlyFavorites || (lang === 'es' ? 'Solo favoritos' : 'Favorites only')}
            </label>
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                onlyFavorites ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                onlyFavorites ? 'transform translate-x-6' : ''
              }`} />
            </button>
          </div>

          {/* Test button */}
          <button
            onClick={handleTestNotification}
            className="w-full px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-semibold text-sm transition-colors"
          >
            {t.test}
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mt-3 p-3 rounded-lg text-sm animate-fade-in ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
