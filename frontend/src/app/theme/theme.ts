export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'finstackai.theme'

export function getStoredThemePreference(): ThemePreference {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

export function storeThemePreference(pref: ThemePreference) {
  localStorage.setItem(STORAGE_KEY, pref)
}

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeToDocument(mode: 'light' | 'dark') {
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

