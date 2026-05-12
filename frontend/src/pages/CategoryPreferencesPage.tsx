import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import { listCategories } from '../features/categories/api'
import {
  createUserCategoryPreference,
  deleteUserCategoryPreference,
  listUserCategoryPreferences,
  updateUserCategoryPreference,
} from '../features/categories/preferencesApi'
import { renderIcon } from '../features/categories/renderIcon'
import type { UserCategoryPreferenceRow } from '../features/categories/types'
import { USER_CATEGORY_PREFERENCES_QUERY_KEY } from '../features/categories/useCategoryPreferences'

function mergeRow(
  rows: UserCategoryPreferenceRow[] | undefined,
  categoryId: number,
  patch: Partial<UserCategoryPreferenceRow>,
): UserCategoryPreferenceRow[] | undefined {
  if (!rows) return rows
  return rows.map((r) => (r.category === categoryId ? { ...r, ...patch } : r))
}

type CardProps = {
  row: UserCategoryPreferenceRow
  saving: boolean
  justSaved: boolean
  resetPending: boolean
  onCommit: (hex: string) => Promise<void>
  onReset: () => Promise<void>
}

function CategoryPreferenceCard({ row, saving, justSaved, resetPending, onCommit, onReset }: CardProps) {
  const [displayColor, setDisplayColor] = useState(row.custom_color)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCommitRef = useRef(onCommit)
  onCommitRef.current = onCommit

  useEffect(() => {
    setDisplayColor(row.custom_color)
  }, [row.custom_color, row.category, row.id])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const scheduleCommit = useCallback((hex: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      void onCommitRef.current(hex)
    }, 500)
  }, [])

  const locked = saving || resetPending

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${displayColor}2e`,
          }}
        >
          {renderIcon(row.icon, displayColor, 26)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{row.category_name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono">{displayColor}</span>
            {justSaved ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                Saved!
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span className="sr-only">Color for {row.category_name}</span>
          <input
            type="color"
            value={displayColor}
            disabled={locked}
            onChange={(e) => {
              const v = e.target.value
              setDisplayColor(v)
              scheduleCommit(v)
            }}
            className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        {row.id != null ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={locked}
            onClick={() => void onReset()}
          >
            {resetPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Resetting…
              </>
            ) : (
              'Reset'
            )}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

export function CategoryPreferencesPage() {
  const queryClient = useQueryClient()
  const [pageError, setPageError] = useState<string | null>(null)
  const [savingCategories, setSavingCategories] = useState<Set<number>>(() => new Set())
  const [resettingCategories, setResettingCategories] = useState<Set<number>>(() => new Set())
  const [savedPulse, setSavedPulse] = useState<number | null>(null)
  const [resetAllOpen, setResetAllOpen] = useState(false)
  const [resetAllPending, setResetAllPending] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const categories = useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => listCategories({ type: 'expense' }),
  })

  const preferences = useQuery({
    queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY,
    queryFn: listUserCategoryPreferences,
  })

  const expenseIdSet = useMemo(() => new Set((categories.data ?? []).map((c) => c.id)), [categories.data])

  const expensePreferenceRows = useMemo(
    () => (preferences.data ?? []).filter((r) => expenseIdSet.has(r.category)),
    [preferences.data, expenseIdSet],
  )

  const bumpSaved = useCallback((categoryId: number) => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setSavedPulse(categoryId)
    savedTimerRef.current = setTimeout(() => {
      savedTimerRef.current = null
      setSavedPulse(null)
    }, 2000)
  }, [])

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const commitColor = useCallback(
    async (categoryId: number, hex: string) => {
      const rows = queryClient.getQueryData<UserCategoryPreferenceRow[]>(USER_CATEGORY_PREFERENCES_QUERY_KEY)
      const row = rows?.find((r) => r.category === categoryId)
      if (!row) return

      setPageError(null)
      setSavingCategories((prev) => new Set(prev).add(categoryId))
      try {
        if (row.id == null) {
          const created = await createUserCategoryPreference({ category: categoryId, custom_color: hex })
          queryClient.setQueryData<UserCategoryPreferenceRow[]>(USER_CATEGORY_PREFERENCES_QUERY_KEY, (prev) =>
            mergeRow(prev, categoryId, {
              id: created.id,
              custom_color: created.custom_color,
              category_name: created.category_name || row.category_name,
            }),
          )
        } else {
          const updated = await updateUserCategoryPreference(row.id, { category: categoryId, custom_color: hex })
          queryClient.setQueryData<UserCategoryPreferenceRow[]>(USER_CATEGORY_PREFERENCES_QUERY_KEY, (prev) =>
            mergeRow(prev, categoryId, {
              id: updated.id,
              custom_color: updated.custom_color,
              category_name: updated.category_name || row.category_name,
            }),
          )
        }
        void queryClient.invalidateQueries({ queryKey: ['categories'] })
        bumpSaved(categoryId)
      } catch (err: unknown) {
        setPageError(getErrorMessage(err, 'Could not save color.'))
        await queryClient.invalidateQueries({ queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY })
      } finally {
        setSavingCategories((prev) => {
          const next = new Set(prev)
          next.delete(categoryId)
          return next
        })
      }
    },
    [bumpSaved, queryClient],
  )

  const resetOne = useCallback(
    async (categoryId: number) => {
      const rows = queryClient.getQueryData<UserCategoryPreferenceRow[]>(USER_CATEGORY_PREFERENCES_QUERY_KEY)
      const row = rows?.find((r) => r.category === categoryId)
      if (!row || row.id == null) return

      setPageError(null)
      setResettingCategories((prev) => new Set(prev).add(categoryId))
      try {
        await deleteUserCategoryPreference(row.id)
        queryClient.setQueryData<UserCategoryPreferenceRow[]>(USER_CATEGORY_PREFERENCES_QUERY_KEY, (prev) =>
          mergeRow(prev, categoryId, {
            id: null,
            custom_color: row.default_color,
          }),
        )
        void queryClient.invalidateQueries({ queryKey: ['categories'] })
      } catch (err: unknown) {
        setPageError(getErrorMessage(err, 'Could not reset color.'))
        await queryClient.invalidateQueries({ queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY })
      } finally {
        setResettingCategories((prev) => {
          const next = new Set(prev)
          next.delete(categoryId)
          return next
        })
      }
    },
    [queryClient],
  )

  const resetAll = useCallback(async () => {
    const rows = queryClient.getQueryData<UserCategoryPreferenceRow[]>(USER_CATEGORY_PREFERENCES_QUERY_KEY) ?? []
    const toDelete = rows.filter((r) => r.id != null && expenseIdSet.has(r.category))
    if (!toDelete.length) {
      setResetAllOpen(false)
      return
    }

    setPageError(null)
    setResetAllPending(true)
    try {
      for (const r of toDelete) {
        if (r.id != null) {
          await deleteUserCategoryPreference(r.id)
        }
      }
      queryClient.setQueryData<UserCategoryPreferenceRow[]>(USER_CATEGORY_PREFERENCES_QUERY_KEY, (prev) =>
        (prev ?? []).map((row) =>
          expenseIdSet.has(row.category) && row.id != null
            ? { ...row, id: null, custom_color: row.default_color }
            : row,
        ),
      )
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      setResetAllOpen(false)
    } catch (err: unknown) {
      setPageError(getErrorMessage(err, 'Could not reset all colors.'))
      await queryClient.invalidateQueries({ queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY })
    } finally {
      setResetAllPending(false)
    }
  }, [expenseIdSet, queryClient])

  const isInitialLoading = preferences.isLoading || categories.isLoading
  const loadError = preferences.isError || categories.isError

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/app/settings"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Category colors</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Choose a tint for each expense category. Changes apply across the app.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 self-start"
          disabled={
            resetAllPending ||
            isInitialLoading ||
            loadError ||
            !expensePreferenceRows.some((r) => r.id != null)
          }
          title={
            expensePreferenceRows.some((r) => r.id != null)
              ? undefined
              : 'No custom colors to reset'
          }
          onClick={() => setResetAllOpen(true)}
        >
          Reset all
        </Button>
      </div>

      {pageError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
          {pageError}
        </div>
      ) : null}

      {isInitialLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50"
            />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
          Failed to load categories or preferences. Please refresh the page.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {expensePreferenceRows.map((row) => (
            <CategoryPreferenceCard
              key={row.category}
              row={row}
              saving={savingCategories.has(row.category)}
              resetPending={resettingCategories.has(row.category)}
              justSaved={savedPulse === row.category}
              onCommit={(hex) => commitColor(row.category, hex)}
              onReset={() => resetOne(row.category)}
            />
          ))}
        </div>
      )}

      {!isInitialLoading && !loadError && !expensePreferenceRows.length ? (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No expense categories found.</div>
      ) : null}

      {resetAllOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/70"
            aria-label="Close dialog"
            disabled={resetAllPending}
            onClick={() => !resetAllPending && setResetAllOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-md border border-slate-200 p-6 shadow-2xl dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Reset all category colors?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This removes your custom colors for every expense category and restores each one to its default.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" disabled={resetAllPending} onClick={() => setResetAllOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" disabled={resetAllPending} onClick={() => void resetAll()}>
                {resetAllPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white" /> Resetting…
                  </>
                ) : (
                  'Reset all'
                )}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
