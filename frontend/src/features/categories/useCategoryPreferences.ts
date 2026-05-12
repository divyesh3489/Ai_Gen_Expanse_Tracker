import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useAuth } from '../../app/auth/AuthContext'
import { listUserCategoryPreferences } from './preferencesApi'

export const USER_CATEGORY_PREFERENCES_QUERY_KEY = ['user-category-preferences'] as const

export function useCategoryPreferencesMeta() {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY,
    queryFn: listUserCategoryPreferences,
    enabled: !!user,
    staleTime: 60_000,
  })

  const iconByCategoryName = useMemo(() => {
    const m = new Map<string, string>()
    for (const row of query.data ?? []) {
      const key = row.category_name?.trim()
      if (key) m.set(key, row.icon)
    }
    return m
  }, [query.data])

  const getIconForCategoryName = useCallback(
    (categoryName: string | undefined | null) => {
      if (!categoryName?.trim()) return undefined
      return iconByCategoryName.get(categoryName.trim())
    },
    [iconByCategoryName],
  )

  const getCategoryMeta = useCallback(
    (categoryName: string | undefined | null) => {
      const name = categoryName?.trim()
      if (!name) return { icon: undefined as string | undefined }
      return { icon: iconByCategoryName.get(name) }
    },
    [iconByCategoryName],
  )

  return { ...query, iconByCategoryName, getIconForCategoryName, getCategoryMeta }
}
