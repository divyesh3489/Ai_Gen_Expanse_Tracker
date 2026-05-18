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
  DASHBOARD_ROW_CARD,
  YEAR_SELECT_CLASS,
} from '../../features/dashboard/dashboardCardStyles'
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
}

export function MonthlyExpenseBarChart({
  years,
  selectedYear,
  onYearChange,
  financeTrendRows,
  loading,
}: Props) {
  const chartData = useMemo(() => {
    if (selectedYear == null) return []
    return financeTrendRows.map((row) => ({
      label: monthShort(row.month, selectedYear),
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
    return <div className={`${DASHBOARD_ROW_CARD} animate-pulse`} />
  }

  return (
    <div className={DASHBOARD_ROW_CARD}>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Monthly expense</h2>
          <p className="mt-0.5 text-xs text-slate-400">Total spend per month</p>
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

      <div className="mt-2 min-h-0 flex-1">
        {!chartData.length ? (
          <p className="flex h-full items-center justify-center text-sm text-slate-400">
            No expense data for this year.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#334155" strokeOpacity={0.35} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                ticks={yTicks}
                tickFormatter={formatAxisK}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 138, 128, 0.15)' }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgb(71 85 105 / 0.8)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                formatter={(value) => [formatINR(Number(value)), 'Expense']}
              />
              <Bar dataKey="spend" fill={BAR_FILL} radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
