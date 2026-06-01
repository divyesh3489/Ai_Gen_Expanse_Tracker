import { useCallback, useMemo, useState, type MouseEvent, type TouchEvent } from 'react'
import { formatINRAmount } from '../../utils/currency'
import {
  DASHBOARD_CARD_HEADER,
  DASHBOARD_CARD_SUBTITLE,
  DASHBOARD_CARD_TITLE,
  DASHBOARD_ROW_CARD,
} from '../../features/dashboard/dashboardCardStyles'
import { useTheme } from '../../app/theme/ThemeContext'
import type { ExpenseCategorySlice } from '../../features/dashboard/dashboardTypes'

const CX = 150
const CY = 150
const R_OUTER = 150
const R_INNER = 90
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

function sweepsWithMinimum(slices: ExpenseCategorySlice[], total: number) {
  if (total <= 0) return slices.map((s) => ({ ...s, sweep: 0 }))
  const raw = slices.map((s) => ({
    ...s,
    sweep: (s.amount / total) * 360,
  }))
  const needsBoost = raw.filter((s) => s.sweep > 0 && s.sweep < MIN_SWEEP_DEG)
  let adjusted = raw
  if (needsBoost.length) {
    const deficit = needsBoost.reduce((a, s) => a + (MIN_SWEEP_DEG - s.sweep), 0)
    const largest = raw.reduce((best, s) => (s.sweep > best.sweep ? s : best), raw[0])
    adjusted = raw.map((s) => {
      if (s.sweep > 0 && s.sweep < MIN_SWEEP_DEG) return { ...s, sweep: MIN_SWEEP_DEG }
      if (s === largest && largest.sweep > deficit) return { ...s, sweep: s.sweep - deficit }
      return s
    })
  }
  const sweepSum = adjusted.reduce((a, s) => a + s.sweep, 0)
  if (sweepSum > 0 && Math.abs(sweepSum - 360) > 0.01) {
    const scale = 360 / sweepSum
    return adjusted.map((s) => ({ ...s, sweep: s.sweep * scale }))
  }
  return adjusted
}

function slicePercent(amount: number, total: number): string {
  if (total <= 0) return '0.0'
  return ((amount / total) * 100).toFixed(1)
}

type Props = {
  slices: ExpenseCategorySlice[]
  loading: boolean
  error?: string | null
  periodLabel: string
}

export function ExpenseDonutSection({ slices, loading, error, periodLabel }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const sliceStroke = isDark ? '#0d1117' : '#ffffff'

  const total = slices.reduce((a, s) => a + s.amount, 0)

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  const arcs = useMemo(() => {
    const withSweep = sweepsWithMinimum(slices, total)
    let angle = 0
    return withSweep.map((s, index) => {
      const start = angle
      const end = angle + s.sweep
      angle = end
      return {
        index,
        key: s.category,
        d: donutSlice(CX, CY, R_OUTER, R_INNER, start, end),
        color: s.color,
        category: s.category,
        amount: s.amount,
        percent: slicePercent(s.amount, total),
      }
    })
  }, [slices, total])

  const hovered = hoveredIndex != null ? arcs[hoveredIndex] : null

  const setPointerPos = useCallback((clientX: number, clientY: number, target: EventTarget) => {
    const rect = (target as SVGPathElement).ownerSVGElement?.getBoundingClientRect()
    if (rect) {
      setCursorPos({ x: clientX - rect.left, y: clientY - rect.top })
    }
  }, [])

  const onSliceMove = useCallback(
    (e: MouseEvent, index: number) => {
      setHoveredIndex(index)
      setPointerPos(e.clientX, e.clientY, e.currentTarget)
    },
    [setPointerPos],
  )

  const onSliceTouch = useCallback(
    (e: TouchEvent, index: number) => {
      const touch = e.touches[0]
      if (!touch) return
      setHoveredIndex(index)
      setPointerPos(touch.clientX, touch.clientY, e.currentTarget)
    },
    [setPointerPos],
  )

  const clearHover = useCallback(() => {
    setHoveredIndex(null)
  }, [])

  if (loading) {
    return <div className={`${DASHBOARD_ROW_CARD} expense-category-card h-full animate-pulse`} />
  }

  return (
    <div className={`${DASHBOARD_ROW_CARD} expense-category-card flex h-full min-h-0 flex-col`}>
      <div className={`${DASHBOARD_CARD_HEADER} shrink-0`}>
        <h2 className={DASHBOARD_CARD_TITLE}>Expense by category</h2>
        <p className={DASHBOARD_CARD_SUBTITLE}>Share of spending · {periodLabel}</p>
      </div>

      <div className="expense-donut-body flex min-h-0 flex-1 items-center justify-center py-1">
        {error ? (
          <p className="w-full text-center text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
        ) : !slices.length ? (
          <p className="w-full text-center text-[11px] text-slate-500">No data</p>
        ) : (
          <div
            className={`donut-chart-wrapper relative flex h-full w-full max-h-[var(--dashboard-chart-height)] max-w-[var(--dashboard-chart-height)] items-center justify-center ${
              hoveredIndex !== null ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <svg
              viewBox="0 0 300 300"
              className="donut-canvas h-full w-full max-h-full max-w-full"
              aria-hidden
            >
              {arcs.map((a) =>
                a.d ? (
                  <path
                    key={a.key}
                    d={a.d}
                    fill={a.color}
                    stroke={sliceStroke}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    className="transition-opacity duration-150"
                    style={{
                      cursor: 'pointer',
                      opacity: hoveredIndex === null || hoveredIndex === a.index ? 1 : 0.45,
                    }}
                    onMouseEnter={(e) => onSliceMove(e, a.index)}
                    onMouseMove={(e) => onSliceMove(e, a.index)}
                    onMouseLeave={clearHover}
                    onTouchStart={(e) => onSliceTouch(e, a.index)}
                    onTouchMove={(e) => onSliceTouch(e, a.index)}
                    onTouchEnd={clearHover}
                  />
                ) : null,
              )}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500 md:text-[10px]">
                Total
              </span>
              <span className="mt-0.5 text-center text-[11px] font-bold leading-tight text-[#1A1A2E] dark:text-white">
                {formatINRAmount(total)}
              </span>
            </div>
            {hovered ? (
              <div
                className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-[11px] text-white shadow-lg"
                style={{
                  background: '#1a1a2e',
                  left: cursorPos.x,
                  top: cursorPos.y,
                  transform: 'translate(-50%, calc(-100% - 10px))',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
                role="tooltip"
              >
                <div style={{ fontWeight: 700 }}>{hovered.category}</div>
                <div className="text-[#e0e0e0]">
                  {formatINRAmount(hovered.amount)} · {hovered.percent}%
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
