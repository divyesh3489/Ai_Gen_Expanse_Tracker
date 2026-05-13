import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Pencil, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { queryClient } from '../app/queryClient'
import { Button } from '../components/ui/Button'
import { RowActionButton } from '../components/ui/RowActionButton'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryWritePayload,
} from '../features/categories/api'
import type { IconPackId } from '../features/categories/iconCatalog'
import { DEFAULT_ICON_NAME, DEFAULT_ICON_PACK } from '../features/categories/iconCatalog'
import { IconPicker } from '../features/categories/IconPicker'
import { decodeIconFromApi, encodeIconForApi } from '../features/categories/iconCodec'
import { RenderIcon } from '../features/categories/renderIcon'
import type { Category } from '../features/categories/types'
import { USER_CATEGORY_PREFERENCES_QUERY_KEY } from '../features/categories/useCategoryPreferences'

function emptyForm() {
  return {
    name: '',
    type: 'expense' as const,
    iconPack: DEFAULT_ICON_PACK,
    iconName: DEFAULT_ICON_NAME,
    defaultColor: '#64748B',
  }
}

export function CategoriesPage() {
  const formInit = useMemo(() => emptyForm(), [])
  const [name, setName] = useState(formInit.name)
  const [type, setType] = useState<'expense' | 'income'>(formInit.type)
  const [iconPack, setIconPack] = useState<IconPackId>(formInit.iconPack)
  const [iconName, setIconName] = useState(formInit.iconName)
  const [defaultColor, setDefaultColor] = useState(formInit.defaultColor)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })

  const writePayload = useCallback((): CategoryWritePayload => {
    return {
      name: name.trim(),
      type,
      icon: encodeIconForApi(iconPack, iconName),
      default_color: defaultColor,
    }
  }, [defaultColor, iconName, iconPack, name, type])

  const resetForm = useCallback(() => {
    const e = emptyForm()
    setName(e.name)
    setType(e.type)
    setIconPack(e.iconPack)
    setIconName(e.iconName)
    setDefaultColor(e.defaultColor)
    setEditingId(null)
  }, [])

  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      resetForm()
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      await queryClient.invalidateQueries({ queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY })
    },
  })

  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      setDeleteId(null)
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      await queryClient.invalidateQueries({ queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY })
    },
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryWritePayload }) =>
      updateCategory(id, payload),
    onSuccess: async () => {
      resetForm()
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      await queryClient.invalidateQueries({ queryKey: USER_CATEGORY_PREFERENCES_QUERY_KEY })
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

  const previewColor = defaultColor || '#64748B'

  function beginEdit(c: Category) {
    const decoded = decodeIconFromApi(c.icon)
    setEditingId(c.id)
    setName(c.name)
    setType(c.type)
    setIconPack(decoded.pack)
    setIconName(decoded.name)
    setDefaultColor(c.default_color ?? '#64748B')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Categories</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Manage global categories (staff only). Icons use react-icons; color is the default tint for this category.
        </p>
      </div>

      <Card className="p-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            const payload = writePayload()
            if (editingId) {
              update.reset()
              update.mutate({ id: editingId, payload })
            } else {
              create.reset()
              create.mutate(payload)
            }
          }}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="space-y-3">
              <Input
                label={editingId ? 'Category name' : 'New category'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groceries"
                error={nameFieldError}
              />

              <label className="block">
                <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Type</div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'expense' | 'income')}
                  className={clsx(
                    'h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition',
                    'border-slate-200 text-slate-900 focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20',
                    'dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:focus:border-slate-700 dark:focus:ring-slate-300/20',
                  )}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Default color</div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={defaultColor}
                    onChange={(e) => setDefaultColor(e.target.value)}
                    className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800"
                    aria-label="Default color"
                  />
                  <Input
                    label=""
                    value={defaultColor}
                    onChange={(e) => setDefaultColor(e.target.value)}
                    placeholder="#64748B"
                    className="max-w-[10rem] font-mono text-xs"
                  />
                </div>
              </label>
            </div>

            <div
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 dark:border-slate-800 dark:bg-slate-900/30"
              aria-live="polite"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Preview
              </div>
              <RenderIcon iconName={iconName} iconPack={iconPack} color={previewColor} size={48} />
              <div className="max-w-[12rem] truncate text-center text-xs text-slate-600 dark:text-slate-300">
                {iconPack}:{iconName}
              </div>
            </div>
          </div>

          <IconPicker
            selectedPack={iconPack}
            selectedName={iconName}
            previewColor={previewColor}
            onSelect={(pack, iconNm) => {
              setIconPack(pack)
              setIconName(iconNm)
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white" /> Saving…
                </>
              ) : editingId ? (
                'Save changes'
              ) : (
                'Add category'
              )}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={() => resetForm()} disabled={create.isPending || update.isPending}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
        {create.isError || update.isError ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
            {getErrorMessage(editingId ? update.error : create.error, 'Failed to save category.')}
          </div>
        ) : null}
      </Card>

      <Card className="p-4">
        {remove.isError ? (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
            {getErrorMessage(remove.error, 'Failed to delete category.')}
          </div>
        ) : null}
        {categories.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Spinner /> Loading…
          </div>
        ) : categories.isError ? (
          <div className="text-sm text-rose-700 dark:text-rose-200">Failed to load categories.</div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {categories.data?.map((c: Category) => {
              const decoded = decodeIconFromApi(c.icon)
              const listColor = c.color ?? c.default_color ?? '#64748B'
              return (
                <div
                  key={c.id}
                  className="group flex items-center justify-between gap-4 rounded-xl py-3 pl-1 pr-1 transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/45"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/60">
                      <RenderIcon iconName={decoded.name} iconPack={decoded.pack} color={listColor} size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{c.name}</div>
                      <div className="text-xs capitalize text-slate-500 dark:text-slate-400">{c.type}</div>
                    </div>
                  </div>
                  <div className="flex min-w-[6rem] shrink-0 items-center justify-end gap-2">
                    <RowActionButton
                      variant="edit"
                      icon={Pencil}
                      disabled={remove.isPending || update.isPending}
                      onClick={() => beginEdit(c)}
                      aria-label="Edit category"
                    />
                    <RowActionButton
                      variant="delete"
                      icon={Trash2}
                      disabled={remove.isPending || update.isPending}
                      onClick={() => setDeleteId(c.id)}
                      aria-label="Delete category"
                    />
                  </div>
                </div>
              )
            })}
            {!categories.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No categories yet.</div>
            ) : null}
          </div>
        )}
      </Card>

      {deleteId !== null ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/70"
            aria-label="Close dialog"
            disabled={remove.isPending}
            onClick={() => !remove.isPending && setDeleteId(null)}
          />
          <Card className="relative z-10 w-full max-w-md border border-slate-200 p-6 shadow-2xl dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete category?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This cannot be undone. Transactions referencing this category may be affected depending on backend rules.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" disabled={remove.isPending} onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={remove.isPending}
                onClick={() => {
                  if (deleteId != null) remove.mutate(deleteId)
                }}
              >
                {remove.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white" /> Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
