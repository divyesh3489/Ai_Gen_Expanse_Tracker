import { useMemo, type ChangeEvent } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FinanceTrendRow } from '../../features/dashboard/dashboardTypes'
import { useDashboardChartTheme } from '../../features/dashboard/useDashboardChartTheme'
import { formatINR } from '../../utils/currency'
import {
  DASHBOARD_CARD_SUBTITLE,
  DASHBOARD_CARD_TITLE,
  DASHBOARD_PANEL_CARD,
  YEAR_SELECT_CLASS,
} from '../../features/dashboard/dashboardCardStyles'

const INCOME_STROKE = '#22c55e'
const EXPENSE_STROKE = '#f87171'

function num(v: number | string) {
  return Number(v) || 0
}

function formatAxisK(value: number) {
  if (value === 0) return '₹0'
  if (value >= 1000) return `₹${Math.round(value / 1000)}K`
  return `₹${Math.round(value)}`
}

function monthLabel(monthName: string, year: number): string {
  const d = new Date(`${monthName} 1, ${year}`)
  return Number.isNaN(d.getTime())
    ? monthName.slice(0, 3)
    : d.toLocaleString('en-US', { month: 'short' })
}

type ChartPoint = { label: string; income: number; expense: number }

/** Y-axis max that fits both income and expense series with headroom. */
function sharedYMax(chartData: ChartPoint[]): number {
  const peak = chartData.reduce((m, d) => Math.max(m, d.income, d.expense), 0)
  if (peak <= 0) return 10000
  const padded = peak * 1.12
  const step = Math.ceil(padded / 4 / 1000) * 1000
  return Math.max(step * 4, step)
}

export type IncomeExpenseTrendChartProps = {
  years: number[]
  selectedYear: number | null
  onYearChange: (year: number) => void
  financeTrendRows: FinanceTrendRow[]
  loading: boolean
  error: string | null
  compact?: boolean
  fillHeight?: boolean
}

export function IncomeExpenseTrendChart({
  years,
  selectedYear,
  onYearChange,
  financeTrendRows,
  loading,
  error,
  compact = false,
}: IncomeExpenseTrendChartProps) {
  const theme = useDashboardChartTheme()

  const chartData: ChartPoint[] = useMemo(() => {
    if (selectedYear == null) return []
    return financeTrendRows.map((row) => ({
      label: monthLabel(row.month, selectedYear),
      income: num(row.total_income),
      expense: num(row.total_spend),
    }))
  }, [financeTrendRows, selectedYear])

  const yMax = useMemo(() => sharedYMax(chartData), [chartData])

  const yTicks = useMemo(() => {
    const step = yMax / 4
    return [0, step, step * 2, step * 3, yMax]
  }, [yMax])

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    onYearChange(Number(e.target.value))
  }

  const cardClass = compact ? DASHBOARD_PANEL_CARD : theme.cardClass

  if (loading) {
    return (
      <div className={`${cardClass} h-auto animate-pulse`} style={{ minHeight: compact ? 160 : 240 }} />
    )
  }

  if (error) {
    return (
      <div className={`${cardClass} h-auto`}>
        <h2 className={DASHBOARD_CARD_TITLE}>Income vs Expense</h2>
        <p className="mt-2 text-center text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className={`${cardClass} h-auto`}>
        <h2 className={DASHBOARD_CARD_TITLE}>Income vs Expense</h2>
        <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">No trend data for this year yet.</p>
      </div>
    )
  }

  return (
    <div className={`${cardClass} flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden`}>
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div>
          <h2 className={DASHBOARD_CARD_TITLE}>Income vs Expense</h2>
          {!compact ? (
            <p className={DASHBOARD_CARD_SUBTITLE}>Trend by month (hover points for amounts)</p>
          ) : null}
        </div>
        <select
          aria-label="Select year"
          className={compact ? YEAR_SELECT_CLASS : theme.selectClass}
          value={selectedYear ?? ''}
          onChange={onSelect}
        >
          {years.length === 0 && selectedYear != null ? (
            <option value={selectedYear}>{selectedYear}</option>
          ) : (
            years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="mt-1 flex shrink-0 items-center gap-3 text-[11px]">
        <span className={`inline-flex items-center gap-1 ${theme.legendClass}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INCOME_STROKE }} />
          Income
        </span>
        <span className={`inline-flex items-center gap-1 ${theme.legendClass}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: EXPENSE_STROKE }} />
          Expense
        </span>
      </div>

      <div
        className={`dashboard-trend-chart-wrap mt-0.5 w-full min-w-0 shrink-0 ${compact ? '' : 'mt-2'}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 12, bottom: 4 }}>
            <defs>
              <linearGradient id="incomeAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INCOME_STROKE} stopOpacity={0.25} />
                <stop offset="100%" stopColor={INCOME_STROKE} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EXPENSE_STROKE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={EXPENSE_STROKE} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={theme.gridStroke}
              strokeOpacity={theme.gridOpacity}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: theme.tickFill, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={0}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              tickFormatter={formatAxisK}
              tick={{ fill: theme.tickFill, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: theme.gridStroke, strokeOpacity: 0.5 }}
              contentStyle={theme.tooltipStyle}
              labelStyle={theme.tooltipLabelStyle}
              formatter={(value, name) => {
                const isIncome = String(name).toLowerCase() === 'income'
                return [formatINR(Number(value)), isIncome ? 'Income' : 'Expense']
              }}
            />
            {/* Income drawn first (behind) */}
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={INCOME_STROKE}
              strokeWidth={2}
              fill="url(#incomeAreaFill)"
              dot={false}
              activeDot={{ r: 3, fill: INCOME_STROKE, stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false}
            />
            {/* Expense on top so the red line stays visible */}
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke={EXPENSE_STROKE}
              strokeWidth={2.5}
              fill="url(#expenseAreaFill)"
              dot={{ r: 2, fill: EXPENSE_STROKE, strokeWidth: 0 }}
              activeDot={{ r: 3, fill: EXPENSE_STROKE, stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
