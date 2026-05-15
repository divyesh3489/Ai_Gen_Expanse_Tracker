import { useMemo } from 'react'
import { useAuth } from '../app/auth/AuthContext'
import { useDashboardChartYear } from '../hooks/useDashboardChartYear'
import { useDashboardData } from '../hooks/useDashboardData'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { IncomeExpenseTrendChart } from '../components/dashboard/IncomeExpenseTrendChart'
import { BudgetProgressPanel } from '../components/dashboard/BudgetProgressPanel'
import { ExpenseDonutSection } from '../components/dashboard/ExpenseDonutSection'
import { MonthlyExpenseBarChart } from '../components/dashboard/MonthlyExpenseBarChart'
import { RecentTransactionsPanel } from '../components/dashboard/RecentTransactionsPanel'
import { InsightsRow } from '../components/dashboard/InsightsRow'

function greetingForHour(h: number) {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const { user } = useAuth()
  const chartYear = useDashboardChartYear()
  const {
    periodPreset,
    setPeriodPreset,
    customMonth,
    setCustomMonth,
    summary,
    summaryLoading,
    summaryError,
    refetchSummary,
    budgetRows,
    budgetLoading,
    budgetError,
    refetchBudget,
    periodLabel,
    categorySlices,
    categoryLoading,
    categoryError,
    topExpenseCategory,
    recentTransactions,
    recentLoading,
    recentError,
    refetchRecent,
  } = useDashboardData()

  const greeting = greetingForHour(new Date().getHours())
  const firstName = useMemo(() => {
    const fn = user?.first_name?.trim()
    if (fn) return fn
    const email = user?.email?.split('@')[0]
    return email || 'there'
  }, [user?.first_name, user?.email])

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-slate-800 dark:bg-[#0d1117]">
      <DashboardHeader
        greeting={greeting}
        firstName={firstName}
        periodPreset={periodPreset}
        onPeriodChange={setPeriodPreset}
        customMonth={customMonth}
        onCustomMonthChange={setCustomMonth}
      />

      <SummaryCards
        summary={summary}
        loading={summaryLoading}
        error={summaryError}
        onRetry={() => {
          refetchSummary()
        }}
      />

      <div className="grid gap-3 lg:grid-cols-5 lg:gap-4">
        <div className="lg:col-span-3">
          <IncomeExpenseTrendChart
            years={chartYear.years}
            selectedYear={chartYear.selectedYear}
            onYearChange={chartYear.setSelectedYear}
            financeTrendRows={chartYear.financeTrendRows}
            loading={chartYear.areaChartLoading}
            error={chartYear.trendError}
          />
        </div>
        <div className="lg:col-span-2">
          <BudgetProgressPanel
            rows={budgetRows}
            loading={budgetLoading}
            error={budgetError}
            onRetry={() => {
              refetchBudget()
            }}
          />
        </div>
      </div>

      <div className="grid items-stretch gap-3 lg:grid-cols-2 lg:gap-4">
        <ExpenseDonutSection
          slices={categorySlices}
          loading={categoryLoading}
          error={categoryError}
          periodLabel={periodLabel}
        />
        <MonthlyExpenseBarChart
          years={chartYear.years}
          selectedYear={chartYear.selectedYear}
          onYearChange={chartYear.setSelectedYear}
          financeTrendRows={chartYear.financeTrendRows}
          loading={chartYear.monthlyChartLoading}
        />
      </div>

      <RecentTransactionsPanel
        items={recentTransactions}
        loading={recentLoading}
        error={recentError}
        onRetry={refetchRecent}
      />

      <InsightsRow summary={summary} topCategory={topExpenseCategory} />
    </div>
  )
}
