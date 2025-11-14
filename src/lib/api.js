const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export const api = {
  base: BASE_URL,
  async get(path) {
    const res = await fetch(`${BASE_URL}${path}`)
    if (!res.ok) throw new Error(`GET ${path} failed`)
    return res.json()
  },
  async post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    })
    if (!res.ok) throw new Error(`POST ${path} failed`)
    return res.json()
  },
  async put(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    })
    if (!res.ok) throw new Error(`PUT ${path} failed`)
    return res.json()
  },
  async del(path) {
    const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`DELETE ${path} failed`)
    return res.json()
  },
}

export const seed = () => api.post('/api/seed')
