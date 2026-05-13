import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { queryClient } from '../app/queryClient'
import { Button } from '../components/ui/Button'
import { RowActionButton } from '../components/ui/RowActionButton'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useCursorPagination } from '../hooks/useCursorPagination'
import { useInfiniteScrollSentinel } from '../hooks/useInfiniteScrollSentinel'
import { listCategories } from '../features/categories/api'
import { displayCategoryLabel, preferenceKeyFromRow } from '../features/categories/categoryDisplayUtils'
import { CategoryDisplay } from '../features/categories/CategoryDisplay'
import { createExpanse, deleteExpanse, updateExpanse } from '../features/expanses/api'
import type { Expanse } from '../features/expanses/types'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 border-b border-slate-100 py-3 dark:border-slate-800/80"
        >
          {Array.from({ length: cols }).map((__, j) => (
            <div
              key={j}
              className="h-4 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
              style={{ maxWidth: j === cols - 1 ? '6rem' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ExpensesPage() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [category, setCategory] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [pageSize, setPageSize] = useState(20)

  const categories = useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => listCategories({ type: 'expense' }),
  })

  const {
    results: expanses,
    loading,
    initialLoading,
    error,
    errorMessage,
    hasMore,
    loadMore,
    refresh,
  } = useCursorPagination<Expanse>('/v1/expanse/expanses/', {}, { pageSize })

  const sentinelRef = useRef<HTMLDivElement>(null)
  useInfiniteScrollSentinel(
    sentinelRef,
    { hasMore, loading, initialLoading, loadMore },
    expanses.length,
  )

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of categories.data ?? []) map.set(c.id, c.name)
    return map
  }, [categories.data])

  const categoryIdByName = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of categories.data ?? []) map.set(c.name.toLowerCase(), c.id)
    return map
  }, [categories.data])

  const invalidateDashboard = async () => {
    await queryClient.invalidateQueries({ queryKey: ['expanses'] })
  }

  const create = useMutation({
    mutationFn: createExpanse,
    onSuccess: async () => {
      setAmount('')
      setNote('')
      setEditingId(null)
      await refresh()
      await invalidateDashboard()
    },
  })

  const update = useMutation({
    mutationFn: (payload: {
      id: number
      category: number | null
      amount: string
      note?: string
      date: string
    }) => updateExpanse(payload.id, payload),
    onSuccess: async () => {
      setEditingId(null)
      setAmount('')
      setNote('')
      setCategory('')
      setDate(todayISO())
      await refresh()
      await invalidateDashboard()
    },
  })

  const remove = useMutation({
    mutationFn: deleteExpanse,
    onSuccess: async () => {
      await refresh()
      await invalidateDashboard()
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Expenses</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Add and review your daily spending.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm sm:items-end">
          <span className="text-slate-600 dark:text-slate-400">Page size</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-11 min-w-[10rem] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:focus:border-slate-700 dark:focus:ring-slate-300/20"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </label>
      </div>

      <Card className="p-4">
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (!amount.trim() || !date) return
            if (editingId) {
              update.mutate({
                id: editingId,
                category: category === '' ? null : category,
                amount: amount.trim(),
                note: note.trim() || undefined,
                date,
              })
            } else {
              create.mutate({
                category: category === '' ? null : category,
                amount: amount.trim(),
                note: note.trim() || undefined,
                date,
              })
            }
          }}
        >
          <label className="block lg:col-span-2">
            <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Category</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:focus:border-slate-700 dark:focus:ring-slate-300/20"
              value={category}
              onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Uncategorized</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="120.50" />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex items-end">
            <div className="flex w-full gap-2">
              <Button className="w-full" type="submit" disabled={create.isPending || update.isPending}>
                {create.isPending || update.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white" /> Saving…
                  </>
                ) : editingId ? (
                  'Save'
                ) : (
                  'Add'
                )}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setEditingId(null)
                    setCategory('')
                    setAmount('')
                    setNote('')
                    setDate(todayISO())
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-5">
            <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Groceries" />
          </div>
        </form>
      </Card>

      <Card className="p-4">
        {initialLoading ? (
          <TableSkeleton cols={5} />
        ) : error && expanses.length === 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-rose-700 dark:text-rose-200">{errorMessage ?? 'Failed to load expenses.'}</div>
            <Button type="button" variant="secondary" size="sm" onClick={() => void refresh()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-2">Date</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Note</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="min-w-[6rem] py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {expanses.map((e) => (
                    <tr
                      key={e.id}
                      className="group transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/45"
                    >
                      <td className="py-3 align-middle text-slate-700 dark:text-slate-200">{e.date}</td>
                      <td className="py-3 align-middle font-medium text-slate-900 dark:text-slate-50">
                        <CategoryDisplay
                          variant="table"
                          label={displayCategoryLabel(e, categoryNameById, '—')}
                          preferenceKey={preferenceKeyFromRow(e, categoryNameById)}
                          listColor={e.category_color}
                        />
                      </td>
                      <td className="py-3 align-middle text-slate-700 dark:text-slate-200">{e.note ?? '—'}</td>
                      <td className="py-3 align-middle text-right font-semibold text-slate-900 dark:text-slate-50">
                        {e.amount}
                      </td>
                      <td className="min-w-[6rem] py-3 text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <RowActionButton
                            variant="edit"
                            icon={Pencil}
                            disabled={remove.isPending || update.isPending}
                            onClick={() => {
                              setEditingId(e.id)
                              setAmount(String(e.amount ?? ''))
                              setNote(String(e.note ?? ''))
                              setDate(String(e.date ?? todayISO()))
                              const idFromNumber = typeof e.category === 'number' ? e.category : null
                              const label = (e.name ?? e.category_name)?.toString().toLowerCase()
                              const idFromLabel = label ? (categoryIdByName.get(label) ?? null) : null
                              setCategory(idFromNumber ?? idFromLabel ?? '')
                            }}
                            aria-label="Edit expense"
                          />
                          <RowActionButton
                            variant="delete"
                            icon={Trash2}
                            disabled={remove.isPending || update.isPending}
                            onClick={() => remove.mutate(e.id)}
                            aria-label="Delete expense"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!expanses.length && !error ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No expenses yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {hasMore ? (
              <div ref={sentinelRef} className="mt-4 h-3 w-full shrink-0" aria-hidden />
            ) : null}

            {!hasMore && expanses.length > 0 ? (
              <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                All records loaded ({expanses.length} shown)
              </p>
            ) : null}

            {error && expanses.length > 0 ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="text-sm text-rose-700 dark:text-rose-200">{errorMessage ?? 'Could not load more.'}</div>
                <Button type="button" variant="secondary" size="sm" onClick={() => void refresh()}>
                  Retry
                </Button>
              </div>
            ) : null}

            {!initialLoading && loading && expanses.length > 0 ? (
              <div className="mt-4 flex justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Spinner className="h-4 w-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
                Loading more…
              </div>
            ) : null}
          </>
        )}
      </Card>
    </div>
  )
}
