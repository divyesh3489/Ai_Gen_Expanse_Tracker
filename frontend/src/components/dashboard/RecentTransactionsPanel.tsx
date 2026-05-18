import type { IconType } from 'react-icons'
import * as FaIcons from 'react-icons/fa'
import { FaQuestionCircle } from 'react-icons/fa'
import { decodeIconFromApi } from '../../features/categories/iconCodec'
import { resolveIconComponent } from '../../features/categories/renderIcon'
import { DASHBOARD_PANEL_CARD } from '../../features/dashboard/dashboardCardStyles'
import type { DashboardTransaction } from '../../features/dashboard/dashboardTypes'
import { formatINR } from '../../utils/currency'

const SKELETON_ROWS = 4

const INCOME_COLOR = '#00e676'
const EXPENSE_COLOR = '#ff5252'

function formatTransactionDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function resolveTransactionIcon(icon: string | null | undefined): IconType {
  const raw = icon?.trim()
  if (!raw) return FaQuestionCircle
  const { pack, name } = decodeIconFromApi(raw)
  if (pack === 'fa') {
    const FaIcon = (FaIcons as unknown as Record<string, IconType>)[name]
    if (FaIcon && typeof FaIcon === 'function') return FaIcon
  }
  const resolved = resolveIconComponent(name, pack)
  const fallback = resolveIconComponent('MdCategory', 'md')
  return resolved === fallback ? FaQuestionCircle : resolved
}

function TransactionIcon({ icon, backgroundColor }: { icon?: string | null; backgroundColor: string }) {
  const Icon = resolveTransactionIcon(icon)
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor }}
    >
      <Icon className="text-white" size={18} aria-hidden />
    </div>
  )
}

function RecentTransactionsSkeleton() {
  return (
    <div className={DASHBOARD_PANEL_CARD}>
      <div className="shrink-0 border-b border-slate-800/80 pb-3">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-800" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-800/80" />
      </div>
      <ul className="mt-4 divide-y divide-slate-800">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-800" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-800" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-800/80" />
            </div>
            <div className="space-y-1.5 text-right">
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-800" />
              <div className="ml-auto h-3 w-14 animate-pulse rounded bg-slate-800/80" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

type Props = {
  items: DashboardTransaction[]
  loading: boolean
  error?: string | null
  onRetry?: () => void
}

export function RecentTransactionsPanel({ items, loading, error, onRetry }: Props) {
  if (loading) {
    return <RecentTransactionsSkeleton />
  }

  return (
    <div className={DASHBOARD_PANEL_CARD}>
      <div className="shrink-0 border-b border-slate-800/80 pb-3">
        <h2 className="text-base font-bold tracking-tight text-white">Recent Transactions</h2>
        <p className="mt-0.5 text-xs text-slate-500">Your latest financial activity</p>
      </div>

      {error ? (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 py-8 text-center">
          <p className="text-sm text-rose-400">{error}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-medium text-sky-400 hover:underline"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-800">
          {!items.length ? (
            <li className="py-8 text-center text-sm text-slate-400">No recent transactions found</li>
          ) : (
            items.map((t) => {
              const isIncome = t.type === 'income'
              const amountColor = isIncome ? INCOME_COLOR : EXPENSE_COLOR
              const iconBg = t.category_color || '#64748B'

              return (
                <li key={`${t.type}-${t.id}`} className="flex items-center gap-3 py-3">
                  <TransactionIcon icon={t.icon} backgroundColor={iconBg} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{t.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {t.category} · {formatTransactionDate(t.date)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums" style={{ color: amountColor }}>
                      {formatINR(Math.abs(t.amount))}
                    </p>
                    <p className="text-[10px] text-slate-500">{isIncome ? 'Income' : 'Expense'}</p>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
