/**
 * Cliente HTTP para la API REST del backend.
 * Maneja token Sanctum, normalización de errores y proxy de Vite en dev.
 *
 * API_BASE se configura vía env:
 * - VITE_API_BASE_URL debe ser URL absoluta: https://fulbapp-api-production.up.railway.app/api
 * - fallback: '/api' (usa el proxy de Vite en desarrollo)
 */

const raw = import.meta.env.VITE_API_BASE_URL ?? '/api'
// Si viene sin esquema (ej. desde panel Vercel), el navegador lo trata como path relativo → hay que forzar absoluta
const API_BASE =
  raw.startsWith('http://') || raw.startsWith('https://')
    ? raw
    : raw.startsWith('/')
      ? raw
      : `https://${raw}`
const TOKEN_KEY = 'fulbapp_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request(method, endpoint, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const options = { method, headers }
  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options)

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const err = new Error(data.message ?? `Error ${response.status}`)
    err.status = response.status
    throw err
  }

  return data
}

export const api = {
  get:    (endpoint)        => request('GET', endpoint),
  post:   (endpoint, body)  => request('POST', endpoint, body),
  put:    (endpoint, body)  => request('PUT', endpoint, body),
  patch:  (endpoint, body)  => request('PATCH', endpoint, body ?? null),
  delete: (endpoint)        => request('DELETE', endpoint),
}
