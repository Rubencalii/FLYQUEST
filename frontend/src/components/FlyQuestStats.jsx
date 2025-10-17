import React, { useMemo } from 'react'

/**
 * Componente que calcula y muestra estadísticas de FlyQuest
 * basado en los partidos disponibles
 */
export default function FlyQuestStats({ matches, lang = 'es' }) {
  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!matches || matches.length === 0) {
      return null
    }

    // Filtrar solo partidos completados
    const completedMatches = matches.filter(m => m.status === 'completed')
    
    if (completedMatches.length === 0) {
      return null
    }

    // Calcular victorias y derrotas
    let wins = 0
    let losses = 0
    let currentStreak = 0
    let currentStreakType = null // 'win' o 'loss'
    let bestWinStreak = 0
    let bestLossStreak = 0

    // Estadísticas por torneo
    const byTournament = {}

    // Ordenar partidos por fecha (más reciente primero)
    const sortedMatches = [...completedMatches].sort((a, b) => 
      new Date(b.startTime) - new Date(a.startTime)
    )

    sortedMatches.forEach((match, idx) => {
      const flyquestTeam = match.teams?.find(t => 
        t.name?.toLowerCase().includes('flyquest')
      )
      
      if (!flyquestTeam) return

      const isWin = flyquestTeam.result?.outcome === 'win'
      
      // Contabilizar victoria/derrota
      if (isWin) {
        wins++
      } else {
        losses++
      }

      // Calcular racha actual (solo los primeros partidos ordenados)
      if (idx === 0) {
        currentStreakType = isWin ? 'win' : 'loss'
        currentStreak = 1
      } else if (
        (currentStreakType === 'win' && isWin) ||
        (currentStreakType === 'loss' && !isWin)
      ) {
        currentStreak++
      }

      // Actualizar mejor racha
      if (isWin) {
        let tempWinStreak = 1
        for (let i = idx + 1; i < sortedMatches.length; i++) {
          const prevMatch = sortedMatches[i]
          const prevFQ = prevMatch.teams?.find(t => t.name?.toLowerCase().includes('flyquest'))
          if (prevFQ?.result?.outcome === 'win') {
            tempWinStreak++
          } else {
            break
          }
        }
        bestWinStreak = Math.max(bestWinStreak, tempWinStreak)
      } else {
        let tempLossStreak = 1
        for (let i = idx + 1; i < sortedMatches.length; i++) {
          const prevMatch = sortedMatches[i]
          const prevFQ = prevMatch.teams?.find(t => t.name?.toLowerCase().includes('flyquest'))
          if (prevFQ?.result?.outcome === 'loss' || !prevFQ?.result) {
            tempLossStreak++
          } else {
            break
          }
        }
        bestLossStreak = Math.max(bestLossStreak, tempLossStreak)
      }

      // Estadísticas por torneo
      const league = match.league || 'Unknown'
      if (!byTournament[league]) {
        byTournament[league] = { wins: 0, losses: 0, total: 0 }
      }
      byTournament[league].total++
      if (isWin) {
        byTournament[league].wins++
      } else {
        byTournament[league].losses++
      }
    })

    const totalGames = wins + losses
    const winrate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0

    // Calcular winrate por torneo
    const tournamentStats = Object.entries(byTournament).map(([name, data]) => ({
      name,
      wins: data.wins,
      losses: data.losses,
      total: data.total,
      winrate: data.total > 0 ? ((data.wins / data.total) * 100).toFixed(1) : 0
    })).sort((a, b) => b.total - a.total)

    return {
      totalGames,
      wins,
      losses,
      winrate,
      currentStreak,
      currentStreakType,
      bestWinStreak,
      bestLossStreak,
      tournamentStats,
      lastMatch: sortedMatches[0]
    }
  }, [matches])

  if (!stats) {
    return (
      <div className="bg-white dark:bg-flyquest-dark/50 rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-flyquest-green/20 dark:border-flyquest-neon/30">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {lang === 'es' 
            ? '📊 No hay estadísticas disponibles aún' 
            : '📊 No statistics available yet'}
        </div>
      </div>
    )
  }

  const texts = {
    es: {
      title: '📊 Estadísticas de FlyQuest',
      overall: 'Rendimiento General',
      games: 'Partidos Jugados',
      wins: 'Victorias',
      losses: 'Derrotas',
      winrate: 'Winrate',
      streak: 'Racha Actual',
      records: 'Récords',
      bestWinStreak: 'Mejor Racha Ganadora',
      bestLossStreak: 'Mayor Racha Perdedora',
      byTournament: 'Por Torneo',
      lastMatch: 'Último Partido',
      vs: 'vs',
      win: 'Victoria',
      loss: 'Derrota'
    },
    en: {
      title: '📊 FlyQuest Statistics',
      overall: 'Overall Performance',
      games: 'Games Played',
      wins: 'Wins',
      losses: 'Losses',
      winrate: 'Winrate',
      streak: 'Current Streak',
      records: 'Records',
      bestWinStreak: 'Best Win Streak',
      bestLossStreak: 'Longest Loss Streak',
      byTournament: 'By Tournament',
      lastMatch: 'Last Match',
      vs: 'vs',
      win: 'Win',
      loss: 'Loss'
    }
  }

  const t = texts[lang] || texts.es

  const getStreakColor = (type) => {
    return type === 'win' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'
  }

  const getStreakIcon = (type) => {
    return type === 'win' ? '🔥' : '❄️'
  }

  const getWinrateColor = (winrate) => {
    if (winrate >= 60) return 'text-green-600 dark:text-green-400'
    if (winrate >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-flyquest-dark/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm border border-flyquest-green/20 dark:border-flyquest-neon/30 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {t.title}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {stats.totalGames} {t.games}
        </div>
      </div>

      {/* Rendimiento General */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Victorias */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
          <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
            ✅ {t.wins}
          </div>
          <div className="text-3xl font-black text-green-600 dark:text-green-400">
            {stats.wins}
          </div>
        </div>

        {/* Derrotas */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 border border-red-200 dark:border-red-700">
          <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
            ❌ {t.losses}
          </div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400">
            {stats.losses}
          </div>
        </div>

        {/* Winrate */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
          <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
            📈 {t.winrate}
          </div>
          <div className={`text-3xl font-black ${getWinrateColor(stats.winrate)}`}>
            {stats.winrate}%
          </div>
        </div>

        {/* Racha Actual */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
          <div className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">
            {getStreakIcon(stats.currentStreakType)} {t.streak}
          </div>
          <div className={`text-3xl font-black ${getStreakColor(stats.currentStreakType)}`}>
            {stats.currentStreak}{stats.currentStreakType === 'win' ? 'W' : 'L'}
          </div>
        </div>
      </div>

      {/* Récords */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          🏆 {t.records}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              🔥 {t.bestWinStreak}:
            </span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {stats.bestWinStreak}W
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ❄️ {t.bestLossStreak}:
            </span>
            <span className="font-bold text-red-600 dark:text-red-400">
              {stats.bestLossStreak}L
            </span>
          </div>
        </div>
      </div>

      {/* Por Torneo */}
      {stats.tournamentStats.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            🏆 {t.byTournament}
          </h3>
          <div className="space-y-2">
            {stats.tournamentStats.map((tournament, idx) => (
              <div 
                key={idx}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {tournament.name}
                  </span>
                  <span className={`font-bold ${getWinrateColor(tournament.winrate)}`}>
                    {tournament.winrate}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-600 dark:text-green-400">
                    {tournament.wins}W
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    {tournament.losses}L
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {tournament.total} {lang === 'es' ? 'partidos' : 'games'}
                  </span>
                </div>
                {/* Barra de progreso */}
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                    style={{ width: `${tournament.winrate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
