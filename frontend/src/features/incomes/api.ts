import { http } from '../../app/api/http'
import { compactRequestParams, extractResults, type ExtractedPage } from '../../utils/pagination'
import type { Income } from './types'

export async function listIncomes(
  params?: { page_size?: number; cursor?: string | null },
): Promise<ExtractedPage<Income>> {
  const res = await http.get('/v1/expanse/incomes/', {
    params: compactRequestParams(params ?? {}),
  })
  return extractResults<Income>(res.data)
}

export async function createIncome(payload: {
  category: number | null
  amount: string
  note?: string
  date: string
}) {
  const res = await http.post<Income>('/v1/expanse/incomes/', payload)
  return res.data
}

export async function deleteIncome(id: number) {
  await http.delete(`/v1/expanse/incomes/${id}/`)
}

export async function updateIncome(
  id: number,
  payload: { category: number | null; amount: string; note?: string; date: string },
) {
  const res = await http.put<Income>(`/v1/expanse/incomes/${id}/`, payload)
  return res.data
}

