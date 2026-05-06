import { Link, NavLink, Outlet } from 'react-router-dom'
import { Banknote, CalendarClock, LayoutDashboard, LogOut, PiggyBank, Shapes, Wallet } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../app/auth/AuthContext'
import { Button } from '../components/ui/Button'

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/categories', label: 'Categories', icon: Shapes },
  { to: '/app/expenses', label: 'Expenses', icon: Wallet },
  { to: '/app/incomes', label: 'Incomes', icon: Banknote },
  { to: '/app/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/app/recurring', label: 'Recurring', icon: CalendarClock },
]

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto flex min-h-dvh max-w-7xl">
        <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="px-5 py-5">
            <Link to="/app" className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                ET
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Expanse Tracker</div>
                <div className="text-xs text-slate-500">Finance dashboard</div>
              </div>
            </Link>
          </div>

          <nav className="px-3">
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 px-4 py-4">
            <div className="text-xs text-slate-500">Signed in as</div>
            <div className="mt-1 truncate text-sm font-medium text-slate-900">{user?.email}</div>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <div className="text-sm font-semibold text-slate-900">Expanse Tracker</div>
              <div className="text-xs text-slate-600">{user?.email}</div>
            </div>
            <div className="mx-auto max-w-5xl px-2 pb-3 lg:hidden">
              <div className="flex gap-2 overflow-x-auto px-2">
                {nav.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        clsx(
                          'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs',
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700',
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-5xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

