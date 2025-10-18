import React, { useState } from 'react'

export default function BugReport() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [severity, setSeverity] = useState('low')
  const [status, setStatus] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/flyquest/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, url, severity })
      })
      if (res.status === 201) setStatus('Reportado')
      else setStatus('Error')
    } catch (e) {
      setStatus('Error')
    }
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-2xl shadow-xl bg-flyquest-dark/80 border border-flyquest-neon/30">
      <h3 className="font-semibold mb-2 text-flyquest-white">Reportar un fallo</h3>
      <input required className="w-full p-2 mb-2 border border-flyquest-neon/30 rounded bg-flyquest-dark/50 text-flyquest-white" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea required className="w-full p-2 mb-2 border border-flyquest-neon/30 rounded bg-flyquest-dark/50 text-flyquest-white" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="w-full p-2 mb-2 border border-flyquest-neon/30 rounded bg-flyquest-dark/50 text-flyquest-white" placeholder="URL (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} />
      <select className="w-full p-2 mb-2 border border-flyquest-neon/30 rounded bg-flyquest-dark/50 text-flyquest-white" value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-2xl bg-flyquest-neon text-flyquest-black">Enviar</button>
        <div className="text-sm text-flyquest-gray mt-2">{status}</div>
      </div>
    </form>
  )
}
