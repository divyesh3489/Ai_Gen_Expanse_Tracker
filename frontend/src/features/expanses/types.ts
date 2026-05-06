export type Expanse = {
  id: number
  // New API shape: backend may return a flattened "name" (category name)
  name?: string
  // Backward-compatible shape
  category?: number | null
  category_name?: string
  amount: string
  note?: string | null
  date: string
}

