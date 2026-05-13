import { http } from '../../app/api/http'
import { compactRequestParams, extractResults, type ExtractedPage } from '../../utils/pagination'
import type { Expanse } from './types'

export async function listExpanses(
  params?: { page_size?: number; cursor?: string | null },
): Promise<ExtractedPage<Expanse>> {
  const res = await http.get('/v1/expanse/expanses/', {
    params: compactRequestParams(params ?? {}),
  })
  return extractResults<Expanse>(res.data)
}

export async function createExpanse(payload: {
  category: number | null
  amount: string
  note?: string
  date: string
}) {
  const res = await http.post<Expanse>('/v1/expanse/expanses/', payload)
  return res.data
}

export async function deleteExpanse(id: number) {
  await http.delete(`/v1/expanse/expanses/${id}/`)
}

export async function updateExpanse(
  id: number,
  payload: { category: number | null; amount: string; note?: string; date: string },
) {
  const res = await http.put<Expanse>(`/v1/expanse/expanses/${id}/`, payload)
  return res.data
}

