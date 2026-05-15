import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDashboardYears } from '../features/dashboard/dashboardYearsApi'
import { fetchFinanceTrend } from '../features/dashboard/financeTrendApi'
import type { FinanceTrendRow } from '../features/dashboard/dashboardTypes'

/** Year + finance-trend state for Income vs Expense and Monthly Expense charts. */
export function useDashboardChartYear() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const yearsQuery = useQuery({
    queryKey: ['dashboard-years'],
    queryFn: fetchDashboardYears,
    staleTime: 120_000,
  })

  const years = useMemo(
    () => [...(yearsQuery.data ?? [])].sort((a, b) => b - a),
    [yearsQuery.data],
  )

  useEffect(() => {
    if (selectedYear != null || !years.length) return
    setSelectedYear(years[0])
  }, [years, selectedYear])

  const trendQuery = useQuery({
    queryKey: ['finance-trend', selectedYear],
    queryFn: () => fetchFinanceTrend(selectedYear!),
    enabled: selectedYear != null,
    staleTime: 120_000,
  })

  const financeTrendRows: FinanceTrendRow[] = trendQuery.data ?? []
  const yearsLoading = yearsQuery.isPending
  const trendLoading = selectedYear != null && trendQuery.isPending

  return {
    years,
    selectedYear,
    setSelectedYear,
    financeTrendRows,
    yearsLoading,
    trendLoading,
    areaChartLoading: yearsLoading || trendLoading,
    monthlyChartLoading: yearsLoading || trendLoading,
    trendError: trendQuery.isError ? 'Could not load finance trend.' : null,
  }
}
