import React, { useState } from 'react'

export default function AdminDashboard({ matches, roster }) {
  const [token, setToken] = useState('')
  const [bugs, setBugs] = useState(null)
  const [error, setError] = useState(null)

  const loadBugs = async () => {
    try {
      const res = await fetch('/api/flyquest/bugs', { headers: { 'x-admin-token': token } })
      if (res.status === 401) return setError('Unauthorized')
      const json = await res.json()
      setBugs(json)
    } catch (e) {
      setError('Error cargando')
    }
  }

  return (
    <div className="p-4 rounded-2xl shadow-xl bg-white">
      <h3 className="font-semibold mb-2">Admin Dashboard</h3>
      <div className="mb-2">Matches: {matches?.length ?? 0} • Roster: {roster?.length ?? 0}</div>
      <input placeholder="Admin token" className="w-full p-2 mb-2 border rounded" value={token} onChange={(e) => setToken(e.target.value)} />
      <div className="flex gap-2 mb-3">
        <button onClick={loadBugs} className="px-3 py-2 rounded-2xl bg-flyquest-green text-white">Cargar bugs</button>
        <button onClick={() => { if (bugs) { const blob = new Blob([JSON.stringify(bugs, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'bugs.json'; a.click(); } }} className="px-3 py-2 rounded-2xl card">Descargar</button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {bugs && (
        <div className="space-y-2">
          {bugs.map((b) => (
            <div key={b.id} className="p-2 border rounded">
              <div className="font-semibold">{b.title} <span className="text-sm text-flyquest-gray">{b.severity}</span></div>
              <div className="text-sm">{b.description}</div>
              <div className="text-xs text-flyquest-gray">{b.createdAt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
