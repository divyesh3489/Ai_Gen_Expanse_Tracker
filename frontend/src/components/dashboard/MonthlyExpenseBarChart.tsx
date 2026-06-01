import { useMemo, type ChangeEvent } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DASHBOARD_CARD_HEADER,
  DASHBOARD_CARD_SUBTITLE,
  DASHBOARD_CARD_TITLE,
  DASHBOARD_ROW_CARD,
  YEAR_SELECT_CLASS,
} from '../../features/dashboard/dashboardCardStyles'
import { useDashboardChartTheme } from '../../features/dashboard/useDashboardChartTheme'
import type { FinanceTrendRow } from '../../features/dashboard/dashboardTypes'
import { formatINR } from '../../utils/currency'

const BAR_FILL = '#FF8A80'
function num(v: number | string) {
  return Number(v) || 0
}

function formatAxisK(value: number) {
  if (value === 0) return '₹0'
  if (value >= 1000) return `₹${Math.round(value / 1000)}K`
  return `₹${Math.round(value)}`
}

function monthShort(monthName: string, year: number): string {
  const d = new Date(`${monthName} 1, ${year}`)
  return Number.isNaN(d.getTime())
    ? monthName.slice(0, 3)
    : d.toLocaleString('en-US', { month: 'short' })
}

function niceYMax(maxVal: number): number {
  if (maxVal <= 0) return 10000
  const step = Math.ceil(maxVal / 4 / 1000) * 1000
  return Math.max(step * 4, step)
}

type Props = {
  years: number[]
  selectedYear: number | null
  onYearChange: (year: number) => void
  financeTrendRows: FinanceTrendRow[]
  loading: boolean
  compact?: boolean
}

export function MonthlyExpenseBarChart({
  years,
  selectedYear,
  onYearChange,
  financeTrendRows,
  loading,
  compact = false,
}: Props) {
  const theme = useDashboardChartTheme()

  const chartData = useMemo(() => {
    if (selectedYear == null) return []
    return financeTrendRows.map((row) => ({
      month: monthShort(row.month, selectedYear),
      spend: num(row.total_spend),
    }))
  }, [financeTrendRows, selectedYear])

  const yMax = useMemo(() => {
    const peak = chartData.reduce((m, d) => Math.max(m, d.spend), 0)
    return niceYMax(peak)
  }, [chartData])

  const yTicks = useMemo(() => {
    const step = yMax / 4
    return [0, step, step * 2, step * 3, yMax]
  }, [yMax])

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    onYearChange(Number(e.target.value))
  }

  if (loading) {
    return (
      <div
        className={`${DASHBOARD_ROW_CARD} monthly-expense-card h-full animate-pulse`}
        style={{ minHeight: 'var(--dashboard-row-min-height)' }}
      />
    )
  }

  return (
    <div className={`${DASHBOARD_ROW_CARD} monthly-expense-card flex h-full min-h-0 flex-col overflow-hidden`}>
      <div className={`${DASHBOARD_CARD_HEADER} flex shrink-0 items-start justify-between gap-1`}>
        <div>
          <h2 className={DASHBOARD_CARD_TITLE}>Monthly expense</h2>
          {!compact ? <p className={DASHBOARD_CARD_SUBTITLE}>Total spend per month</p> : null}
        </div>
        <select
          aria-label="Select year for monthly expense"
          className={YEAR_SELECT_CLASS}
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

      <div className="dashboard-monthly-chart-wrap mt-0.5 w-full shrink-0">
        {!chartData.length ? (
          <p
            className="flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400"
            style={{ height: 'var(--dashboard-chart-height)' }}
          >
            No expense data for this year.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 12, bottom: 4 }}
              barCategoryGap="20%"
              barGap={4}
            >
              <CartesianGrid
                stroke={theme.gridStroke}
                strokeOpacity={theme.gridOpacity}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: theme.tickFill, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                padding={{ left: 20, right: 20 }}
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
                cursor={{ fill: 'rgba(255, 138, 128, 0.15)' }}
                contentStyle={theme.tooltipStyle}
                labelStyle={theme.tooltipLabelStyle}
                formatter={(value) => [formatINR(Number(value)), 'Expense']}
              />
              <Bar
                dataKey="spend"
                fill={BAR_FILL}
                radius={[3, 3, 0, 0]}
                name="Expense"
                barSize={40}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
