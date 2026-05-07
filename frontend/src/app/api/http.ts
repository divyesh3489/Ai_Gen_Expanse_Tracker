import axios from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/authStorage'

// We proxy API requests through nginx in Docker (or Vite dev proxy).
export const http = axios.create({
  baseURL: '/api',
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  const res = await axios.post<{ access: string }>('/api/v1/user/token/refresh/', { refresh })
  const access = res.data?.access
  if (!access) return null
  setTokens({ access, refresh })
  return access
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config
    const status = error?.response?.status
    if (!original || status !== 401 || original.__isRetry) {
      return Promise.reject(error)
    }

    original.__isRetry = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newAccess = await refreshPromise
      if (!newAccess) {
        clearTokens()
        return Promise.reject(error)
      }
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newAccess}`
      return http(original)
    } catch (e) {
      clearTokens()
      return Promise.reject(e)
    }
  },
)

