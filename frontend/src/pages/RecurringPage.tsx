import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { queryClient } from '../app/queryClient'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { listCategories } from '../features/categories/api'
import { createRecurring, deleteRecurring, listRecurring, updateRecurring } from '../features/recurring/api'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly']
const TYPES = ['expense', 'income']

export function RecurringPage() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [category, setCategory] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [type, setType] = useState('expense')

  const categories = useQuery({ queryKey: ['categories'], queryFn: listCategories })
  const recurring = useQuery({ queryKey: ['recurring'], queryFn: listRecurring })

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
    mutationFn: createRecurring,
    onSuccess: async () => {
      setAmount('')
      setNote('')
      setEditingId(null)
      await queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })

  const update = useMutation({
    mutationFn: (payload: {
      id: number
      category: number | null
      amount: string
      note?: string
      start_date: string
      end_date?: string | null
      next_run_date?: string | null
      frequency: string
      type: string
    }) => updateRecurring(payload.id, payload),
    onSuccess: async () => {
      setEditingId(null)
      setCategory('')
      setAmount('')
      setNote('')
      setStartDate(todayISO())
      setEndDate('')
      setFrequency('monthly')
      setType('expense')
      await queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })

  const remove = useMutation({
    mutationFn: deleteRecurring,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Recurring</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Automate recurring expenses and incomes.</p>
      </div>

      <Card className="p-4">
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!amount.trim() || !startDate) return
            const payload = {
              category: category === '' ? null : category,
              amount: amount.trim(),
              note: note.trim() || undefined,
              start_date: startDate,
              end_date: endDate ? endDate : null,
              next_run_date: null,
              frequency,
              type,
            }
            if (editingId) update.mutate({ id: editingId, ...payload })
            else create.mutate(payload)
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

          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="499.00" />
          <Input
            label="Start"
            type="date"
            value={startDate}
            min={todayISO()}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End (optional)"
            type="date"
            value={endDate}
            min={startDate || todayISO()}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Frequency</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:focus:border-slate-700 dark:focus:ring-slate-300/20"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Type</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:focus:border-slate-700 dark:focus:ring-slate-300/20"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2 lg:col-span-6">
            <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="sm:col-span-2 lg:col-span-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="w-full sm:w-auto" type="submit" disabled={create.isPending || update.isPending}>
                {create.isPending || update.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white" /> Saving…
                  </>
                ) : editingId ? (
                  'Save'
                ) : (
                  'Add recurring'
                )}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setEditingId(null)
                    setCategory('')
                    setAmount('')
                    setNote('')
                    setStartDate(todayISO())
                    setEndDate('')
                    setFrequency('monthly')
                    setType('expense')
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
        {recurring.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Spinner /> Loading…
          </div>
        ) : recurring.isError ? (
          <div className="text-sm text-rose-700 dark:text-rose-200">Failed to load recurring entries.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2">Type</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Frequency</th>
                  <th className="py-2">Start</th>
                  <th className="py-2">End</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(recurring.data ?? []).map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-50">{r.type}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-200">
                      {r.name ??
                        r.category_name ??
                        (r.category ? categoryNameById.get(r.category) ?? `#${r.category}` : '—')}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-200">{r.frequency}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-200">{r.start_date}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-200">{r.end_date ?? '—'}</td>
                    <td className="py-3 text-right font-semibold text-slate-900 dark:text-slate-50">{r.amount}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          className="h-11 w-11 p-0 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/40"
                          disabled={remove.isPending || update.isPending}
                          onClick={() => {
                            setEditingId(r.id)
                            setAmount(String(r.amount ?? ''))
                            setNote(String(r.note ?? ''))
                            setStartDate(String(r.start_date ?? todayISO()))
                            setEndDate(String(r.end_date ?? ''))
                            setFrequency(String(r.frequency ?? 'monthly'))
                            setType(String(r.type ?? 'expense'))
                            const idFromNumber = typeof r.category === 'number' ? r.category : null
                            const label = (r.name ?? r.category_name)?.toString().toLowerCase()
                            const idFromLabel = label ? (categoryIdByName.get(label) ?? null) : null
                            setCategory(idFromNumber ?? idFromLabel ?? '')
                          }}
                          aria-label="Edit recurring"
                          title="Edit"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-11 w-11 p-0 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                          disabled={remove.isPending || update.isPending}
                          onClick={() => remove.mutate(r.id)}
                          aria-label="Delete recurring"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!recurring.data?.length ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      No recurring entries yet.
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

