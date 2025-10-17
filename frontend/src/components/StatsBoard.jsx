import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

/**
 * Dashboard con gráficos avanzados de estadísticas de FlyQuest
 */
export default function StatsBoard({ matches, lang = 'es', dark = false }) {
  // Calcular datos para los gráficos
  const chartsData = useMemo(() => {
    if (!matches || matches.length === 0) {
      console.log('⚠️ StatsBoard: No hay partidos disponibles')
      return null
    }

    // Filtrar solo partidos completados
    const completedMatches = matches.filter(m => m.status === 'completed')
    
    if (completedMatches.length === 0) {
      console.log('⚠️ StatsBoard: No hay partidos completados')
      return null
    }

    console.log('✅ StatsBoard: Procesando', completedMatches.length, 'partidos completados')

    // Ordenar por fecha (más antiguo primero para gráfico de evolución)
    const sortedMatches = [...completedMatches].sort((a, b) => 
      new Date(a.startTime) - new Date(b.startTime)
    )

    // 1. EVOLUCIÓN DEL WINRATE A LO LARGO DEL TIEMPO
    const evolutionData = {
      labels: [],
      wins: [],
      losses: [],
      winrate: []
    }

    let cumulativeWins = 0
    let cumulativeLosses = 0

    sortedMatches.forEach((match, idx) => {
      const flyquestTeam = match.teams?.find(t => 
        t.name?.toLowerCase().includes('flyquest')
      )
      
      if (!flyquestTeam) return

      const isWin = flyquestTeam.result?.outcome === 'win'
      
      if (isWin) {
        cumulativeWins++
      } else {
        cumulativeLosses++
      }

      const totalGames = cumulativeWins + cumulativeLosses
      const currentWinrate = totalGames > 0 ? (cumulativeWins / totalGames) * 100 : 0

      // Agregar punto cada partido (o cada 5 partidos si hay muchos)
      if (sortedMatches.length <= 20 || idx % Math.ceil(sortedMatches.length / 20) === 0 || idx === sortedMatches.length - 1) {
        const date = new Date(match.startTime)
        evolutionData.labels.push(date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' }))
        evolutionData.wins.push(cumulativeWins)
        evolutionData.losses.push(cumulativeLosses)
        evolutionData.winrate.push(currentWinrate.toFixed(1))
      }
    })

    // 2. DISTRIBUCIÓN WIN/LOSS
    const totalWins = cumulativeWins
    const totalLosses = cumulativeLosses

    // 3. ESTADÍSTICAS POR TORNEO
    const byTournament = {}
    sortedMatches.forEach(match => {
      const flyquestTeam = match.teams?.find(t => 
        t.name?.toLowerCase().includes('flyquest')
      )
      
      if (!flyquestTeam) return

      const league = match.league || 'Unknown'
      if (!byTournament[league]) {
        byTournament[league] = { wins: 0, losses: 0 }
      }

      const isWin = flyquestTeam.result?.outcome === 'win'
      if (isWin) {
        byTournament[league].wins++
      } else {
        byTournament[league].losses++
      }
    })

    const tournamentLabels = Object.keys(byTournament)
    const tournamentWins = tournamentLabels.map(t => byTournament[t].wins)
    const tournamentLosses = tournamentLabels.map(t => byTournament[t].losses)
    const tournamentWinrates = tournamentLabels.map(t => {
      const total = byTournament[t].wins + byTournament[t].losses
      return total > 0 ? ((byTournament[t].wins / total) * 100).toFixed(1) : 0
    })

    // 4. ÚLTIMOS 10 PARTIDOS
    const last10 = sortedMatches.slice(-10).map(match => {
      const flyquestTeam = match.teams?.find(t => 
        t.name?.toLowerCase().includes('flyquest')
      )
      const isWin = flyquestTeam?.result?.outcome === 'win'
      const opponent = match.teams?.find(t => !t.name?.toLowerCase().includes('flyquest'))
      
      return {
        opponent: opponent?.code || opponent?.name?.substring(0, 3)?.toUpperCase() || 'TBD',
        result: isWin ? 1 : 0,
        date: new Date(match.startTime).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })
      }
    })

    return {
      evolution: evolutionData,
      distribution: { wins: totalWins, losses: totalLosses },
      tournaments: { labels: tournamentLabels, wins: tournamentWins, losses: tournamentLosses, winrates: tournamentWinrates },
      last10
    }
  }, [matches, lang])

  if (!chartsData) {
    return (
      <div className="bg-white dark:bg-flyquest-dark/50 rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-flyquest-green/20 dark:border-flyquest-neon/30">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {lang === 'es' 
            ? '📈 No hay suficientes datos para mostrar gráficos' 
            : '📈 Not enough data to display charts'}
        </div>
      </div>
    )
  }

  const texts = {
    es: {
      title: '📈 Análisis Estadístico Avanzado',
      evolutionTitle: 'Evolución del Winrate',
      distributionTitle: 'Distribución de Resultados',
      tournamentsTitle: 'Rendimiento por Torneo',
      last10Title: 'Últimos 10 Partidos',
      wins: 'Victorias',
      losses: 'Derrotas',
      winrate: 'Winrate',
      win: 'Victoria',
      loss: 'Derrota'
    },
    en: {
      title: '📈 Advanced Statistical Analysis',
      evolutionTitle: 'Winrate Evolution',
      distributionTitle: 'Results Distribution',
      tournamentsTitle: 'Performance by Tournament',
      last10Title: 'Last 10 Matches',
      wins: 'Wins',
      losses: 'Losses',
      winrate: 'Winrate',
      win: 'Win',
      loss: 'Loss'
    }
  }

  const t = texts[lang] || texts.es

  // Colores del tema
  const colors = {
    primary: dark ? 'rgba(0, 255, 159, 0.8)' : 'rgba(34, 197, 94, 0.8)',
    primaryBg: dark ? 'rgba(0, 255, 159, 0.1)' : 'rgba(34, 197, 94, 0.1)',
    secondary: dark ? 'rgba(255, 71, 87, 0.8)' : 'rgba(239, 68, 68, 0.8)',
    secondaryBg: dark ? 'rgba(255, 71, 87, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    text: dark ? '#E0E7EE' : '#1f2937',
    grid: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    background: dark ? '#0a0e1a' : '#ffffff'
  }

  // Configuración común para todos los gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: { size: 12, weight: 'bold' },
          padding: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: dark ? 'rgba(10, 14, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.primary,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y
              if (context.dataset.label === t.winrate) {
                label += '%'
              }
            }
            return label
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { 
          color: colors.text, 
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0
        },
        grid: { 
          color: colors.grid, 
          drawBorder: false,
          display: true
        }
      },
      y: {
        ticks: { 
          color: colors.text, 
          font: { size: 10 }
        },
        grid: { 
          color: colors.grid, 
          drawBorder: false,
          display: true
        }
      }
    }
  }

  // GRÁFICO 1: Evolución del Winrate
  const evolutionChartData = {
    labels: chartsData.evolution.labels,
    datasets: [
      {
        label: t.winrate,
        data: chartsData.evolution.winrate,
        borderColor: colors.primary,
        backgroundColor: colors.primaryBg,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: colors.background,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const evolutionOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false }
    },
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        min: 0,
        max: 100,
        ticks: {
          ...commonOptions.scales.y.ticks,
          callback: (value) => value + '%'
        }
      }
    }
  }

  // GRÁFICO 2: Distribución Win/Loss (Doughnut)
  const distributionChartData = {
    labels: [t.wins, t.losses],
    datasets: [
      {
        data: [chartsData.distribution.wins, chartsData.distribution.losses],
        backgroundColor: [colors.primary, colors.secondary],
        borderColor: [colors.primary, colors.secondary],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  }

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.text,
          font: { size: 12, weight: 'bold' },
          padding: 15
        }
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const value = context.parsed
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  // GRÁFICO 3: Por Torneo (Barras)
  const tournamentsChartData = {
    labels: chartsData.tournaments.labels,
    datasets: [
      {
        label: t.wins,
        data: chartsData.tournaments.wins,
        backgroundColor: colors.primary,
        borderRadius: 8,
        borderSkipped: false
      },
      {
        label: t.losses,
        data: chartsData.tournaments.losses,
        backgroundColor: colors.secondary,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  }

  const tournamentsOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      x: {
        ...commonOptions.scales.x,
        stacked: false
      },
      y: {
        ...commonOptions.scales.y,
        stacked: false,
        beginAtZero: true,
        ticks: {
          ...commonOptions.scales.y.ticks,
          stepSize: 1
        }
      }
    }
  }

  // GRÁFICO 4: Últimos 10 partidos (mini barras)
  const last10ChartData = {
    labels: chartsData.last10.map(m => m.opponent),
    datasets: [
      {
        label: t.last10Title,
        data: chartsData.last10.map(m => m.result),
        backgroundColor: chartsData.last10.map(m => m.result === 1 ? colors.primary : colors.secondary),
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  }

  const last10Options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          title: (context) => {
            const idx = context[0].dataIndex
            return `vs ${chartsData.last10[idx].opponent} - ${chartsData.last10[idx].date}`
          },
          label: (context) => {
            return context.parsed.y === 1 ? `✅ ${t.win}` : `❌ ${t.loss}`
          }
        }
      }
    },
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        min: 0,
        max: 1,
        ticks: {
          ...commonOptions.scales.y.ticks,
          stepSize: 1,
          callback: (value) => value === 1 ? 'W' : value === 0 ? 'L' : ''
        }
      }
    }
  }

  return (
    <div className="bg-white dark:bg-flyquest-dark/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm border border-flyquest-green/20 dark:border-flyquest-neon/30 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {t.title}
        </h2>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución del Winrate */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📈 {t.evolutionTitle}
          </h3>
          <div className="h-64">
            <Line data={evolutionChartData} options={evolutionOptions} />
          </div>
        </div>

        {/* Distribución Win/Loss */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            🥧 {t.distributionTitle}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut data={distributionChartData} options={distributionOptions} />
            </div>
          </div>
        </div>

        {/* Rendimiento por Torneo */}
        {chartsData.tournaments.labels.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              🏆 {t.tournamentsTitle}
            </h3>
            <div className="h-64">
              <Bar data={tournamentsChartData} options={tournamentsOptions} />
            </div>
          </div>
        )}

        {/* Últimos 10 Partidos */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            🎮 {t.last10Title}
          </h3>
          <div className="h-48">
            <Bar data={last10ChartData} options={last10Options} />
          </div>
        </div>
      </div>
    </div>
  )
}
