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
      .then(data => setAlerts(data.alerts || []))
      .catch(() => setAlerts([]));
    fetch('/api/flyquest/roster')
      .then(res => res.json())
      .then(data => setRoster(data.roster || []))
      .catch(() => setRoster([]));
    fetch('/api/flyquest/player-stats')
      .then(res => res.json())
      .then(data => setStats({
        winrate: data.winrate || null,
        achievements: data.achievements || []
      }))
      .catch(() => setStats({ winrate: null, achievements: [] }));
    fetch('/api/flyquest/matches')
      .then(res => res.json())
      .then(data => setMatches(data.matches || []))
      .catch(() => setMatches([]));
  }, []);

  return (
    <div className="dashboard-main">
      {/* Panel izquierdo: Partidos */}
      <div className="dashboard-left">
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
                <div className="dashboard-match-date">{new Date(match.startTime).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</div>
                <div className="dashboard-match-teams">
                  <span className="dashboard-team-name">{match.teams[0]?.name}</span>
                  <span className="dashboard-team-score">{match.teams[0]?.score}</span>
                  <span className="dashboard-vs">VS</span>
                  <span className="dashboard-team-name">{match.teams[1]?.name}</span>
                  <span className="dashboard-team-score">{match.teams[1]?.score}</span>
                </div>
                <div className="dashboard-match-actions">
                  <span className={`dashboard-match-status dashboard-match-status-${match.status}`}>{match.status}</span>
                  <span className="dashboard-match-league">{match.league}</span>
                  {/* Botón Google Calendar solo si el partido es futuro */}
                  {['unstarted', 'upcoming'].includes(match.status) && match.calendarUrl && (
                    <a className="dashboard-calendar-link" href={match.calendarUrl} target="_blank" rel="noopener noreferrer">Añadir a Google Calendar</a>
                  )}
                </div>
                {/* VOD de YouTube y directos de Twitch */}
                <div className="dashboard-match-vod">
                  {match.vodUrl && (
                    <a className="dashboard-vod-link" href={match.vodUrl} target="_blank" rel="noopener noreferrer">Ver VOD en YouTube</a>
                  )}
                  {match.twitchUrl && (
                    <a className="dashboard-twitch-link" href={match.twitchUrl} target="_blank" rel="noopener noreferrer">Ver directo en Twitch</a>
                  )}
                </div>
              </div>
            )) : <div className="dashboard-match-card">No hay partidos programados.</div>}
          </div>
        </section>
      </div>
      {/* Panel derecho: Roster */}
      <div className="dashboard-right">
        <aside className="dashboard-roster">
          <h2 className="dashboard-roster-title">Roster</h2>
          <div className="dashboard-roster-list">
            {roster.length > 0 ? roster.map((player, i) => (
              <div key={i} className="dashboard-roster-card">
                <img src={player.image} alt={player.name} className="dashboard-roster-photo" />
                <div className="dashboard-roster-info">
                  <div className="dashboard-roster-name">{player.name}</div>
                  <div className="dashboard-roster-role">{player.role} &mdash; {player.country}</div>
                  {player.twitter && (
                    <a href={player.twitter} target="_blank" rel="noopener noreferrer" className="dashboard-roster-social">Twitter</a>
                  )}
                </div>
              </div>
            )) : <div className="dashboard-roster-card">No hay jugadores disponibles.</div>}
            {/* Staff técnico */}
            <div className="dashboard-roster-card dashboard-roster-staff">
              <div className="dashboard-roster-staff-icon">🧑‍💼</div>
              <div className="dashboard-roster-info">
                <div className="dashboard-roster-name">Arrow</div>
                <div className="dashboard-roster-role">Entrenador Principal</div>
                <a href="https://twitter.com/Arrow" target="_blank" rel="noopener noreferrer" className="dashboard-roster-social">Twitter</a>
              </div>
            </div>
          </div>
        </aside>
        {/* Sección de estadísticas y logros */}
        <section className="dashboard-stats">
          <h2 className="dashboard-stats-title">Estadísticas</h2>
          <div className="dashboard-stats-winrate">
            <span className="dashboard-stats-label">Winrate:</span>
            <span className="dashboard-stats-value">{stats.winrate ? `${stats.winrate}%` : 'N/A'}</span>
          </div>
          <div className="dashboard-stats-achievements">
            <h3 className="dashboard-stats-achievements-title">Logros</h3>
            <ul className="dashboard-stats-achievements-list">
              {stats.achievements && stats.achievements.length > 0 ? stats.achievements.map((ach, i) => (
                <li key={i} className="dashboard-stats-achievement">
                  <span className="dashboard-stats-achievement-icon">🏆</span>
                  <span className="dashboard-stats-achievement-text">{ach}</span>
                </li>
              )) : <li className="dashboard-stats-achievement">Sin logros registrados.</li>}
            </ul>
          </div>
        </section>
      </div>
      {/* Footer siempre visible y mejorado */}
      <footer className="dashboard-footer">
        <div className="dashboard-socials">
          <a href="https://twitter.com/FlyQuest" target="_blank" rel="noopener noreferrer"><span>🐦</span>Twitter</a>
          <a href="https://instagram.com/flyquest" target="_blank" rel="noopener noreferrer"><span>📸</span>Instagram</a>
          <a href="https://youtube.com/flyquest" target="_blank" rel="noopener noreferrer"><span>▶️</span>YouTube</a>
          <a href="https://twitch.tv/flyquest" target="_blank" rel="noopener noreferrer"><span>🎮</span>Twitch</a>
        </div>
        <div className="dashboard-footer-community">Hecho con <span className="dashboard-heart">♥</span> por la comunidad FlyQuest</div>
      </footer>
    </div>
  );
}
