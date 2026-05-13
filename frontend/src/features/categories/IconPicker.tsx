import { useMemo, useState } from 'react'
import clsx from 'clsx'
import type { CatalogIcon, IconPackId } from './iconCatalog'
import { CATEGORY_ICON_CATALOG } from './iconCatalog'
import { Input } from '../../components/ui/Input'
import { RenderIcon } from './renderIcon'

type Props = {
  selectedPack: IconPackId
  selectedName: string
  onSelect: (pack: IconPackId, name: string) => void
  previewColor: string
}

export function IconPicker({ selectedPack, selectedName, onSelect, previewColor }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CATEGORY_ICON_CATALOG
    return CATEGORY_ICON_CATALOG.filter(
      (entry) =>
        entry.label.toLowerCase().includes(q) ||
        entry.name.toLowerCase().includes(q) ||
        entry.pack.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="space-y-2">
      <Input
        label="Search icons"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by label or icon name…"
        autoComplete="off"
      />
      <div
        className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40"
        role="listbox"
        aria-label="Icon choices"
      >
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {filtered.map((entry: CatalogIcon) => {
            const isSelected = entry.pack === selectedPack && entry.name === selectedName
            return (
              <button
                key={`${entry.pack}-${entry.name}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(entry.pack, entry.name)}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition',
                  'focus:outline-none focus:ring-2 focus:ring-slate-400/40 dark:focus:ring-slate-300/30',
                  isSelected
                    ? 'border-2 border-slate-900 bg-slate-100 dark:border-white dark:bg-white/10'
                    : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50',
                )}
              >
                <RenderIcon iconName={entry.name} iconPack={entry.pack} color={previewColor} size={26} />
                <span className="line-clamp-2 w-full text-[10px] leading-tight text-slate-600 dark:text-slate-400">
                  {entry.label}
                </span>
              </button>
            )
          })}
        </div>
        {!filtered.length ? (
          <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No icons match your search.</div>
        ) : null}
      </div>
    </div>
  )
}
