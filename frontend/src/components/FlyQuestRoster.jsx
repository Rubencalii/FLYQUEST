import React from 'react'

export default function FlyQuestRoster({ lang = 'es' }) {
  const [roster, setRoster] = React.useState([])
  const [teamName, setTeamName] = React.useState('FlyQuest')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/flyquest/roster')
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        if (!mounted) return
        setRoster(Array.isArray(data.roster) ? data.roster : [])
        setTeamName(data.team || 'FlyQuest')
      } catch (e) {
        if (!mounted) return
        setError(lang === 'es' ? 'No se pudo cargar el roster' : 'Failed to load roster')
        setRoster([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [lang])

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-6 h-6 border-4 border-flyquest-green/30 border-t-flyquest-green rounded-full animate-spin mr-2" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{lang === 'es' ? 'Cargando roster...' : 'Loading roster...'}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">{error}</div>
    )
  }

  if (!roster.length) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-400">
        {lang === 'es' ? 'No hay jugadores disponibles' : 'No players available'}
      </div>
    )
  }

  const roleBadgeClass = (role) => {
    const base = 'px-2 py-0.5 rounded text-[10px] font-bold'
    switch ((role || '').toLowerCase()) {
      case 'top':
        return `${base} bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30`
      case 'jungla':
      case 'jungle':
        return `${base} bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30`
      case 'mid':
        return `${base} bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30`
      case 'adc':
        return `${base} bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30`
      case 'soporte':
      case 'support':
        return `${base} bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30`
      default:
        return `${base} bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30`
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-flyquest-green dark:text-flyquest-neon">
          {lang === 'es' ? 'Roster de' : 'Roster of'} {teamName}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{roster.length} {lang === 'es' ? 'jugadores' : 'players'}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {roster.map((p) => (
          <div key={p.id || p.name} className="rounded-xl border border-flyquest-green/20 dark:border-flyquest-neon/20 bg-white dark:bg-flyquest-dark/40 backdrop-blur-sm overflow-hidden hover:border-flyquest-green/40 dark:hover:border-flyquest-neon/40 transition-all group">
            <div className="relative h-28 bg-gradient-to-br from-flyquest-green/10 to-emerald-500/10 dark:from-flyquest-neon/10 dark:to-flyquest-green/10">
              <img
                src={p.image}
                alt={p.name}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=00a99d&color=fff&size=128`
                }}
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{p.name}</div>
                <span className={roleBadgeClass(p.role)}>{p.role || '—'}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{p.country || '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
