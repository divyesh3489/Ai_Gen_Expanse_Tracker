import { useCallback, useEffect, useMemo, useState } from 'react'
import { http } from '../api/http'
import { AuthContext, type User } from './AuthContext'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './authStorage'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    const access = getAccessToken()
    const refresh = getRefreshToken()
    if (!access || !refresh) {
      setUser(null)
      return
    }

    const res = await http.get<User>('/v1/user/me/')
    setUser(res.data)
  }, [])

  const login = useCallback(async (payload: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      const res = await http.post<{ access: string; refresh: string }>('/v1/user/login/', payload)
      setTokens({ access: res.data.access, refresh: res.data.refresh })
      await refreshMe()
    } finally {
      setIsLoading(false)
    }
  }, [refreshMe])

  const logout = useCallback(async () => {
    const refresh = getRefreshToken()
    try {
      if (refresh) {
        await http.post('/v1/user/logout/', { refresh })
      }
    } finally {
      clearTokens()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await refreshMe()
      } catch {
        clearTokens()
        if (mounted) setUser(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [refreshMe])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      refreshMe,
      login,
      logout,
    }),
    [isLoading, login, logout, refreshMe, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

