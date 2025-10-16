import React, { useEffect, useState } from 'react'

export default function FlyQuestRoster() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/rosterFlyQuest.json')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => console.error('load roster', e))
  }, [])

  if (!data) return <div>Cargando roster...</div>

  return (
    <div>
      <div className="mb-4">
        <div className="text-lg font-semibold">{data.team} — {data.league} ({data.season})</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.roster.map((p) => (
          <div key={p.name} className="p-3 rounded-2xl shadow-xl bg-gradient-to-r from-flyquest-green to-flyquest-blue text-white">
            <div className="flex items-center gap-3">
              <img src={p.photo} alt={p.name} className="w-16 h-16 rounded-full border-2 border-white object-cover" />
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-sm">{p.role} • {p.country}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-2xl shadow-inner bg-white/5 text-white">
        <div className="font-semibold">Coach</div>
        <div className="flex items-center gap-3 mt-2">
          <img src={data.coach.photo} alt={data.coach.name} className="w-12 h-12 rounded-full" />
          <div>
            <div className="font-medium">{data.coach.name}</div>
            <div className="text-sm">{data.coach.role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
