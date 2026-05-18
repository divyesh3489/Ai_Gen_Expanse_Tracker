/** Toggle to use mock data for budget / donut / recent panels (per design doc). */
export const USE_DUMMY_DASHBOARD_DATA = false

export const DUMMY_BUDGETS = [
  { category: 'Food', color: '#ef4444', spent: 4500, limit: 6000, percent: 75 },
  { category: 'Shopping', color: '#3b82f6', spent: 9000, limit: 7000, percent: 128 },
  { category: 'Transport', color: '#f59e0b', spent: 2200, limit: 4000, percent: 55 },
  { category: 'Entertainment', color: '#8b5cf6', spent: 1200, limit: 2000, percent: 60 },
  { category: 'Health', color: '#22c55e', spent: 800, limit: 1500, percent: 53 },
] as const

export const DUMMY_EXPENSE_CATEGORIES = [
  { category: 'Food', amount: 12500, percent: 25, color: '#ef4444' },
  { category: 'Shopping', amount: 10000, percent: 20, color: '#3b82f6' },
  { category: 'Transport', amount: 9000, percent: 18, color: '#f59e0b' },
  { category: 'Entertainment', amount: 7500, percent: 15, color: '#8b5cf6' },
  { category: 'Bills', amount: 6000, percent: 12, color: '#06b6d4' },
  { category: 'Others', amount: 5000, percent: 10, color: '#6b7280' },
] as const

export const DUMMY_TRANSACTIONS = [
  { id: 1, name: 'Starbucks Coffee', category: 'Food', date: '2026-05-14', amount: -450, type: 'expense' as const },
  { id: 2, name: 'Salary', category: 'Income', date: '2026-05-14', amount: 50000, type: 'income' as const },
  { id: 3, name: 'Amazon Shopping', category: 'Shopping', date: '2026-05-13', amount: -1299, type: 'expense' as const },
  { id: 4, name: 'Uber Ride', category: 'Transport', date: '2026-05-13', amount: -250, type: 'expense' as const },
  { id: 5, name: 'Netflix', category: 'Entertainment', date: '2026-05-12', amount: -199, type: 'expense' as const },
]
