import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  CalendarClock,
  CircleUser,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  PiggyBank,
  Settings,
  Shapes,
  Wallet,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../app/auth/AuthContext'
import { useCategoryPreferencesMeta } from '../features/categories/useCategoryPreferences'
import { Button } from '../components/ui/Button'

const baseNav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/categories', label: 'Categories', icon: Shapes },
  { to: '/app/expenses', label: 'Expenses', icon: Wallet },
  { to: '/app/incomes', label: 'Incomes', icon: Banknote },
  { to: '/app/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/app/recurring', label: 'Recurring', icon: CalendarClock },
  { to: '/app/profile', label: 'Profile', icon: CircleUser },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: true },
  { to: '/app/settings/category-preferences', label: 'Category colors', icon: Palette },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  useCategoryPreferencesMeta()

  const nav = useMemo(
    () => (user?.is_staff ? baseNav : baseNav.filter((item) => item.to !== '/app/categories')),
    [user?.is_staff],
  )
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const signedInLabel =
    (typeof user?.full_name === 'string' && user.full_name.trim()) ||
    `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
    user?.email ||
    ''

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-dvh w-full">
        <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 overflow-hidden border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950">
          <div className="px-5 py-5">
            <Link to="/app" className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-slate-900">
                <img src="/logo.png" alt="FinStackAI" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">FinStackAI</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Smart finance, simplified</div>
              </div>
            </Link>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3">
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={Boolean(item.end)}
                  className={({ isActive }) =>
                    clsx(
                      'mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-[#1a1a2e] font-medium text-white dark:bg-white dark:text-slate-900'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6] dark:text-slate-200 dark:hover:bg-slate-900/40',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Signed in as</div>
            <Link
              to="/app/profile"
              className="mt-1 block truncate text-sm font-medium text-slate-900 hover:underline dark:text-slate-50"
            >
              {signedInLabel}
            </Link>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col lg:h-dvh lg:overflow-hidden">
          {/* Mobile nav trigger — in document flow so it does not overlap charts */}
          <div className="flex shrink-0 items-center px-4 pb-1 pt-3 lg:hidden">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-900 shadow-sm shadow-slate-900/5 backdrop-blur transition hover:bg-white dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-50 dark:shadow-none dark:hover:bg-slate-950"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile drawer */}
          <div
            className={clsx(
              'fixed inset-0 z-50 lg:hidden',
              isMobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none',
            )}
            aria-hidden={!isMobileNavOpen}
          >
            <div
              className={clsx(
                'absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity dark:bg-slate-900/50',
                isMobileNavOpen ? 'opacity-100' : 'opacity-0',
              )}
              onClick={() => setIsMobileNavOpen(false)}
            />

            <div
              className={clsx(
                'absolute left-3 right-3 top-3 origin-top rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/10 transition dark:border-slate-800/60 dark:bg-slate-950 dark:text-white dark:shadow-slate-950/40',
                isMobileNavOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
              )}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <Link
                  to="/app"
                  className="flex items-center gap-3"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-slate-900">
                    <img src="/logo.png" alt="FinStackAI" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">FinStackAI</div>
                    <div className="text-xs text-slate-500 dark:text-white/60">Smart finance, simplified</div>
                  </div>
                </Link>

                <button
                  type="button"
                  aria-label="Close navigation"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="px-2 pb-2">
                {nav.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={Boolean(item.end)}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition',
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-white/10 dark:text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white',
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </nav>

              <div className="border-t border-slate-200 px-4 py-4 dark:border-white/10">
                <div className="text-xs text-slate-500 dark:text-white/60">Signed in as</div>
                <Link
                  to="/app/profile"
                  className="mt-1 block truncate text-sm font-medium text-slate-900 hover:underline dark:text-white"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  {signedInLabel}
                </Link>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  onClick={() => {
                    setIsMobileNavOpen(false)
                    logout()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="app-main-content h-full w-full min-w-0 flex-1 px-0 pb-6 pt-0 lg:overflow-hidden lg:p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

