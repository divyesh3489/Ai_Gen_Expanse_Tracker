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
    <div className="dashboard-content lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-slate-50 dark:lg:border-slate-800 dark:lg:bg-[#0d1117]">
      <div className="dashboard-section-header dashboard-section-full">
        <DashboardHeader
          greeting={greeting}
          firstName={firstName}
          periodPreset={periodPreset}
          onPeriodChange={setPeriodPreset}
          customMonth={customMonth}
          onCustomMonthChange={setCustomMonth}
          compact
        />
      </div>

      <div className="dashboard-section-kpi dashboard-section-full">
        <SummaryCards
          summary={summary}
          loading={summaryLoading}
          error={summaryError}
          onRetry={refetchSummary}
          compact
        />
      </div>

      <div className="dashboard-two-col dashboard-section-trend">
        <IncomeExpenseTrendChart
          years={chartYear.years}
          selectedYear={chartYear.selectedYear}
          onYearChange={chartYear.setSelectedYear}
          financeTrendRows={chartYear.financeTrendRows}
          loading={chartYear.areaChartLoading}
          error={chartYear.trendError}
          compact
        />
        <BudgetProgressPanel
          rows={budgetRows}
          loading={budgetLoading}
          error={budgetError}
          onRetry={refetchBudget}
          compact
        />
      </div>

      <div className="dashboard-two-col dashboard-section-expense-charts w-full">
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
          compact
        />
      </div>

      <div className="dashboard-section-transactions dashboard-section-full dashboard-transactions-panel">
        <RecentTransactionsPanel
          items={recentTransactions}
          loading={recentLoading}
          error={recentError}
          onRetry={refetchRecent}
          compact
        />
      </div>

      <div className="dashboard-section-insights dashboard-section-full dashboard-insights-panel">
        <InsightsRow summary={summary} topCategory={topExpenseCategory} compact />
      </div>
    </div>
  )
}
