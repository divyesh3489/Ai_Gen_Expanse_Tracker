import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { listBudgets } from '../features/budgets/api'
import { listExpanses } from '../features/expanses/api'
import { listIncomes } from '../features/incomes/api'

function sumAmount(items: { amount: string }[]) {
  return items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
}

export function DashboardPage() {
  const expanses = useQuery({ queryKey: ['expanses'], queryFn: listExpanses })
  const incomes = useQuery({ queryKey: ['incomes'], queryFn: listIncomes })
  const budgets = useQuery({ queryKey: ['budgets'], queryFn: listBudgets })

  const expanseTotal = sumAmount(expanses.data ?? [])
  const incomeTotal = sumAmount(incomes.data ?? [])
  const net = incomeTotal - expanseTotal

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">A quick overview of your finances.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500">Expenses</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{expanseTotal.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500">{expanses.data?.length ?? 0} entries</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Incomes</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{incomeTotal.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500">{incomes.data?.length ?? 0} entries</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Net</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{net.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500">Income − expense</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Budgets</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{budgets.data?.length ?? 0}</div>
          <div className="mt-1 text-xs text-slate-500">Active budgets</div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900">Recent expenses</div>
          <div className="mt-3 divide-y divide-slate-200">
            {(expanses.data ?? []).slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">{e.note ?? 'Expense'}</div>
                  <div className="text-xs text-slate-500">{e.date}</div>
                </div>
                <div className="shrink-0 font-semibold text-slate-900">{e.amount}</div>
              </div>
            ))}
            {!expanses.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500">No expenses yet.</div>
            ) : null}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900">Recent incomes</div>
          <div className="mt-3 divide-y divide-slate-200">
            {(incomes.data ?? []).slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">{e.note ?? 'Income'}</div>
                  <div className="text-xs text-slate-500">{e.date}</div>
                </div>
                <div className="shrink-0 font-semibold text-slate-900">{e.amount}</div>
              </div>
            ))}
            {!incomes.data?.length ? (
              <div className="py-8 text-center text-sm text-slate-500">No incomes yet.</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}

