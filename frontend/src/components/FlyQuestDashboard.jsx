import React, { useEffect, useState } from 'react';
import PlayerStats from './PlayerStats';

export default function FlyQuestDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState({ winrate: null, achievements: [] });
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('/api/flyquest/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(() => setAlerts([]));
    fetch('/api/flyquest/roster')
      .then(res => res.json())
      .then(data => setRoster(data))
      .catch(() => setRoster([]));
    fetch('/api/flyquest/player-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats({ winrate: null, achievements: [] }));
    fetch('/api/flyquest/matches')
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(() => setMatches([]));
  }, []);

  return (
    <div className="dashboard-main">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div className="dashboard-logo-title">
          <img src="/public/logo.png" alt="FlyQuest" className="dashboard-logo" />
          <div>
            <h1 className="dashboard-title">FlyQuest Dashboard</h1>
            <span className="dashboard-timezone">Horario: Europe/Madrid</span>
          </div>
        </div>
        <div className="dashboard-controls">
          <select className="dashboard-lang"><option>ES es</option></select>
          <select className="dashboard-tz"><option>Europe/Madrid</option></select>
          <button className="dashboard-btn">Actualizar</button>
          <button className="dashboard-btn dashboard-btn-report">Reportar</button>
          <button className="dashboard-btn dashboard-btn-admin">Admin</button>
        </div>
      </header>

      {/* Panel de partidos */}
      <section className="dashboard-matches">
        <div className="dashboard-matches-header">
          <h2>Partidos</h2>
          <div className="dashboard-match-filters">
            <button className="dashboard-btn dashboard-btn-active">Todos</button>
            <button className="dashboard-btn">Esta semana</button>
            <button className="dashboard-btn">Este mes</button>
          </div>
          <div className="dashboard-competition-filters">
            <button className="dashboard-btn dashboard-btn-active">Todas</button>
            <button className="dashboard-btn">LCS</button>
            <button className="dashboard-btn">Worlds</button>
            <button className="dashboard-btn">MSI</button>
            <button className="dashboard-btn">First Stand</button>
          </div>
        </div>
        <div className="dashboard-matches-list">
          {matches.length > 0 ? matches.map((match, i) => (
            <div key={i} className={`dashboard-match-card dashboard-match-status-${match.status}`}>
              <div className="dashboard-match-date">{match.date}</div>
              <div className="dashboard-match-teams">
                <span className="dashboard-team-name">{match.team1}</span>
                <span className="dashboard-team-score">{match.score1}</span>
                <span className="dashboard-vs">VS</span>
                <span className="dashboard-team-name">{match.team2}</span>
                <span className="dashboard-team-score">{match.score2}</span>
              </div>
              <div className="dashboard-match-actions">
                <span className={`dashboard-match-status dashboard-match-status-${match.status}`}>{match.status}</span>
                <span className="dashboard-match-time">{match.time}</span>
                <span className="dashboard-match-league">{match.league}</span>
                <button className="dashboard-btn-small" onClick={() => window.open(match.calendarUrl, '_blank')}>Compartir</button>
              </div>
            </div>
          )) : <div className="dashboard-match-card">No hay partidos programados.</div>}
        </div>
      </section>

      {/* Roster */}
      <aside className="dashboard-roster">
        <h2>Roster</h2>
        <div className="dashboard-roster-list">
          {roster.length > 0 ? roster.map((player, i) => (
            <div key={i} className="dashboard-roster-card">
              <img src={player.photo} alt={player.name} className="dashboard-roster-photo" />
              <div>
                <div className="dashboard-roster-name">{player.name}</div>
                <div className="dashboard-roster-role">{player.role} &mdash; {player.country}</div>
              </div>
            </div>
          )) : <div className="dashboard-roster-card">No hay jugadores disponibles.</div>}
          {/* Staff técnico */}
          <div className="dashboard-roster-card dashboard-roster-staff">
            <div className="dashboard-roster-staff-icon">A</div>
            <div>
              <div className="dashboard-roster-name">Arrow</div>
              <div className="dashboard-roster-role">Entrenador Principal</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="dashboard-socials">
          <a href="https://twitter.com/FlyQuest" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com/flyquest" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://youtube.com/flyquest" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="https://twitch.tv/flyquest" target="_blank" rel="noopener noreferrer">Twitch</a>
        </div>
        <div className="dashboard-footer-community">Hecho con <span className="dashboard-heart">♥</span> por la comunidad</div>
      </footer>
    </div>
  );
}
