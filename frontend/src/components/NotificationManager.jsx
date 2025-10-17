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
export default function NotificationManager({ matches = [], lang = 'es' }) {
  const { permission, isSupported, requestPermission, sendNotification, isGranted } = useNotifications()
  const [scheduledNotifications, setScheduledNotifications] = useState(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [notifyBefore, setNotifyBefore] = useState(15) // minutos antes
  const [notifyResults, setNotifyResults] = useState(true)
  const [message, setMessage] = useState(null)

  // Cargar preferencias desde localStorage
  useEffect(() => {
    const savedBefore = localStorage.getItem('flyquest_notify_before')
    const savedResults = localStorage.getItem('flyquest_notify_results')
    
    if (savedBefore) setNotifyBefore(parseInt(savedBefore))
    if (savedResults !== null) setNotifyResults(savedResults === 'true')
  }, [])

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('flyquest_notify_before', notifyBefore.toString())
    localStorage.setItem('flyquest_notify_results', notifyResults.toString())
  }, [notifyBefore, notifyResults])

  // Programar notificaciones para partidos próximos
  useEffect(() => {
    if (!isGranted || matches.length === 0) return

    const now = new Date()
    const upcomingMatches = matches.filter(m => 
      (m.status === 'unstarted' || m.status === 'upcoming') && 
      new Date(m.startTime) > now
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
  }, [matches, isGranted, notifyBefore, sendNotification, scheduledNotifications])

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
          <div className={`text-2xl ${isGranted ? 'animate-pulse' : ''}`}>
            {isGranted ? '🔔' : '🔕'}
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
              ⚙️
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
            <div className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
              ✅ {t.enabled}
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
