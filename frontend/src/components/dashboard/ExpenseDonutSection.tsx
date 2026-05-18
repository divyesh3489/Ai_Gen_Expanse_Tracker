import { useMemo } from 'react'
import { formatINR } from '../../utils/currency'
import { DASHBOARD_ROW_CARD } from '../../features/dashboard/dashboardCardStyles'
import type { ExpenseCategorySlice } from '../../features/dashboard/dashboardTypes'

const CX = 100
const CY = 100
const R_OUTER = 78
const R_INNER = 52
const MIN_SWEEP_DEG = 4

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSlice(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  if (end - start < 0.01) return ''
  const p0 = polar(cx, cy, rOuter, start)
  const p1 = polar(cx, cy, rOuter, end)
  const p2 = polar(cx, cy, rInner, end)
  const p3 = polar(cx, cy, rInner, start)
  const large = end - start > 180 ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rInner} ${rInner} 0 ${large} 0 ${p3.x} ${p3.y} Z`
}

/** Ensure tiny slices remain visible on the ring. */
function sweepsWithMinimum(slices: ExpenseCategorySlice[], total: number) {
  if (total <= 0) return slices.map((s) => ({ ...s, sweep: 0 }))
  const raw = slices.map((s) => ({
    ...s,
    sweep: (s.amount / total) * 360,
  }))
  const needsBoost = raw.filter((s) => s.sweep > 0 && s.sweep < MIN_SWEEP_DEG)
  if (!needsBoost.length) return raw
  const deficit = needsBoost.reduce((a, s) => a + (MIN_SWEEP_DEG - s.sweep), 0)
  const largest = raw.reduce((best, s) => (s.sweep > best.sweep ? s : best), raw[0])
  return raw.map((s) => {
    if (s.sweep > 0 && s.sweep < MIN_SWEEP_DEG) return { ...s, sweep: MIN_SWEEP_DEG }
    if (s === largest && largest.sweep > deficit) return { ...s, sweep: s.sweep - deficit }
    return s
  })
}

type Props = {
  slices: ExpenseCategorySlice[]
  loading: boolean
  error?: string | null
  periodLabel: string
}

export function ExpenseDonutSection({ slices, loading, error, periodLabel }: Props) {
  const total = slices.reduce((a, s) => a + s.amount, 0)

  const arcs = useMemo(() => {
    const withSweep = sweepsWithMinimum(slices, total)
    let angle = 0
    return withSweep.map((s) => {
      const start = angle
      const end = angle + s.sweep
      angle = end
      return {
        key: s.category,
        d: donutSlice(CX, CY, R_OUTER, R_INNER, start, end),
        color: s.color,
      }
    })
  }, [slices, total])

  if (loading) {
    return <div className={`${DASHBOARD_ROW_CARD} animate-pulse`} />
  }

  return (
    <div className={DASHBOARD_ROW_CARD}>
      <div className="shrink-0 border-b border-slate-800/80 pb-3">
        <h2 className="text-base font-bold tracking-tight text-white">Expense by category</h2>
        <p className="mt-0.5 text-xs text-slate-500">Share of spending · {periodLabel}</p>
      </div>

      <div className="flex min-h-0 flex-1 items-center py-2">
        {error ? (
          <p className="w-full text-center text-sm text-rose-400">{error}</p>
        ) : !slices.length ? (
          <p className="w-full text-center text-sm text-slate-500">No data</p>
        ) : (
          <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-5">
            {/* Donut — larger, centered */}
            <div className="flex justify-center">
              <div className="relative">
                <svg
                  viewBox="0 0 200 200"
                  className="h-[200px] w-[200px] drop-shadow-[0_0_24px_rgba(0,0,0,0.35)]"
                  aria-hidden
                >
                  {arcs.map((a) =>
                    a.d ? (
                      <path
                        key={a.key}
                        d={a.d}
                        fill={a.color}
                        stroke="#0d1117"
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                    ) : null,
                  )}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Total</span>
                  <span className="mt-0.5 max-w-[120px] text-center text-sm font-bold leading-tight text-white">
                    {formatINR(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend — compact rows, vertically centered */}
            <ul className="flex max-h-[240px] flex-col justify-center gap-1.5 overflow-y-auto pr-0.5">
              {slices.map((s) => (
                <li
                  key={s.category}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-lg border border-transparent bg-slate-800/30 px-2.5 py-2 transition-colors hover:border-slate-700/50 hover:bg-slate-800/50"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-[#0d1117]"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="min-w-0 truncate text-sm font-medium text-slate-200">{s.category}</span>
                  <div className="text-right leading-tight">
                    <div className="text-sm font-semibold tabular-nums text-white">{Math.round(s.percent)}%</div>
                    <div className="text-[11px] tabular-nums text-slate-400">{formatINR(s.amount)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
