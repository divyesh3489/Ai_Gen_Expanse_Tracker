import clsx from 'clsx'
import { useMemo } from 'react'
import { renderStoredIcon } from './renderIcon'
import { useCategoryPreferencesMeta } from './useCategoryPreferences'

function withAlpha(hex: string, alpha: number): string {
  const raw = hex.trim()
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(raw)
  if (!m) return `rgba(100, 116, 139, ${alpha})`
  const r = Number.parseInt(m[1], 16)
  const g = Number.parseInt(m[2], 16)
  const b = Number.parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const VARIANT = {
  table: { icon: 18, box: 'h-7 w-7 min-h-7 min-w-7' },
  card: { icon: 22, box: 'h-8 w-8 min-h-8 min-w-8' },
  detail: { icon: 26, box: 'h-9 w-9 min-h-9 min-w-9' },
} as const

export type CategoryDisplayVariant = keyof typeof VARIANT

type Props = {
  variant: CategoryDisplayVariant
  label: string
  /** Canonical name for icon lookup (matches `category_name` from preferences). */
  preferenceKey?: string | null
  /** Icon tint from list payload (`category_color`). */
  listColor?: string | null
  /** When false, only the label is shown (e.g. section headers). */
  showIcon?: boolean
}

export function CategoryDisplay({
  variant,
  label,
  preferenceKey,
  listColor,
  showIcon = true,
}: Props) {
  const { getIconForCategoryName } = useCategoryPreferencesMeta()
  const color = (listColor && listColor.trim()) || '#64748B'
  const key = preferenceKey?.trim()
  const iconStr = key ? getIconForCategoryName(key) : undefined
  const showGlyph = Boolean(showIcon && key && label !== '—' && label !== 'All')
  const v = VARIANT[variant]
  const bg = useMemo(() => withAlpha(color, 0.18), [color])

  return (
    <div className="flex min-w-0 items-center gap-2">
      {showGlyph ? (
        <div
          className={clsx('flex shrink-0 items-center justify-center rounded-xl', v.box)}
          style={{ backgroundColor: bg }}
        >
          {renderStoredIcon(iconStr, color, v.icon)}
        </div>
      ) : null}
      <span className="truncate font-medium text-slate-900 dark:text-slate-50">{label}</span>
    </div>
  )
}
