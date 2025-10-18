import React from 'react';
import PlayerStats from './PlayerStats';

export default function FlyQuestDashboard() {
  return (
    <div className="flyquest-landing">
      {/* Encabezado principal */}
      <header className="flyquest-header">
        <img src="/public/logo.png" alt="FlyQuest" style={{height:'72px',width:'72px',marginBottom:'1.5rem'}} />
        <h1 style={{fontSize:'2.7rem',fontWeight:'900',letterSpacing:'2px',marginBottom:'0.5rem'}}>FlyQuest Dashboard</h1>
        <span className="flyquest-badge">Panel Oficial</span>
        <p style={{marginTop:'1rem',fontSize:'1.15rem',color:'#fff',opacity:0.85}}>Bienvenido al panel oficial de FlyQuest. Aquí puedes ver el calendario, roster y estadísticas del equipo.</p>
      </header>

      {/* Panel de alertas */}
      <section className="flyquest-section" id="alerts">
        <h3 style={{textAlign:'center',color:'#00EBAA',marginBottom:'1.2rem',fontWeight:'700'}}>Alertas & Notificaciones</h3>
        <div style={{display:'flex',flexDirection:'column',gap:'0.9rem',alignItems:'center'}}>
          <div><span>🔔</span> <span>Notificaciones importantes</span></div>
          <div><span>⚡</span> <span>Alertas de partidos</span></div>
          <div><span>⏰</span> <span>Horarios actualizados</span></div>
        </div>
      </section>

      {/* Roster vertical animado */}
      <section className="flyquest-section" id="roster">
        <h3 style={{textAlign:'center',color:'#FFD600',marginBottom:'1.2rem',fontWeight:'700'}}>Roster FlyQuest</h3>
        <div className="flyquest-roster">
          <PlayerStats />
        </div>
      </section>

      {/* Estadísticas generales */}
      <section className="flyquest-section" id="stats" style={{marginBottom:'2.5rem'}}>
        <h3 style={{textAlign:'center',color:'#00EBAA',marginBottom:'1.2rem',fontWeight:'700'}}>Estadísticas Generales</h3>
        <div style={{textAlign:'center',color:'#fff',fontSize:'1.05rem'}}>Próximamente: estadísticas avanzadas y logros.</div>
      </section>

      {/* Redes sociales integradas */}
      <div className="flyquest-socials">
        <a href="https://twitter.com/FlyQuest" target="_blank" rel="noopener noreferrer"><img src="/public/x.svg" alt="X" className="flyquest-social-icon" /></a>
        <a href="https://instagram.com/flyquest" target="_blank" rel="noopener noreferrer"><img src="/public/instagram.svg" alt="Instagram" className="flyquest-social-icon" /></a>
        <a href="https://youtube.com/flyquest" target="_blank" rel="noopener noreferrer"><img src="/public/youtube.svg" alt="YouTube" className="flyquest-social-icon" /></a>
        <a href="https://twitch.tv/flyquest" target="_blank" rel="noopener noreferrer"><img src="/public/twitch.svg" alt="Twitch" className="flyquest-social-icon" /></a>
      </div>

      {/* Footer */}
      <footer className="flyquest-footer">
        FlyQuest © 2025
      </footer>
    </div>
  );
}
