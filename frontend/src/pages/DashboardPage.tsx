import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { listCategories } from '../features/categories/api'
import { displayCategoryLabel, preferenceKeyFromRow } from '../features/categories/categoryDisplayUtils'
import { CategoryDisplay } from '../features/categories/CategoryDisplay'
import { listExpanses } from '../features/expanses/api'
import type { Expanse } from '../features/expanses/types'
import { listIncomes } from '../features/incomes/api'
import type { Income } from '../features/incomes/types'
import type { Budget } from '../features/budgets/types'
import { fetchAllCursorPages } from '../utils/pagination'

function sumAmount(items: { amount: string }[]) {
  return items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
}

export function DashboardPage() {
  const expansesTotals = useQuery({
    queryKey: ['expanses', 'dashboard-totals'],
    queryFn: () => fetchAllCursorPages<Expanse>('/v1/expanse/expanses/'),
  })
  const expansesRecent = useQuery({
    queryKey: ['expanses', 'dashboard-recent'],
    queryFn: async () => (await listExpanses({ page_size: 5 })).results,
  })

  const incomesTotals = useQuery({
    queryKey: ['incomes', 'dashboard-totals'],
    queryFn: () => fetchAllCursorPages<Income>('/v1/expanse/incomes/'),
  })
  const incomesRecent = useQuery({
    queryKey: ['incomes', 'dashboard-recent'],
    queryFn: async () => (await listIncomes({ page_size: 5 })).results,
  })

  const budgetsTotals = useQuery({
    queryKey: ['budgets', 'dashboard-totals'],
    queryFn: () => fetchAllCursorPages<Budget>('/v1/expanse/budgets/'),
  })

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of categories.data ?? []) map.set(c.id, c.name)
    return map
  }, [categories.data])

  const expanseTotal = sumAmount(expansesTotals.data ?? [])
  const incomeTotal = sumAmount(incomesTotals.data ?? [])
  const net = incomeTotal - expanseTotal

  const totalsLoading = expansesTotals.isLoading || incomesTotals.isLoading || budgetsTotals.isLoading

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">A quick overview of your finances.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Expenses</div>
          {totalsLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Spinner className="h-4 w-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
              Loading…
            </div>
          ) : (
            <>
              <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{expanseTotal.toFixed(2)}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {expansesTotals.data?.length ?? 0} entries
              </div>
            </>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Incomes</div>
          {totalsLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Spinner className="h-4 w-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
              Loading…
            </div>
          ) : (
            <>
              <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{incomeTotal.toFixed(2)}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {incomesTotals.data?.length ?? 0} entries
              </div>
            </>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Net</div>
          {totalsLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Spinner className="h-4 w-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
              Loading…
            </div>
          ) : (
            <>
              <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{net.toFixed(2)}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Income − expense</div>
            </>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Budgets</div>
          {totalsLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Spinner className="h-4 w-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
              Loading…
            </div>
          ) : (
            <>
              <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {budgetsTotals.data?.length ?? 0}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active budgets</div>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent expenses</div>
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {expansesRecent.isLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-600 dark:text-slate-300">
                <Spinner className="h-4 w-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
                Loading…
              </div>
            ) : (
              (expansesRecent.data ?? []).map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <CategoryDisplay
                      variant="card"
                      label={displayCategoryLabel(e, categoryNameById, '—')}
                      preferenceKey={preferenceKeyFromRow(e, categoryNameById)}
                      listColor={e.category_color}
                    />
                    {e.note ? (
                      <div className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">{e.note}</div>
                    ) : null}
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{e.date}</div>
                  </div>
                  <div className="shrink-0 pt-0.5 font-semibold text-slate-900 dark:text-slate-50">{e.amount}</div>
                </div>
              ))
            )}
            {!expansesRecent.isLoading && !expansesRecent.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No expenses yet.</div>
            ) : null}
          </div>
          <div className="mt-3 flex justify-end">
            <Link
              to="/app/expenses"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            >
              View all expenses
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent incomes</div>
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {incomesRecent.isLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-600 dark:text-slate-300">
                <Spinner className="h-4 w-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
                Loading…
              </div>
            ) : (
              (incomesRecent.data ?? []).map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <CategoryDisplay
                      variant="card"
                      label={displayCategoryLabel(e, categoryNameById, '—')}
                      preferenceKey={preferenceKeyFromRow(e, categoryNameById)}
                      listColor={e.category_color}
                    />
                    {e.note ? (
                      <div className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">{e.note}</div>
                    ) : null}
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{e.date}</div>
                  </div>
                  <div className="shrink-0 pt-0.5 font-semibold text-slate-900 dark:text-slate-50">{e.amount}</div>
                </div>
              ))
            )}
            {!incomesRecent.isLoading && !incomesRecent.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No incomes yet.</div>
            ) : null}
          </div>
          <div className="mt-3 flex justify-end">
            <Link
              to="/app/incomes"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            >
              View all incomes
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
