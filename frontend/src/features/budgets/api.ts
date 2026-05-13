import { http } from '../../app/api/http'
import { compactRequestParams, extractResults, type ExtractedPage } from '../../utils/pagination'
import type { Budget } from './types'

export async function listBudgets(
  params?: { page_size?: number; cursor?: string | null },
): Promise<ExtractedPage<Budget>> {
  const res = await http.get('/v1/expanse/budgets/', {
    params: compactRequestParams(params ?? {}),
  })
  return extractResults<Budget>(res.data)
}

export async function createBudget(payload: {
  category: number | null
  amount: string
  start_date: string
  end_date: string
}) {
  const res = await http.post<Budget>('/v1/expanse/budgets/', payload)
  return res.data
}

export async function deleteBudget(id: number) {
  await http.delete(`/v1/expanse/budgets/${id}/`)
}

export async function updateBudget(
  id: number,
  payload: { category: number | null; amount: string; start_date: string; end_date: string },
) {
  const res = await http.put<Budget>(`/v1/expanse/budgets/${id}/`, payload)
  return res.data
}

