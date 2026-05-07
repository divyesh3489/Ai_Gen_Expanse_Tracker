import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Pencil, Trash2 } from 'lucide-react'
import { queryClient } from '../app/queryClient'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../features/categories/api'

export function CategoriesPage() {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      setName('')
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const update = useMutation({
    mutationFn: (payload: { id: number; name: string }) => updateCategory(payload.id, { name: payload.name }),
    onSuccess: async () => {
      setEditingId(null)
      setName('')
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const nameFieldError = useMemo(() => {
    const err = editingId ? update.error : create.error
    const isErr = editingId ? update.isError : create.isError
    if (!isErr || !isAxiosError(err)) return undefined
    const data = err.response?.data
    if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined
    const record = data as Record<string, unknown>
    const msgs = record.name
    if (Array.isArray(msgs)) return msgs.filter((x): x is string => typeof x === 'string').join(' ')
    if (typeof msgs === 'string') return msgs
    return undefined
  }, [create.error, create.isError, editingId, update.error, update.isError])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">Manage categories for expenses and incomes.</p>
      </div>

      <Card className="p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            if (editingId) {
              update.reset()
              update.mutate({ id: editingId, name: name.trim() })
            } else {
              create.reset()
              create.mutate({ name: name.trim() })
            }
          }}
        >
          <div className="flex-1">
            <Input
              label="New category"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              error={nameFieldError}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={create.isPending || update.isPending}>
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
                onClick={() => {
                  setEditingId(null)
                  setName('')
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
        {create.isError || update.isError ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {getErrorMessage(editingId ? update.error : create.error, 'Failed to save category.')}
          </div>
        ) : null}
      </Card>

      <Card className="p-4">
        {remove.isError ? (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {getErrorMessage(remove.error, 'Failed to delete category.')}
          </div>
        ) : null}
        {categories.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading…
          </div>
        ) : categories.isError ? (
          <div className="text-sm text-rose-700">Failed to load categories.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {categories.data?.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">{c.name}</div>
                  {c.is_default ? <div className="text-xs text-slate-500">Default</div> : null}
                </div>
                <div className="flex shrink-0 items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    className="h-11 w-11 p-0 text-slate-700 hover:bg-slate-100"
                    disabled={c.is_default || remove.isPending || update.isPending}
                    onClick={() => {
                      setEditingId(c.id)
                      setName(c.name)
                    }}
                    aria-label="Edit category"
                    title="Edit"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-11 w-11 p-0 text-rose-700 hover:bg-rose-50"
                    disabled={c.is_default || remove.isPending || update.isPending}
                    onClick={() => remove.mutate(c.id)}
                    aria-label="Delete category"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
            {!categories.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500">No categories yet.</div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  )
}

