import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Expanse } from '../features/expanses/types'
import type { Income } from '../features/incomes/types'
import { fetchAllCursorPages } from '../utils/pagination'
import { fetchDashboardSummary } from '../features/expanses/dashboardSummaryApi'
import type { DashboardSummary } from '../features/expanses/dashboardSummaryApi'
import { fetchBudgetSummary } from '../features/budgets/budgetSummaryApi'
import { fetchCategoryBreakdownByRange } from '../features/dashboard/categoryBreakdownApi'
import { fetchRecentTransactions } from '../features/dashboard/recentTransactionsApi'
import { labelForPeriod } from '../features/dashboard/periodLabel'
import {
  USE_DUMMY_DASHBOARD_DATA,
  DUMMY_BUDGETS,
} from '../features/dashboard/dashboardConstants'
import type {
  BudgetSummaryRow,
  CustomMonth,
  DashboardTransaction,
  ExpenseCategorySlice,
  PeriodPreset,
} from '../features/dashboard/dashboardTypes'
import { previousCalendarRange, rangeForPreset, toISODate } from '../features/dashboard/dateRange'
import { buildSummaryFromRanges, sumExpansesInRange, sumIncomesInRange } from '../features/dashboard/dashboardAggregate'

export function useDashboardData() {
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('this_month')
  const [customMonth, setCustomMonth] = useState<CustomMonth>(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  })

  const { fromISO, toISO, prevFromISO, prevToISO } = useMemo(() => {
    const { from, to } = rangeForPreset(periodPreset, new Date(), periodPreset === 'custom' ? customMonth : null)
    const prev = previousCalendarRange(from, to)
    return {
      fromISO: toISODate(from),
      toISO: toISODate(to),
      prevFromISO: toISODate(prev.from),
      prevToISO: toISODate(prev.to),
    }
  }, [periodPreset, customMonth])

  const expansesQuery = useQuery({
    queryKey: ['expanses', 'all-for-dashboard'],
    queryFn: () => fetchAllCursorPages<Expanse>('/v1/expanse/expanses/'),
    staleTime: 60_000,
  })

  const incomesQuery = useQuery({
    queryKey: ['incomes', 'all-for-dashboard'],
    queryFn: () => fetchAllCursorPages<Income>('/v1/expanse/incomes/'),
    staleTime: 60_000,
  })

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary', fromISO, toISO],
    queryFn: () => fetchDashboardSummary({ from: fromISO, to: toISO }),
  })

  const budgetQuery = useQuery({
    queryKey: ['budget-summary', fromISO, toISO],
    queryFn: () => fetchBudgetSummary(fromISO, toISO),
  })

  const categoryQuery = useQuery({
    queryKey: ['category-breakdown', fromISO, toISO],
    queryFn: () => fetchCategoryBreakdownByRange(fromISO, toISO),
    staleTime: 60_000,
  })

  const recentQuery = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: fetchRecentTransactions,
    staleTime: 60_000,
  })

  const periodLabel = useMemo(
    () => labelForPeriod(periodPreset, customMonth),
    [periodPreset, customMonth],
  )

  const summaryFromLists = useMemo((): DashboardSummary | null => {
    const ex = expansesQuery.data
    const inc = incomesQuery.data
    if (!ex || !inc) return null
    const curSpend = sumExpansesInRange(ex, fromISO, toISO)
    const curIncome = sumIncomesInRange(inc, fromISO, toISO)
    const prevSpend = sumExpansesInRange(ex, prevFromISO, prevToISO)
    const prevIncome = sumIncomesInRange(inc, prevFromISO, prevToISO)
    return buildSummaryFromRanges(curSpend, curIncome, prevSpend, prevIncome)
  }, [expansesQuery.data, incomesQuery.data, fromISO, toISO, prevFromISO, prevToISO])

  const summary: DashboardSummary | null = useMemo(() => {
    if (summaryQuery.data) return summaryQuery.data
    if (summaryQuery.isError) return summaryFromLists
    return null
  }, [summaryQuery.data, summaryQuery.isError, summaryFromLists])

  const summaryLoading = summaryQuery.isPending && !summaryQuery.data

  const recentTransactions: DashboardTransaction[] = recentQuery.data ?? []

  const budgetRows: BudgetSummaryRow[] = useMemo(() => {
    if (USE_DUMMY_DASHBOARD_DATA) {
      return DUMMY_BUDGETS.map((b, i) => ({
        id: i + 1,
        category: null,
        category_name: b.category,
        budget_amount: b.limit,
        spent_amount: b.spent,
        remaining_amount: b.limit - b.spent,
        progress_percent: b.percent,
        is_over_budget: b.percent > 100,
      }))
    }
    return budgetQuery.data ?? []
  }, [budgetQuery.data])

  const categorySlices: ExpenseCategorySlice[] = categoryQuery.data ?? []
  const topExpenseCategory = categorySlices[0] ?? null

  const refetchSummary = () => {
    void summaryQuery.refetch()
    void expansesQuery.refetch()
    void incomesQuery.refetch()
    void budgetQuery.refetch()
    void categoryQuery.refetch()
    void recentQuery.refetch()
  }

  return {
    periodPreset,
    setPeriodPreset,
    customMonth,
    setCustomMonth,
    fromISO,
    toISO,
    summary,
    summaryLoading,
    summaryError: summaryQuery.isError && !summaryFromLists,
    refetchSummary,
    budgetRows,
    budgetLoading: budgetQuery.isPending,
    budgetError: budgetQuery.isError,
    refetchBudget: () => void budgetQuery.refetch(),
    periodLabel,
    categorySlices,
    categoryLoading: categoryQuery.isPending,
    categoryError: categoryQuery.isError ? 'Could not load category breakdown.' : null,
    topExpenseCategory,
    recentTransactions,
    recentLoading: recentQuery.isPending,
    recentError: recentQuery.isError ? 'Could not load recent transactions.' : null,
    refetchRecent: () => void recentQuery.refetch(),
  }
}
