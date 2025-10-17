// Service Worker para FlyQuest
// Maneja notificaciones push y caché offline

const CACHE_NAME = 'flyquest-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css'
]

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Instalando...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache abierto')
        return cache.addAll(urlsToCache)
      })
      .catch((err) => {
        console.error('❌ Service Worker: Error al cachear archivos', err)
      })
  )
})

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activando...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando cache antiguo', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Manejo de fetch (estrategia: Network First, fallback a Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla el fetch, buscar en cache
        return caches.match(event.request)
      })
  )
})

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push recibido')
  
  let data = {
    title: 'FlyQuest Dashboard',
    body: 'Nueva notificación',
    icon: '/flyquest-logo.png',
    badge: '/flyquest-badge.png'
  }

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/flyquest-logo.png',
    badge: data.badge || '/flyquest-badge.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'flyquest-notification',
    requireInteraction: data.requireInteraction || false
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Click en notificación')
  
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Sincronización en segundo plano')
  
  if (event.tag === 'sync-matches') {
    event.waitUntil(
      // Aquí podrías sincronizar datos cuando vuelva la conexión
      fetch('/api/flyquest/matches')
        .then((response) => response.json())
        .then((data) => {
          console.log('✅ Service Worker: Datos sincronizados', data)
        })
        .catch((err) => {
          console.error('❌ Service Worker: Error en sincronización', err)
        })
    )
  }
})
