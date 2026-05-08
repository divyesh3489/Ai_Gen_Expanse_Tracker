import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'
import {
  applyThemeToDocument,
  getStoredThemePreference,
  getSystemTheme,
  storeThemePreference,
  type ThemePreference,
} from './theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => getStoredThemePreference())
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const pref = getStoredThemePreference()
    return pref === 'system' ? getSystemTheme() : pref
  })

  useEffect(() => {
    applyThemeToDocument(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (preference !== 'system') return
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mql) return
    const handler = () => {
      const sys = getSystemTheme()
      setResolvedTheme(sys)
      applyThemeToDocument(sys)
    }
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [preference])

  function setPreference(next: ThemePreference) {
    setPreferenceState(next)
    storeThemePreference(next)
    const nextResolved = next === 'system' ? getSystemTheme() : next
    setResolvedTheme(nextResolved)
    applyThemeToDocument(nextResolved)
  }

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      resolvedTheme,
    }),
    [preference, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

