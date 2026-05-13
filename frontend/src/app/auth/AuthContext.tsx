import { createContext, useContext } from 'react'

export type User = {
  id?: number
  email: string
  first_name?: string
  last_name?: string
  gender?: string | null
  dob?: string | null
  is_verified?: boolean
  full_name?: string
  profile_picture?: string | null
  /** Django admin API access; matches backend `IsAuthenticated` + category write permissions. */
  is_staff?: boolean
}

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshMe: () => Promise<void>
  login: (payload: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

