import React, { useEffect, useState } from 'react'

/**
 * Componente para mostrar el timeline de Twitter de FlyQuest
 * Usa la API de Twitter Embed
 */
export default function TwitterFeed({ lang = 'es', dark = false }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Cargar el script de Twitter Widgets si no está cargado
    const loadTwitterScript = () => {
      return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (window.twttr) {
          resolve(window.twttr)
          return
        }

        // Crear script tag
        const script = document.createElement('script')
        script.src = 'https://platform.twitter.com/widgets.js'
        script.async = true
        script.charset = 'utf-8'
        
        script.onload = () => {
          if (window.twttr) {
            resolve(window.twttr)
          } else {
            reject(new Error('Twitter script loaded but twttr not available'))
          }
        }
        
        script.onerror = () => {
          reject(new Error('Failed to load Twitter script'))
        }

        document.body.appendChild(script)
      })
    }

    // Cargar y renderizar el widget
    loadTwitterScript()
      .then((twttr) => {
        setIsLoading(false)
        // El widget se renderizará automáticamente en el elemento con la clase twitter-timeline
      })
      .catch((err) => {
        console.error('Error loading Twitter widget:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  const texts = {
    es: {
      title: '🐦 Últimas Noticias de FlyQuest',
      loading: 'Cargando tweets...',
      error: 'No se pudo cargar el feed de Twitter',
      follow: 'Seguir a @FlyQuest',
      viewOnTwitter: 'Ver en Twitter'
    },
    en: {
      title: '🐦 Latest FlyQuest News',
      loading: 'Loading tweets...',
      error: 'Could not load Twitter feed',
      follow: 'Follow @FlyQuest',
      viewOnTwitter: 'View on Twitter'
    }
  }

  const t = texts[lang] || texts.es

  return (
    <div className="bg-white dark:bg-flyquest-dark/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm border border-flyquest-green/20 dark:border-flyquest-neon/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {t.title}
        </h2>
        <a
          href="https://twitter.com/FlyQuest"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold text-sm transition-all hover:scale-105 shadow-lg"
        >
          🐦 {t.follow}
        </a>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-[#1DA1F2]/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-[#1DA1F2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-red-700 dark:text-red-400 font-semibold mb-2">{t.error}</p>
          <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
          <a
            href="https://twitter.com/FlyQuest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold text-sm transition-all"
          >
            {t.viewOnTwitter}
          </a>
        </div>
      )}

      {/* Twitter Timeline Widget */}
      {!error && (
        <div className="twitter-feed-container">
          <a 
            className="twitter-timeline" 
            data-height="600"
            data-theme={dark ? 'dark' : 'light'}
            data-chrome="noheader nofooter noborders transparent"
            data-tweet-limit="5"
            href="https://twitter.com/FlyQuest?ref_src=twsrc%5Etfw"
          >
            Tweets by FlyQuest
          </a>
        </div>
      )}

      {/* Fallback: Manual Tweet Cards (si Twitter no carga) */}
      <style jsx>{`
        .twitter-feed-container {
          max-height: 600px;
          overflow-y: auto;
        }

        /* Estilos personalizados para el scroll */
        .twitter-feed-container::-webkit-scrollbar {
          width: 8px;
        }

        .twitter-feed-container::-webkit-scrollbar-track {
          background: ${dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 4px;
        }

        .twitter-feed-container::-webkit-scrollbar-thumb {
          background: ${dark ? 'rgba(0, 255, 159, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
          border-radius: 4px;
        }

        .twitter-feed-container::-webkit-scrollbar-thumb:hover {
          background: ${dark ? 'rgba(0, 255, 159, 0.5)' : 'rgba(34, 197, 94, 0.5)'};
        }
      `}</style>
    </div>
  )
}
