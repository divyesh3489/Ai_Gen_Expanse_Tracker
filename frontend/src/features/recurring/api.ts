import { http } from '../../app/api/http'
import type { Recurring } from './types'

export async function listRecurring() {
  const res = await http.get<Recurring[]>('/v1/expanse/recurring/')
  return res.data
}

export async function createRecurring(payload: {
  category: number | null
  amount: string
  note?: string
  start_date: string
  end_date?: string | null
  next_run_date?: string | null
  frequency: string
  type: string
}) {
  const res = await http.post<Recurring>('/v1/expanse/recurring/', payload)
  return res.data
}

export async function deleteRecurring(id: number) {
  await http.delete(`/v1/expanse/recurring/${id}/`)
}

export async function updateRecurring(
  id: number,
  payload: {
    category: number | null
    amount: string
    note?: string
    start_date: string
    end_date?: string | null
    next_run_date?: string | null
    frequency: string
    type: string
  },
) {
  const res = await http.put<Recurring>(`/v1/expanse/recurring/${id}/`, payload)
  return res.data
}

