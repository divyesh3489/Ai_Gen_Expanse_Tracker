import type { QueryClient } from '@tanstack/react-query'

/** After expenses or incomes change, refetch dashboard aggregates, budgets, and trend charts. */
export async function invalidateAfterFinanceDataChange(
  queryClient: QueryClient,
  lists: 'expanses' | 'incomes' | 'both',
) {
  const pending: Promise<unknown>[] = []
  if (lists === 'expanses' || lists === 'both') {
    pending.push(queryClient.invalidateQueries({ queryKey: ['expanses'] }))
  }
  if (lists === 'incomes' || lists === 'both') {
    pending.push(queryClient.invalidateQueries({ queryKey: ['incomes'] }))
  }
  pending.push(
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
    queryClient.invalidateQueries({ queryKey: ['budget-summary'] }),
    queryClient.invalidateQueries({ queryKey: ['finance-trend'] }),
    queryClient.invalidateQueries({ queryKey: ['category-breakdown'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-years'] }),
    queryClient.invalidateQueries({ queryKey: ['recent-transactions'] }),
  )
  await Promise.all(pending)
}
