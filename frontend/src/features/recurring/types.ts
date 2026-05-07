export type Recurring = {
  id: number
  name?: string
  category_name?: string
  category?: number | null
  amount: string
  note?: string | null
  start_date: string
  end_date?: string | null
  next_run_date?: string | null
  frequency: string
  type: 'expense' | 'income' | string
  is_active?: boolean
}

