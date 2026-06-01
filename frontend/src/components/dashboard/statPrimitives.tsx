import clsx from 'clsx'

/** Filled triangle + MoM %; triangle follows sign. `inverse`: higher is worse (e.g. spend). */
export function DeltaBadge({
  value,
  inverse = false,
  compact = false,
}: {
  value: number | null
  inverse?: boolean
  compact?: boolean
}) {
  if (value === null || Number.isNaN(value)) {
    return <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
  }
  const isGood = inverse ? value < 0 : value > 0
  const isZero = value === 0
  const signed = value === 0 ? '0.00' : `${value > 0 ? '+' : ''}${value.toFixed(2)}`
  const colorClass = clsx(
    isZero && 'text-slate-500 dark:text-slate-400',
    !isZero && isGood && 'text-emerald-600 dark:text-emerald-400',
    !isZero && !isGood && 'text-rose-600 dark:text-rose-400',
  )
  const glyph = value > 0 ? '▲' : value < 0 ? '▼' : ''
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 ${compact ? 'text-xs' : 'gap-x-2 text-base'}`}>
      {isZero ? (
        <span className={clsx('font-semibold tabular-nums tracking-tight', colorClass)}>{signed}%</span>
      ) : (
        <span className={clsx('inline-flex items-baseline gap-1 font-semibold tabular-nums tracking-tight', colorClass)}>
          <span className="translate-y-px text-lg leading-none" aria-hidden>
            {glyph}
          </span>
          <span>{signed}%</span>
        </span>
      )}
      <span
        className={`font-medium text-slate-500 dark:text-slate-400 ${compact ? 'text-[10px]' : 'text-sm'}`}
      >
        from last month
      </span>
    </span>
  )
}

export function StatCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-[#F8F9FA] dark:border-slate-800 dark:bg-slate-900/60 ${
        compact ? 'p-2.5 sm:p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${compact ? 'h-6 w-28' : 'h-8 w-32'}`} />
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div
          className={`shrink-0 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 ${
            compact ? 'h-8 w-8' : 'h-10 w-10'
          }`}
        />
      </div>
    </div>
  )
}
