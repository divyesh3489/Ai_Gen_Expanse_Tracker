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
import { formatINR } from '../../utils/currency'

const INCOME_STROKE = '#00e676'
const EXPENSE_STROKE = '#ff5252'
const CARD_BG = '#111827'

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

function niceYMax(maxVal: number): number {
  if (maxVal <= 0) return 88000
  const step = Math.ceil(maxVal / 4 / 1000) * 1000
  return Math.max(step * 4, step)
}

export type IncomeExpenseTrendChartProps = {
  years: number[]
  selectedYear: number | null
  onYearChange: (year: number) => void
  financeTrendRows: FinanceTrendRow[]
  loading: boolean
  error: string | null
}

export function IncomeExpenseTrendChart({
  years,
  selectedYear,
  onYearChange,
  financeTrendRows,
  loading,
  error,
}: IncomeExpenseTrendChartProps) {
  const chartData: ChartPoint[] = useMemo(() => {
    if (selectedYear == null) return []
    return financeTrendRows.map((row) => ({
      label: monthLabel(row.month, selectedYear),
      income: num(row.total_income),
      expense: num(row.total_spend),
    }))
  }, [financeTrendRows, selectedYear])

  const yMax = useMemo(() => {
    const peak = chartData.reduce((m, d) => Math.max(m, d.income, d.expense), 0)
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
        className="h-[340px] animate-pulse rounded-xl border border-slate-700/60"
        style={{ backgroundColor: CARD_BG }}
      />
    )
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-slate-700/60 p-5"
        style={{ backgroundColor: CARD_BG }}
      >
        <h2 className="text-base font-bold text-white">Income vs Expense</h2>
        <p className="mt-4 text-center text-sm text-rose-400">{error}</p>
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div
        className="rounded-xl border border-slate-700/60 p-5"
        style={{ backgroundColor: CARD_BG }}
      >
        <h2 className="text-base font-bold text-white">Income vs Expense</h2>
        <p className="mt-4 text-center text-sm text-slate-400">No trend data for this year yet.</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border border-slate-700/60 p-4 sm:p-5"
      style={{ backgroundColor: CARD_BG }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Income vs Expense</h2>
          <p className="mt-0.5 text-xs text-slate-400">Trend by month (hover points for amounts)</p>
        </div>
        <select
          aria-label="Select year"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-slate-500"
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

      <div className="mt-3 flex flex-wrap items-center gap-5 text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INCOME_STROKE }} />
          Income
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EXPENSE_STROKE }} />
          Expense
        </span>
      </div>

      <div className="mt-2 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="incomeAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INCOME_STROKE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={INCOME_STROKE} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EXPENSE_STROKE} stopOpacity={0.3} />
                <stop offset="100%" stopColor={EXPENSE_STROKE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
              cursor={{ stroke: '#475569', strokeOpacity: 0.5 }}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgb(71 85 105 / 0.8)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
              formatter={(value, name) => {
                const isIncome = String(name).toLowerCase() === 'income'
                return [formatINR(Number(value)), isIncome ? 'Income' : 'Expense']
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={INCOME_STROKE}
              strokeWidth={2}
              fill="url(#incomeAreaFill)"
              dot={false}
              activeDot={{ r: 4, fill: INCOME_STROKE, stroke: CARD_BG, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke={EXPENSE_STROKE}
              strokeWidth={2}
              fill="url(#expenseAreaFill)"
              dot={false}
              activeDot={{ r: 4, fill: EXPENSE_STROKE, stroke: CARD_BG, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
