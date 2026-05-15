import type { Expanse } from '../expanses/types'
import type { Income } from '../incomes/types'
import type { DashboardSummary } from '../expanses/dashboardSummaryApi'

function num(v: number | string | null | undefined): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function sumExpansesInRange(items: Expanse[], fromISO: string, toISO: string): number {
  return items.reduce((acc, e) => {
    if (e.date >= fromISO && e.date <= toISO) return acc + num(e.amount)
    return acc
  }, 0)
}

export function sumIncomesInRange(items: Income[], fromISO: string, toISO: string): number {
  return items.reduce((acc, e) => {
    if (e.date >= fromISO && e.date <= toISO) return acc + num(e.amount)
    return acc
  }, 0)
}

function pctChange(cur: number, prev: number): number {
  if (prev === 0) return cur === 0 ? 0 : 100
  return ((cur - prev) / prev) * 100
}

function netChangePct(curNet: number, prevNet: number): number {
  if (prevNet === 0) return curNet === 0 ? 0 : 100
  return ((curNet - prevNet) / Math.abs(prevNet)) * 100
}

export function buildSummaryFromRanges(
  curSpend: number,
  curIncome: number,
  prevSpend: number,
  prevIncome: number,
): DashboardSummary {
  const netMonthly = curIncome - curSpend
  const netLast = prevIncome - prevSpend
  const savingRate = curIncome !== 0 ? (netMonthly / curIncome) * 100 : 0
  const lastMonthSavingRate = prevIncome !== 0 ? (netLast / prevIncome) * 100 : null
  return {
    total_monthly_spend: curSpend,
    total_monthly_income: curIncome,
    total_last_month_spend: prevSpend,
    total_last_month_income: prevIncome,
    last_month_spend_change_percent: pctChange(curSpend, prevSpend),
    last_month_income_change_percent: pctChange(curIncome, prevIncome),
    net_monthly: netMonthly,
    net_last_month: netLast,
    last_month_net_change_percent: netChangePct(netMonthly, netLast),
    saving_rate_percent: savingRate,
    last_month_saving_rate_percent: lastMonthSavingRate,
  }
}
