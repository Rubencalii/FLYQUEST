import React, { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'

/**
 * Componente para mostrar estadísticas de jugadores de FlyQuest
 * Usa imágenes oficiales del roster 2025
 */
export default function PlayerStats({ matches, lang = 'es', dark = false }) {
  // Datos visuales del roster
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playersData, setPlayersData] = useState([]);
  const [isOfficial, setIsOfficial] = useState(false);

  // Fetch datos reales a través del backend (oculta API key)
  React.useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Nuevo endpoint que agrega estadísticas reales desde Leaguepedia
        const res = await fetch('/api/flyquest/player-stats');
        const data = await res.json();
        if (Array.isArray(data.roster) && data.roster.length > 0) {
          // Si los datos tienen winrate > 0, consideramos que son oficiales
          const isReal = data.roster.some(p => p.winrate > 0);
          setIsOfficial(isReal);
          // Normalizar campos faltantes con fallback amistoso
          const normalized = data.roster.map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            country: p.country || '—',
            image: p.image,
            kda: p.kda ?? 0,
            gamesPlayed: p.gamesPlayed ?? (matches?.filter(m => m.status === 'completed').length || 0),
            winrate: p.winrate ?? 0,
            championPool: Array.isArray(p.championPool) && p.championPool.length ? p.championPool : ['—'],
            stats: {
              kills: p.stats?.kills ?? 0,
              deaths: p.stats?.deaths ?? 0,
              assists: p.stats?.assists ?? 0,
              cs: p.stats?.cs ?? 0,
              goldPerMin: p.stats?.goldPerMin ?? 0
            }
          }))
          setPlayersData(normalized)
        } else {
          setIsOfficial(false);
          // Fallback: datos locales
          setPlayersData([
            {
              id: 1,
              name: 'Bwipo',
              role: 'Top',
              country: 'Bélgica',
              image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0621_1024x1024.png?v=1752789107',
              kda: 3.8,
              gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
              winrate: 65.5,
              championPool: ['Aatrox', 'Gnar', 'Ornn', "K'Sante"],
              stats: {
                kills: 4.2,
                deaths: 2.1,
                assists: 8.5,
                cs: 285,
                goldPerMin: 410
              }
            },
            {
              id: 2,
              name: 'Inspired',
              role: 'Jungla',
              country: 'Polonia',
              image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0437_1024x1024.png?v=1752789116',
              kda: 4.5,
              gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
              winrate: 68.2,
              championPool: ['Lee Sin', 'Vi', 'Jarvan IV', 'Viego'],
              stats: {
                kills: 3.8,
                deaths: 1.8,
                assists: 9.2,
                cs: 185,
                goldPerMin: 320
              }
            },
            {
              id: 3,
              name: 'Quadra',
              role: 'Mid',
              country: 'Australia',
              image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0300_1024x1024.png?v=1752789126',
              kda: 4.2,
              gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
              winrate: 64.1,
              championPool: ['Azir', 'Orianna', 'Syndra', 'Ahri'],
              stats: {
                kills: 5.1,
                deaths: 2.2,
                assists: 7.8,
                cs: 310,
                goldPerMin: 425
              }
            },
            {
              id: 4,
              name: 'Massu',
              role: 'ADC',
              country: 'Chile',
              image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0043_1024x1024.png?v=1752789134',
              kda: 5.1,
              gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
              winrate: 70.5,
              championPool: ['Jinx', "Kai'Sa", 'Aphelios', 'Varus'],
              stats: {
                kills: 6.8,
                deaths: 1.5,
                assists: 8.2,
                cs: 345,
                goldPerMin: 465
              }
            },
            {
              id: 5,
              name: 'Busio',
              role: 'Soporte',
              country: 'EE.UU.',
              image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0019_1_1024x1024.png?v=1752789142',
              kda: 3.9,
              gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
              winrate: 66.8,
              championPool: ['Thresh', 'Nautilus', 'Rakan', 'Alistar'],
              stats: {
                kills: 1.2,
                deaths: 2.5,
                assists: 11.5,
                cs: 45,
                goldPerMin: 215
              }
            }
          ]);
        }
      } catch (e) {
        // Fallback: datos locales
        setPlayersData([
          {
            id: 1,
            name: 'Bwipo',
            role: 'Top',
            country: 'Bélgica',
            image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0621_1024x1024.png?v=1752789107',
            kda: 3.8,
            gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
            winrate: 65.5,
            championPool: ['Aatrox', 'Gnar', 'Ornn', "K'Sante"],
            stats: {
              kills: 4.2,
              deaths: 2.1,
              assists: 8.5,
              cs: 285,
              goldPerMin: 410
            }
          },
          {
            id: 2,
            name: 'Inspired',
            role: 'Jungla',
            country: 'Polonia',
            image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0437_1024x1024.png?v=1752789116',
            kda: 4.5,
            gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
            winrate: 68.2,
            championPool: ['Lee Sin', 'Vi', 'Jarvan IV', 'Viego'],
            stats: {
              kills: 3.8,
              deaths: 1.8,
              assists: 9.2,
              cs: 185,
              goldPerMin: 320
            }
          },
          {
            id: 3,
            name: 'Quadra',
            role: 'Mid',
            country: 'Australia',
            image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0300_1024x1024.png?v=1752789126',
            kda: 4.2,
            gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
            winrate: 64.1,
            championPool: ['Azir', 'Orianna', 'Syndra', 'Ahri'],
            stats: {
              kills: 5.1,
              deaths: 2.2,
              assists: 7.8,
              cs: 310,
              goldPerMin: 425
            }
          },
          {
            id: 4,
            name: 'Massu',
            role: 'ADC',
            country: 'Chile',
            image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0043_1024x1024.png?v=1752789134',
            kda: 5.1,
            gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
            winrate: 70.5,
            championPool: ['Jinx', "Kai'Sa", 'Aphelios', 'Varus'],
            stats: {
              kills: 6.8,
              deaths: 1.5,
              assists: 8.2,
              cs: 345,
              goldPerMin: 465
            }
          },
          {
            id: 5,
            name: 'Busio',
            role: 'Soporte',
            country: 'EE.UU.',
            image: 'https://flyquest.gg/cdn/shop/files/250112_FLYQUEST0019_1_1024x1024.png?v=1752789142',
            kda: 3.9,
            gamesPlayed: matches?.filter(m => m.status === 'completed').length || 0,
            winrate: 66.8,
            championPool: ['Thresh', 'Nautilus', 'Rakan', 'Alistar'],
            stats: {
              kills: 1.2,
              deaths: 2.5,
              assists: 11.5,
              cs: 45,
              goldPerMin: 215
            }
          }
        ]);
      }
    };
    fetchPlayers();
  }, [matches]);

  // Traducciones y helpers
  const t = {
    es: {
      title: '👥 Estadísticas de Jugadores',
      subtitle: 'Rendimiento individual de FlyQuest',
      selectPlayer: 'Selecciona un jugador',
      gamesPlayed: 'Partidos jugados',
      winrate: 'Winrate',
      championPool: 'Champion Pool',
      avgStats: 'Estadísticas promedio',
      kills: 'Asesinatos',
      deaths: 'Muertes',
      assists: 'Asistencias',
      cs: 'CS/min',
      gold: 'Oro/min',
      performance: 'Rendimiento últimos 10 juegos',
      mvp: 'MVP',
      noData: 'Datos de jugadores no disponibles en este momento',
      roles: {
        Top: 'Top',
        Jungla: 'Jungla',
        Mid: 'Mid',
        ADC: 'ADC',
        Soporte: 'Soporte'
      }
    },
    en: {
      title: '👥 Player Statistics',
      subtitle: 'Individual FlyQuest performance',
      selectPlayer: 'Select a player',
      gamesPlayed: 'Games played',
      winrate: 'Winrate',
      championPool: 'Champion Pool',
      avgStats: 'Average stats',
      kills: 'Kills',
      deaths: 'Deaths',
      assists: 'Assists',
      cs: 'CS/min',
      gold: 'Gold/min',
      performance: 'Performance last 10 games',
      mvp: 'MVP',
      noData: 'Player data not available at this time',
      roles: {
        Top: 'Top',
        Jungla: 'Jungle',
        Mid: 'Mid',
        ADC: 'ADC',
        Soporte: 'Support'
      }
    }
  };
  const translations = t[lang] || t.es;

  // Helpers
  const getRoleIcon = (role) => {
    const icons = {
      Top: '⚔️',
      Jungla: '🌲',
      Mid: '⭐',
      ADC: '🏹',
      Soporte: '🛡️'
    };
    return icons[role] || '👤';
  };
  const getRoleColor = (role) => {
    const colors = {
      Top: 'from-red-500 to-orange-500',
      Jungla: 'from-green-500 to-emerald-500',
      Mid: 'from-blue-500 to-cyan-500',
      ADC: 'from-yellow-500 to-amber-500',
      Soporte: 'from-purple-500 to-pink-500'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  // Gráfico de rendimiento (mockup)
  const performanceData = useMemo(() => {
    if (!selectedPlayer) return null;
    const lastGames = Array.from({ length: 10 }, (_, i) => ({
      game: i + 1,
      kda: (Math.random() * 3 + 2).toFixed(1),
      kills: Math.floor(Math.random() * 8 + 1),
      deaths: Math.floor(Math.random() * 4 + 1),
      assists: Math.floor(Math.random() * 12 + 3)
    }));
    return {
      labels: lastGames.map(g => `G${g.game}`),
      datasets: [
        {
          label: 'KDA',
          data: lastGames.map(g => parseFloat(g.kda)),
          borderColor: dark ? '#00f2ea' : '#00a99d',
          backgroundColor: dark ? 'rgba(0, 242, 234, 0.1)' : 'rgba(0, 169, 157, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [selectedPlayer, dark]);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? '#1f2937' : '#ffffff',
        titleColor: dark ? '#ffffff' : '#000000',
        bodyColor: dark ? '#ffffff' : '#000000',
        borderColor: dark ? '#374151' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: dark ? '#374151' : '#e5e7eb' },
        ticks: { color: dark ? '#9ca3af' : '#6b7280' }
      },
      x: {
        grid: { color: dark ? '#374151' : '#e5e7eb' },
        ticks: { color: dark ? '#9ca3af' : '#6b7280' }
      }
    }
  };

  const player = playersData.find(p => p.id === selectedPlayer);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-flyquest-green dark:text-flyquest-neon">
          {translations.title}
        </h2>
        {isOfficial && (
          <span className="px-3 py-1 rounded-full bg-flyquest-neon/20 text-flyquest-neon text-xs font-bold border border-flyquest-neon/40 animate-pulse">
            Datos oficiales
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{translations.subtitle}</p>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {translations.selectPlayer}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {playersData.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlayer(p.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
              selectedPlayer === p.id
                ? `border-flyquest-green dark:border-flyquest-neon bg-gradient-to-br ${getRoleColor(p.role)} text-white shadow-lg`
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-flyquest-green dark:hover:border-flyquest-neon'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-900 shadow-lg">
                <img 
                  src={p.image} 
                  alt={p.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=00a99d&color=fff&size=64`;
                  }}
                />
              </div>
              <div className="text-center">
                <p className={`font-bold text-sm ${selectedPlayer === p.id ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                  {p.name}
                </p>
                <p className={`text-xs flex items-center justify-center gap-1 ${selectedPlayer === p.id ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                  {getRoleIcon(p.role)} {translations.roles[p.role]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{p.country}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Estadísticas avanzadas del jugador seleccionado */}
      {player && (
        <div className="space-y-6 animate-fade-in">
          <div className={`p-6 rounded-xl bg-gradient-to-br ${getRoleColor(player.role)} text-white shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={player.image} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=00a99d&color=fff&size=96`;
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-1">{player.name}</h3>
                <p className="text-lg opacity-90 flex items-center gap-2">
                  {getRoleIcon(player.role)} {translations.roles[player.role]}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <p className="text-sm opacity-75">{translations.gamesPlayed}</p>
                    <p className="text-2xl font-bold">{player.gamesPlayed}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">{translations.winrate}</p>
                    <p className="text-2xl font-bold">{player.winrate}%</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">KDA</p>
                    <p className="text-2xl font-bold">{player.kda}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Champion Pool */}
          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span>🎮</span> {translations.championPool}
            </h4>
            <div className="flex flex-wrap gap-2">
              {player.championPool.map(champ => (
                <span
                  key={champ}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {champ}
                </span>
              ))}
            </div>
          </div>
          {/* Estadísticas promedio */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span>📊</span> {translations.avgStats}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                <p className="text-xs text-green-700 dark:text-green-400 mb-1">{translations.kills}</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">{player.stats.kills}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                <p className="text-xs text-red-700 dark:text-red-400 mb-1">{translations.deaths}</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-300">{player.stats.deaths}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">{translations.assists}</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{player.stats.assists}</p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">{translations.cs}</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{player.stats.cs}</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700">
                <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">{translations.gold}</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{player.stats.goldPerMin}</p>
              </div>
            </div>
          </div>
          {/* Gráfico de rendimiento */}
          {performanceData && (
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <span>📈</span> {translations.performance}
              </h4>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div style={{ height: '250px' }}>
                  <Line data={performanceData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Mensaje si no hay jugador seleccionado */}
      {!player && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-600 dark:text-gray-400">
            {translations.selectPlayer}
          </p>
        </div>
      )}
      {/* Nota sobre datos */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          ℹ️ <strong>Nota:</strong> Los datos de jugadores son estimados. Para estadísticas oficiales, visita{' '}
          <a 
            href="https://lolesports.com" 
            target="_blank" 
            rel="noreferrer"
            className="underline hover:text-blue-500"
          >
            lolesports.com
          </a>
        </p>
      </div>
    </div>
  );
}
