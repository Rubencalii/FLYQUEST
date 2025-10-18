import React from 'react';
import PlayerStats from './PlayerStats';

export default function FlyQuestDashboard() {
  return (
    <div className="flyquest-landing">
      <header className="flyquest-header">
        <img src="/public/logo.png" alt="FlyQuest" style={{height:'64px',width:'64px',marginBottom:'1.2rem'}} />
        <h1>FlyQuest Dashboard</h1>
        <span className="flyquest-badge">Panel Oficial</span>
        <p>Bienvenido al panel oficial de FlyQuest. Aquí puedes ver el calendario, roster y estadísticas del equipo.</p>
      </header>

      <main>
        <section className="flyquest-section" id="alerts">
          <h3 style={{textAlign:'center',color:'#00EBAA',marginBottom:'1.2rem'}}>Alertas & Notificaciones</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'0.7rem',alignItems:'center'}}>
            <div><span>🔔</span> <span>Notificaciones importantes</span></div>
            <div><span>⚡</span> <span>Alertas de partidos</span></div>
            <div><span>⏰</span> <span>Horarios actualizados</span></div>
          </div>
        </section>

        <section className="flyquest-section" id="roster">
          <div className="flyquest-roster">
            <PlayerStats />
          </div>
        </section>

        <section className="flyquest-section" id="stats" style={{marginBottom:'2.5rem'}}>
          <h3 style={{textAlign:'center',color:'#FFD600',marginBottom:'1.2rem'}}>Estadísticas Generales</h3>
          <div style={{textAlign:'center',color:'#fff'}}>Próximamente: estadísticas avanzadas y logros.</div>
        </section>

        <div className="flyquest-socials">
          <a href="https://twitter.com/FlyQuest" target="_blank" rel="noopener noreferrer"><img src="/public/x.svg" alt="X" className="flyquest-social-icon" /></a>
          <a href="https://instagram.com/flyquest" target="_blank" rel="noopener noreferrer"><img src="/public/instagram.svg" alt="Instagram" className="flyquest-social-icon" /></a>
          <a href="https://youtube.com/flyquest" target="_blank" rel="noopener noreferrer"><img src="/public/youtube.svg" alt="YouTube" className="flyquest-social-icon" /></a>
          <a href="https://twitch.tv/flyquest" target="_blank" rel="noopener noreferrer"><img src="/public/twitch.svg" alt="Twitch" className="flyquest-social-icon" /></a>
        </div>
      </main>

      <footer className="flyquest-footer">
        FlyQuest © 2025
      </footer>
    </div>
  );
}
