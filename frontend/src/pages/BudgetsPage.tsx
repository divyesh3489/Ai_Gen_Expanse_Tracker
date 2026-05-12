import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { queryClient } from '../app/queryClient'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { listCategories } from '../features/categories/api'
import { displayCategoryLabel, preferenceKeyFromRow } from '../features/categories/categoryDisplayUtils'
import { CategoryDisplay } from '../features/categories/CategoryDisplay'
import { createBudget, deleteBudget, listBudgets, updateBudget } from '../features/budgets/api'

function monthStartISO() {
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  return start.toISOString().slice(0, 10)
}

function monthEndISO() {
  const d = new Date()
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return end.toISOString().slice(0, 10)
}

export function BudgetsPage() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [category, setCategory] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [startDate, setStartDate] = useState(monthStartISO())
  const [endDate, setEndDate] = useState(monthEndISO())

  const categories = useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => listCategories({ type: 'expense' }),
  })
  const budgets = useQuery({ queryKey: ['budgets'], queryFn: listBudgets })

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

  const create = useMutation({
    mutationFn: createBudget,
    onSuccess: async () => {
      setAmount('')
      setEditingId(null)
      await queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  const update = useMutation({
    mutationFn: (payload: {
      id: number
      category: number | null
      amount: string
      start_date: string
      end_date: string
    }) => updateBudget(payload.id, payload),
    onSuccess: async () => {
      setEditingId(null)
      setCategory('')
      setAmount('')
      setStartDate(monthStartISO())
      setEndDate(monthEndISO())
      await queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  const remove = useMutation({
    mutationFn: deleteBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Budgets</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Set monthly (or custom) budgets per category.</p>
      </div>

      <Card className="p-4">
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!amount.trim() || !startDate || !endDate) return
            if (editingId) {
              update.mutate({
                id: editingId,
                category: category === '' ? null : category,
                amount: amount.trim(),
                start_date: startDate,
                end_date: endDate,
              })
            } else {
              create.mutate({
                category: category === '' ? null : category,
                amount: amount.trim(),
                start_date: startDate,
                end_date: endDate,
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
              <option value="">All categories (general budget)</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000.00" />
          <Input label="Start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <div className="flex items-end lg:col-span-1">
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
                    setStartDate(monthStartISO())
                    setEndDate(monthEndISO())
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        {budgets.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Spinner /> Loading…
          </div>
        ) : budgets.isError ? (
          <div className="text-sm text-rose-700 dark:text-rose-200">Failed to load budgets.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2">Category</th>
                  <th className="py-2">Period</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(budgets.data ?? []).map((b) => (
                  <tr key={b.id} className="align-top">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-50">
                      <CategoryDisplay
                        variant="table"
                        label={displayCategoryLabel(b, categoryNameById, 'All')}
                        preferenceKey={preferenceKeyFromRow(b, categoryNameById)}
                        listColor={b.category_color}
                      />
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-200">
                      {b.start_date} → {b.end_date}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900 dark:text-slate-50">{b.amount}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          className="h-11 w-11 p-0 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/40"
                          disabled={remove.isPending || update.isPending}
                          onClick={() => {
                            setEditingId(b.id)
                            setAmount(String(b.amount ?? ''))
                            setStartDate(String(b.start_date ?? monthStartISO()))
                            setEndDate(String(b.end_date ?? monthEndISO()))
                            const idFromNumber = typeof b.category === 'number' ? b.category : null
                            const label = (b.name ?? b.category_name)?.toString().toLowerCase()
                            const idFromLabel = label ? (categoryIdByName.get(label) ?? null) : null
                            setCategory(idFromNumber ?? idFromLabel ?? '')
                          }}
                          aria-label="Edit budget"
                          title="Edit"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-11 w-11 p-0 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                          disabled={remove.isPending || update.isPending}
                          onClick={() => remove.mutate(b.id)}
                          aria-label="Delete budget"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!budgets.data?.length ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      No budgets yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

