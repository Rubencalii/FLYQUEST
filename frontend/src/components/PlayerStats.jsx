import React, { useEffect, useState } from 'react';


// Animación shimmer para el loading
const shimmerStyle = {
  background: 'linear-gradient(90deg, #222 25%, #333 50%, #222 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

// Animación CSS para el resplandor
const glowStyle = {
  boxShadow: '0 0 16px 4px #facc15, 0 0 32px 8px #fde68a',
  transition: 'box-shadow 0.4s',
};

// Iconos de rol
const roleIcons = {
  Top: '🗻',
  Jungla: '🌲',
  Mid: '⭐',
  ADC: '🏹',
  Soporte: '🛡️'
};
// Bandera por país
const countryFlags = {
  'Bélgica': '🇧🇪',
  'Polonia': '🇵🇱',
  'Australia': '🇦🇺',
  'Chile': '🇨🇱',
  'EE.UU.': '🇺🇸'
};

export default function PlayerStats() {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flyquest/roster')
      .then(res => res.json())
      .then(data => {
        setRoster(data.roster || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-flyquest-green via-flyquest-neon to-black text-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto animate-fade-in border-4 border-flyquest-neon overflow-hidden">
      {/* Fondo de partículas animadas */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-flyquest-neon opacity-30 animate-particle"
            style={{
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      <h2 className="text-4xl font-extrabold mb-8 text-center tracking-wide animate-fade-in text-flyquest-neon drop-shadow-xl z-10 relative" style={{textShadow:'0 0 32px #00ffb2, 0 0 8px #fff'}}>Roster FlyQuest 2025</h2>
      {loading ? (
        <div className="flex flex-col gap-4 z-10 relative">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg" style={shimmerStyle}></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 relative">
          {roster.map(player => (
            <div
              key={player.id}
              className="flex items-center gap-4 bg-black/70 rounded-xl p-6 transition-all duration-500 hover:scale-105 hover:bg-flyquest-green/30 animate-fade-in border-2 border-flyquest-neon shadow-lg"
              style={{ animationDelay: `${player.id * 0.1}s` }}
            >
              <div className="relative">
                <img
                  src={player.image || '/public/placeholder.png'}
                  alt={player.name}
                  className="w-20 h-20 rounded-full border-4 border-flyquest-neon shadow-xl"
                  style={glowStyle}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 32px 8px #00ffb2, 0 0 64px 16px #00ffb2'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = glowStyle.boxShadow}
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-flyquest-neon text-black text-xs font-bold shadow-lg animate-bounce border border-flyquest-green">FLY</span>
              </div>
              <div>
                <div className="font-semibold text-2xl mb-1 animate-fade-in text-flyquest-green drop-shadow flex items-center gap-2">
                  {roleIcons[player.role] || '👤'} {player.name}
                </div>
                <div className="text-flyquest-neon font-bold animate-pulse text-lg flex items-center gap-2">
                  {player.role}
                </div>
                <div className="text-xs text-flyquest-green mt-2 animate-fade-in flex items-center gap-2">
                  <span className="text-lg">{countryFlags[player.country] || '🌎'}</span> {player.country}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes particle {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0.1; }
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; }
        .animate-bounce { animation: bounce 1.2s infinite; }
        .animate-particle { animation: particle 3s linear infinite; }
        .text-flyquest-green { color: #00ffb2; }
        .text-flyquest-neon { color: #00ffb2; }
        .bg-flyquest-green { background: #00ffb2; }
        .bg-flyquest-neon { background: #00ffb2; }
        .border-flyquest-green { border-color: #00ffb2; }
        .border-flyquest-neon { border-color: #00ffb2; }
        .drop-shadow-lg { filter: drop-shadow(0 0 8px #00ffb2); }
        .drop-shadow { filter: drop-shadow(0 0 4px #00ffb2); }
        .drop-shadow-xl { filter: drop-shadow(0 0 24px #00ffb2); }
      `}</style>
    </div>
  );
}
