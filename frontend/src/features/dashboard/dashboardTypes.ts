export type PeriodPreset = 'this_month' | 'last_month' | 'last_3' | 'last_6' | 'custom'

/** 1-based month, used when `periodPreset === 'custom'`. */
export type CustomMonth = { year: number; month: number }

export type FinanceTrendRow = {
  month: string
  total_spend: number | string
  total_income: number | string
  net: number | string
}

export type AnnotatedTrendPoint = FinanceTrendRow & {
  year: number
  monthIndex: number
  key: string
}

export type BudgetSummaryRow = {
  id: number
  category: number | null
  category_name: string | null
  budget_amount: number | string
  spent_amount: number | string
  remaining_amount: number | string
  progress_percent: number | string | null
  is_over_budget: boolean
}

export type DashboardTransaction = {
  id: number
  name: string
  category: string
  category_color?: string | null
  date: string
  icon?: string | null
  amount: number
  type: 'expense' | 'income'
}

export type ExpenseCategorySlice = {
  category: string
  amount: number
  percent: number
  color: string
}
