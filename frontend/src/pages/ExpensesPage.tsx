import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { queryClient } from '../app/queryClient'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { listCategories } from '../features/categories/api'
import { createExpanse, deleteExpanse, listExpanses, updateExpanse } from '../features/expanses/api'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function ExpensesPage() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [category, setCategory] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())

  const categories = useQuery({ queryKey: ['categories'], queryFn: listCategories })
  const expanses = useQuery({ queryKey: ['expanses'], queryFn: listExpanses })

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
    mutationFn: createExpanse,
    onSuccess: async () => {
      setAmount('')
      setNote('')
      setEditingId(null)
      await queryClient.invalidateQueries({ queryKey: ['expanses'] })
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
      await queryClient.invalidateQueries({ queryKey: ['expanses'] })
    },
  })

  const remove = useMutation({
    mutationFn: deleteExpanse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expanses'] })
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Expenses</h1>
        <p className="mt-1 text-sm text-slate-600">Add and review your daily spending.</p>
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
            <div className="mb-1 text-sm font-medium text-slate-700">Category</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20"
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
        {expanses.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading…
          </div>
        ) : expanses.isError ? (
          <div className="text-sm text-rose-700">Failed to load expenses.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Note</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(expanses.data ?? []).map((e) => (
                  <tr key={e.id} className="align-top">
                    <td className="py-3 text-slate-700">{e.date}</td>
                    <td className="py-3 font-medium text-slate-900">
                      {e.name ??
                        e.category_name ??
                        (e.category ? categoryNameById.get(e.category) ?? `#${e.category}` : '—')}
                    </td>
                    <td className="py-3 text-slate-700">{e.note ?? '—'}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{e.amount}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          className="h-11 w-11 p-0 text-slate-700 hover:bg-slate-100"
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
                          title="Edit"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-11 w-11 p-0 text-rose-700 hover:bg-rose-50"
                          disabled={remove.isPending || update.isPending}
                          onClick={() => remove.mutate(e.id)}
                          aria-label="Delete expense"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!expanses.data?.length ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      No expenses yet.
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

