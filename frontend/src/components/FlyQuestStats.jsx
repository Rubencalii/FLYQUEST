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

    // Filtrar solo partidos completados (compatibilidad con 'completed' y 'finished')
    const completedMatches = matches.filter(m => ['completed', 'finished'].includes(m.status))
    
    if (completedMatches.length === 0) {
      return null
    }

    // Ordenar partidos por fecha (más reciente primero)
    const sortedMatches = [...completedMatches].sort((a, b) =>
      new Date(b.startTime || b.match?.startTime || b.eventStartTime || 0) -
      new Date(a.startTime || a.match?.startTime || a.eventStartTime || 0)
    )

    // Función robusta para determinar si FlyQuest ganó un partido
    const isFlyWin = (match) => {
      const teams = match.teams || match.match?.teams || []
      if (!teams || teams.length === 0) return null
      let flyIdx = teams.findIndex(t =>
        (t.slug === 'flyquest') || (t.code === 'FLY') || ((t.name || '').toLowerCase().includes('flyquest'))
      )
      if (flyIdx === -1) flyIdx = 0 // suponer [0] es FLY (backend lo formatea así)
      const oppIdx = teams.length === 2 ? (flyIdx === 0 ? 1 : 0) : teams.findIndex((_, i) => i !== flyIdx)
      const fly = teams[flyIdx] || {}
      const opp = teams[oppIdx] || {}
      const flyScore = (typeof fly.score === 'number' ? fly.score : (fly.result?.gameWins ?? 0))
      const oppScore = (typeof opp.score === 'number' ? opp.score : (opp.result?.gameWins ?? 0))
      if (flyScore === null || oppScore === null) return null
      return flyScore > oppScore
    }

    // Construir vector de resultados (true=win, false=loss) para métricas
    const results = sortedMatches.map(m => isFlyWin(m)).filter(v => v !== null)

    // Calcular victorias y derrotas
    const wins = results.filter(Boolean).length
    const losses = results.length - wins

    // Racha actual (desde el más reciente hacia atrás)
    let currentStreak = 0
    let currentStreakType = null // 'win' | 'loss'
    if (results.length > 0) {
      const first = results[0]
      currentStreakType = first ? 'win' : 'loss'
      for (const r of results) {
        if (r === first) currentStreak++
        else break
      }
    }

    // Mejores rachas históricas
    let bestWinStreak = 0
    let bestLossStreak = 0
    let tmpW = 0
    let tmpL = 0
    // Para mejores rachas, conviene recorrer cronológicamente (antiguo -> reciente)
    const chrono = [...results].reverse()
    for (const r of chrono) {
      if (r) {
        tmpW += 1
        bestWinStreak = Math.max(bestWinStreak, tmpW)
        tmpL = 0
      } else {
        tmpL += 1
        bestLossStreak = Math.max(bestLossStreak, tmpL)
        tmpW = 0
      }
    }

    // Estadísticas por torneo
    const byTournament = {}
    sortedMatches.forEach((match) => {
      const leagueName = (typeof match.league === 'string')
        ? match.league
        : (match.league?.name || 'Unknown')
      if (!byTournament[leagueName]) byTournament[leagueName] = { wins: 0, losses: 0, total: 0 }
      const w = isFlyWin(match)
      byTournament[leagueName].total += 1
      if (w === true) byTournament[leagueName].wins += 1
      else if (w === false) byTournament[leagueName].losses += 1
    })

    const totalGames = wins + losses
    const winrate = totalGames > 0 ? Math.round(((wins / totalGames) * 100) * 10) / 10 : 0 // número con 1 decimal

    // Calcular winrate por torneo
    const tournamentStats = Object.entries(byTournament)
      .map(([name, data]) => ({
        name,
        wins: data.wins,
        losses: data.losses,
        total: data.total,
        winrate: data.total > 0 ? Math.round(((data.wins / data.total) * 100) * 10) / 10 : 0
      }))
      .sort((a, b) => b.total - a.total)

    return {
      totalGames,
      wins,
      losses,
      winrate, // número
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
