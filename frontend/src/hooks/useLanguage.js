import { useState, useEffect } from 'react'

const texts = {
  en: {
    matches: 'Matches',
    roster: 'Roster',
    refresh: 'Refresh',
    timezone: 'Timezone',
    theme: 'Theme',
    footerText: 'Made with 💚 by the community'
  },
  es: {
    matches: 'Partidos',
    roster: 'Roster',
    refresh: 'Actualizar',
    timezone: 'Zona horaria',
    theme: 'Tema',
    footerText: 'Hecho con 💚 por la comunidad'
  }
}

export default function useLanguage() {
  const [lang, setLang] = useState('es')

  useEffect(() => {
    const stored = localStorage.getItem('fq_lang')
    if (stored) setLang(stored)
  }, [])

  useEffect(() => {
    localStorage.setItem('fq_lang', lang)
  }, [lang])

  function toggleLanguage() {
    setLang((l) => (l === 'es' ? 'en' : 'es'))
  }

  return { lang, toggleLanguage, t: texts[lang] }
}
