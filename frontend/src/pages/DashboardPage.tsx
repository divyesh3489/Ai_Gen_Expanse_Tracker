import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { listBudgets } from '../features/budgets/api'
import { listCategories } from '../features/categories/api'
import { displayCategoryLabel, preferenceKeyFromRow } from '../features/categories/categoryDisplayUtils'
import { CategoryDisplay } from '../features/categories/CategoryDisplay'
import { listExpanses } from '../features/expanses/api'
import { listIncomes } from '../features/incomes/api'

function sumAmount(items: { amount: string }[]) {
  return items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
}

export function DashboardPage() {
  const expanses = useQuery({ queryKey: ['expanses'], queryFn: listExpanses })
  const incomes = useQuery({ queryKey: ['incomes'], queryFn: listIncomes })
  const budgets = useQuery({ queryKey: ['budgets'], queryFn: listBudgets })
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of categories.data ?? []) map.set(c.id, c.name)
    return map
  }, [categories.data])

  const expanseTotal = sumAmount(expanses.data ?? [])
  const incomeTotal = sumAmount(incomes.data ?? [])
  const net = incomeTotal - expanseTotal

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">A quick overview of your finances.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Expenses</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{expanseTotal.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{expanses.data?.length ?? 0} entries</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Incomes</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{incomeTotal.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{incomes.data?.length ?? 0} entries</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Net</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{net.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Income − expense</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Budgets</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{budgets.data?.length ?? 0}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active budgets</div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent expenses</div>
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {(expanses.data ?? []).slice(0, 5).map((e) => (
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
            ))}
            {!expanses.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No expenses yet.</div>
            ) : null}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent incomes</div>
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {(incomes.data ?? []).slice(0, 5).map((e) => (
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
            ))}
            {!incomes.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No incomes yet.</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
