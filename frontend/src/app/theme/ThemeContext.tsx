import { createContext, useContext } from 'react'
import type { ThemePreference } from './theme'

export type ThemeContextValue = {
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
  resolvedTheme: 'light' | 'dark'
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

