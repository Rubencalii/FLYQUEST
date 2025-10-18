
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
    <div className="bg-black text-white p-6 rounded-xl shadow-xl w-full max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-extrabold mb-6 text-center tracking-wide animate-fade-in">Roster FlyQuest 2025</h2>
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg" style={shimmerStyle}></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roster.map(player => (
            <div
              key={player.id}
              className="flex items-center gap-4 bg-gray-900 rounded-xl p-5 transition-all duration-500 hover:scale-105 hover:bg-yellow-900/10 animate-fade-in"
              style={{ animationDelay: `${player.id * 0.1}s` }}
            >
              <div className="relative">
                <img
                  src={player.image || '/public/placeholder.png'}
                  alt={player.name}
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg"
                  style={glowStyle}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 32px 8px #facc15, 0 0 64px 16px #fde68a'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = glowStyle.boxShadow}
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold shadow-lg animate-bounce">FLY</span>
              </div>
              <div>
                <div className="font-semibold text-xl mb-1 animate-fade-in">{player.name}</div>
                <div className="text-yellow-400 font-bold animate-pulse">{player.role}</div>
                <div className="text-xs text-gray-400 mt-1 animate-fade-in">{player.country}</div>
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
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; }
        .animate-bounce { animation: bounce 1.2s infinite; }
      `}</style>
    </div>
  );
}
