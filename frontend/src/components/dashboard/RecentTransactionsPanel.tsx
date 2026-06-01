import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { IconType } from 'react-icons'
import * as FaIcons from 'react-icons/fa'
import { FaQuestionCircle } from 'react-icons/fa'
import { decodeIconFromApi } from '../../features/categories/iconCodec'
import { resolveIconComponent } from '../../features/categories/renderIcon'
import {
  DASHBOARD_CARD_HEADER,
  DASHBOARD_CARD_TITLE,
  DASHBOARD_PANEL_CARD,
} from '../../features/dashboard/dashboardCardStyles'
import type { DashboardTransaction } from '../../features/dashboard/dashboardTypes'
import { formatINR } from '../../utils/currency'

const RECENT_TRANSACTION_LIMIT = 5

const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#f87171'

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
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor }}
    >
      <Icon className="text-white" size={14} aria-hidden />
    </div>
  )
}

function sortByDateDesc(a: DashboardTransaction, b: DashboardTransaction): number {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
  if (dateDiff !== 0) return dateDiff
  return b.id - a.id
}

type Props = {
  items: DashboardTransaction[]
  loading: boolean
  error?: string | null
  onRetry?: () => void
  compact?: boolean
}

export function RecentTransactionsPanel({ items, loading, error, onRetry }: Props) {
  const displayItems = useMemo(
    () => [...items].sort(sortByDateDesc).slice(0, RECENT_TRANSACTION_LIMIT),
    [items],
  )

  if (loading) {
    return (
      <div className={`${DASHBOARD_PANEL_CARD} dashboard-transactions-card h-auto w-full animate-pulse`} />
    )
  }

  return (
    <div className={`${DASHBOARD_PANEL_CARD} dashboard-transactions-card h-auto w-full`}>
      <div className={`${DASHBOARD_CARD_HEADER} flex shrink-0 items-center justify-between gap-2`}>
        <h2 className={DASHBOARD_CARD_TITLE}>Recent Transactions</h2>
        <Link
          to="/app/expenses"
          className="shrink-0 text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          View all →
        </Link>
      </div>

      {error ? (
        <p className="py-2 text-center text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
      ) : (
        <ul className="w-full">
          {!displayItems.length ? (
            <li className="border-b border-slate-200 py-3 text-center text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No recent transactions found
            </li>
          ) : (
            displayItems.map((t) => {
              const isIncome = t.type === 'income'
              const amountColor = isIncome ? INCOME_COLOR : EXPENSE_COLOR
              const iconBg = t.category_color || '#64748B'
              const amountPrefix = isIncome ? '+' : '-'
              const badgeLabel = isIncome ? 'Income' : t.category

              return (
                <li
                  key={`${t.type}-${t.id}`}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0 dark:border-slate-800/80"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <TransactionIcon icon={t.icon} backgroundColor={iconBg} />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-[#1A1A2E] dark:text-white">{t.name}</p>
                      <p className="truncate text-[12px] text-slate-500 opacity-80 dark:text-slate-400">
                        {t.category} · {formatTransactionDate(t.date)}
                      </p>
                    </div>
                  </div>

                  <span className="max-w-[30%] shrink-0 truncate rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-center text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {badgeLabel}
                  </span>

                  <span
                    className="shrink-0 text-[11px] font-semibold tabular-nums"
                    style={{ color: amountColor }}
                  >
                    {amountPrefix}
                    {formatINR(Math.abs(t.amount))}
                  </span>
                </li>
              )
            })
          )}
        </ul>
      )}

      {error && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          Try again
        </button>
      ) : null}
    </div>
  )
}
