import React, { useMemo } from 'react'

/**
 * Sistema de logros/achievements para FlyQuest
 * Calcula y muestra logros desbloqueables basados en el historial de partidos
 */
export default function Achievements({ matches, lang = 'es' }) {
  // Calcular logros desbloqueados
  const achievements = useMemo(() => {
    if (!matches || matches.length === 0) return []

    const completedMatches = matches
      .filter(m => ['completed', 'finished'].includes(m.status))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

    if (completedMatches.length === 0) return []

    const results = completedMatches.map(match => {
      const flyquestTeam = match.teams?.find(t => 
        (t.slug === 'flyquest') || (t.code === 'FLY') || t.name?.toLowerCase().includes('flyquest')
      )
      const opponentTeam = match.teams?.find(t => t !== flyquestTeam)
      
      const flyScore = typeof flyquestTeam?.score === 'number' ? flyquestTeam.score : (flyquestTeam?.result?.gameWins ?? 0)
      const oppScore = typeof opponentTeam?.score === 'number' ? opponentTeam.score : (opponentTeam?.result?.gameWins ?? 0)
      const won = (flyScore ?? -1) > (oppScore ?? -1)
      const score = `${flyScore || 0}-${oppScore || 0}`
      
      return { won, match, score, flyquestScore: flyScore || 0, opponentScore: oppScore || 0 }
    })

    const achievementsList = []

    // 1. 🔥 Racha de Fuego - 5 victorias consecutivas
    let maxStreak = 0
    let currentStreak = 0
    results.forEach(r => {
      if (r.won) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })

    if (maxStreak >= 5) {
      achievementsList.push({
        id: 'fire-streak',
        icon: '🔥',
        title: lang === 'es' ? 'Racha de Fuego' : 'Fire Streak',
        description: lang === 'es' 
          ? `${maxStreak} victorias consecutivas` 
          : `${maxStreak} consecutive wins`,
        unlocked: true,
        rarity: maxStreak >= 10 ? 'legendary' : maxStreak >= 7 ? 'epic' : 'rare',
        progress: maxStreak,
        max: maxStreak >= 10 ? maxStreak : 10
      })
    }

    // 2. 🏆 Imparables - Torneo perfecto (10+ victorias sin derrotas)
    const tournamentStats = {}
    completedMatches.forEach(match => {
      const league = match.league || 'Unknown'
      if (!tournamentStats[league]) {
        tournamentStats[league] = { wins: 0, losses: 0 }
      }
      const result = results.find(r => r.match.id === match.id)
      if (result) {
        if (result.won) tournamentStats[league].wins++
        else tournamentStats[league].losses++
      }
    })

    Object.entries(tournamentStats).forEach(([league, stats]) => {
      if (stats.wins >= 10 && stats.losses === 0) {
        achievementsList.push({
          id: `unstoppable-${league}`,
          icon: '🏆',
          title: lang === 'es' ? 'Imparables' : 'Unstoppable',
          description: lang === 'es' 
            ? `${stats.wins}-0 en ${league}` 
            : `${stats.wins}-0 in ${league}`,
          unlocked: true,
          rarity: 'legendary',
          progress: stats.wins,
          max: stats.wins
        })
      }
    })

    // 3. ⚡ Remontada Épica - Ganar después de estar 0-2
    results.forEach(r => {
      if (r.won && r.opponentScore >= 2 && r.flyquestScore > r.opponentScore) {
        const comeback = r.flyquestScore - r.opponentScore === 1 && r.opponentScore === 2
        if (comeback) {
          achievementsList.push({
            id: `comeback-${r.match.id}`,
            icon: '⚡',
            title: lang === 'es' ? 'Remontada Épica' : 'Epic Comeback',
            description: lang === 'es' 
              ? `Ganaron ${r.score} después de estar 0-2` 
              : `Won ${r.score} after being 0-2`,
            unlocked: true,
            rarity: 'epic',
            progress: 1,
            max: 1
          })
        }
      }
    })

    // 4. 🌟 Dominación Total - Victoria perfecta 3-0
    results.forEach(r => {
      if (r.won && r.flyquestScore === 3 && r.opponentScore === 0) {
        achievementsList.push({
          id: `perfect-${r.match.id}`,
          icon: '🌟',
          title: lang === 'es' ? 'Dominación Total' : 'Total Domination',
          description: lang === 'es' 
            ? `Victoria perfecta 3-0 vs ${r.match.teams?.find(t => !t.name?.includes('FlyQuest'))?.name || 'rival'}` 
            : `Perfect 3-0 victory vs ${r.match.teams?.find(t => !t.name?.includes('FlyQuest'))?.name || 'opponent'}`,
          unlocked: true,
          rarity: 'rare',
          progress: 1,
          max: 1
        })
      }
    })

    // 5. 💎 Veteranos - 50+ partidos completados
    if (completedMatches.length >= 50) {
      achievementsList.push({
        id: 'veteran',
        icon: '💎',
        title: lang === 'es' ? 'Veteranos' : 'Veterans',
        description: lang === 'es' 
          ? `${completedMatches.length} partidos jugados` 
          : `${completedMatches.length} matches played`,
        unlocked: true,
        rarity: 'legendary',
        progress: completedMatches.length,
        max: 100
      })
    }

    // 6. 🎯 Consistencia - Winrate >65%
    const totalWins = results.filter(r => r.won).length
    const winrate = (totalWins / results.length) * 100

    if (winrate >= 65) {
      achievementsList.push({
        id: 'consistency',
        icon: '🎯',
        title: lang === 'es' ? 'Consistencia' : 'Consistency',
        description: lang === 'es' 
          ? `${winrate.toFixed(1)}% de victorias` 
          : `${winrate.toFixed(1)}% winrate`,
        unlocked: true,
        rarity: winrate >= 75 ? 'epic' : 'rare',
        progress: Math.round(winrate),
        max: 100
      })
    }

    // Añadir logros bloqueados (próximos a desbloquear)
    if (maxStreak < 5) {
      achievementsList.push({
        id: 'fire-streak-locked',
        icon: '🔒',
        title: lang === 'es' ? 'Racha de Fuego' : 'Fire Streak',
        description: lang === 'es' 
          ? '5 victorias consecutivas' 
          : '5 consecutive wins',
        unlocked: false,
        rarity: 'rare',
        progress: maxStreak,
        max: 5
      })
    }

    if (completedMatches.length < 50) {
      achievementsList.push({
        id: 'veteran-locked',
        icon: '🔒',
        title: lang === 'es' ? 'Veteranos' : 'Veterans',
        description: lang === 'es' 
          ? '50 partidos completados' 
          : '50 completed matches',
        unlocked: false,
        rarity: 'legendary',
        progress: completedMatches.length,
        max: 50
      })
    }

    return achievementsList
  }, [matches, lang])

  const t = {
    es: {
      title: '🎯 Logros de FlyQuest',
      subtitle: 'Achievements desbloqueados',
      unlocked: 'Desbloqueado',
      locked: 'Bloqueado',
      progress: 'Progreso',
      noAchievements: 'Aún no hay logros desbloqueados. ¡Sigue jugando!',
      rarities: {
        common: 'Común',
        rare: 'Raro',
        epic: 'Épico',
        legendary: 'Legendario'
      }
    },
    en: {
      title: '🎯 FlyQuest Achievements',
      subtitle: 'Unlocked achievements',
      unlocked: 'Unlocked',
      locked: 'Locked',
      progress: 'Progress',
      noAchievements: 'No achievements unlocked yet. Keep playing!',
      rarities: {
        common: 'Common',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary'
      }
    }
  }

  const translations = t[lang] || t.es

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-500 to-orange-500'
      case 'epic':
        return 'from-purple-500 to-pink-500'
      case 'rare':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  if (achievements.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-flyquest-green dark:text-flyquest-neon mb-4 flex items-center gap-2">
          {translations.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          {translations.noAchievements}
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-flyquest-green dark:text-flyquest-neon flex items-center gap-2">
            {translations.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {unlockedAchievements.length} {translations.unlocked.toLowerCase()}
          </p>
        </div>
        <div className="text-4xl animate-bounce-slow">🏆</div>
      </div>

      {/* Logros desbloqueados */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-green-500">✅</span>
            {translations.unlocked}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`relative p-4 rounded-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden`}
              >
                {/* Brillo de fondo */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{achievement.icon}</div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase">
                      {translations.rarities[achievement.rarity]}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-1">{achievement.title}</h4>
                  <p className="text-sm opacity-90">{achievement.description}</p>
                  
                  {/* Barra de progreso */}
                  {achievement.progress && achievement.max && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{translations.progress}</span>
                        <span>{achievement.progress}/{achievement.max}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((achievement.progress / achievement.max) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logros bloqueados */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-gray-500">🔒</span>
            {translations.locked}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="relative p-4 rounded-xl bg-gray-200 dark:bg-gray-800 border-2 border-dashed border-gray-400 dark:border-gray-600 opacity-60 hover:opacity-80 transition-opacity duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-4xl grayscale">{achievement.icon}</div>
                  <span className="text-xs font-bold bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full uppercase">
                    {translations.rarities[achievement.rarity]}
                  </span>
                </div>
                
                <h4 className="font-bold text-lg mb-1 text-gray-700 dark:text-gray-300">{achievement.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                
                {/* Barra de progreso */}
                {achievement.progress !== undefined && achievement.max && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-400">
                      <span>{translations.progress}</span>
                      <span>{achievement.progress}/{achievement.max}</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-flyquest-green dark:bg-flyquest-neon h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((achievement.progress / achievement.max) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
