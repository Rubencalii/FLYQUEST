import React, { useEffect, useState } from 'react'

export default function FlyQuestRoster() {
  const [data, setData] = useState(null)
  const [imageErrors, setImageErrors] = useState({})

  useEffect(() => {
    fetch('/rosterFlyQuest.json')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => console.error('load roster', e))
  }, [])

  const handleImageError = (name) => {
    setImageErrors(prev => ({ ...prev, [name]: true }))
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleEmoji = (role) => {
    const emojis = {
      'Top': '⚔️',
      'Jungla': '🌲',
      'Mid': '⚡',
      'ADC': '🎯',
      'Soporte': '🛡️'
    }
    return emojis[role] || '🎮'
  }

  if (!data) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flyquest-green dark:border-flyquest-neon mx-auto mb-3"></div>
      <p className="text-gray-600 dark:text-flyquest-gray">Cargando roster...</p>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-flyquest-green to-emerald-600 dark:from-flyquest-neon dark:to-flyquest-green">
          {data.team} — {data.league} {data.season}
        </div>
      </div>

      <div className="space-y-3">
        {data.roster.map((p) => (
          <div key={p.name} className="group relative p-4 rounded-xl bg-gradient-to-r from-flyquest-green/10 to-emerald-500/5 dark:from-flyquest-neon/10 dark:to-flyquest-green/5 border border-flyquest-green/20 dark:border-flyquest-neon/20 hover:border-flyquest-green/50 dark:hover:border-flyquest-neon/50 transition-all hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center gap-4">
              {/* Avatar con fallback */}
              <div className="relative">
                {!imageErrors[p.name] ? (
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="w-16 h-16 rounded-full border-2 border-flyquest-green dark:border-flyquest-neon object-cover bg-gray-100 dark:bg-flyquest-dark"
                    onError={() => handleImageError(p.name)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-flyquest-green dark:border-flyquest-neon bg-gradient-to-br from-flyquest-green to-emerald-500 dark:from-flyquest-neon dark:to-flyquest-green flex items-center justify-center">
                    <span className="text-2xl font-black text-white dark:text-flyquest-black">{getInitials(p.name)}</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-flyquest-dark rounded-full flex items-center justify-center text-xs border border-flyquest-green/50 dark:border-flyquest-neon/50">
                  {getRoleEmoji(p.role)}
                </div>
              </div>

              <div className="flex-1">
                <div className="font-bold text-lg text-flyquest-green dark:text-flyquest-neon group-hover:text-emerald-600 dark:group-hover:text-flyquest-green transition-colors">{p.name}</div>
                <div className="text-sm text-gray-600 dark:text-flyquest-gray flex items-center gap-2">
                  <span className="font-semibold">{p.role}</span>
                  <span className="text-flyquest-green/50 dark:text-flyquest-neon/50">•</span>
                  <span>{p.country}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coach */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-100/50 to-flyquest-green/10 dark:from-flyquest-blue-light/20 dark:to-flyquest-neon/10 border border-flyquest-green/30 dark:border-flyquest-neon/30">
        <div className="font-bold text-flyquest-green dark:text-flyquest-neon mb-3 flex items-center gap-2">
          <span className="text-xl">👔</span>
          <span>Staff Técnico</span>
        </div>
        <div className="flex items-center gap-4">
          {!imageErrors[data.coach.name] ? (
            <img
              src={data.coach.photo}
              alt={data.coach.name}
              className="w-12 h-12 rounded-full border-2 border-flyquest-green/50 dark:border-flyquest-neon/50 object-cover bg-gray-100 dark:bg-flyquest-dark"
              onError={() => handleImageError(data.coach.name)}
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-flyquest-green/50 dark:border-flyquest-neon/50 bg-gradient-to-br from-blue-500 to-flyquest-green dark:from-flyquest-blue dark:to-flyquest-neon flex items-center justify-center">
              <span className="text-lg font-black text-white">{getInitials(data.coach.name)}</span>
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800 dark:text-flyquest-white">{data.coach.name}</div>
            <div className="text-sm text-gray-600 dark:text-flyquest-gray">{data.coach.role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
