import { http } from '../../app/api/http'
import type { Category } from './types'

export type CategoryWritePayload = {
  name: string
  type: 'expense' | 'income'
  icon: string
  default_color: string
}

export async function listCategories(params?: { type?: 'expense' | 'income' }) {
  const qs = params?.type ? `?type=${encodeURIComponent(params.type)}` : ''
  const res = await http.get<Category[]>(`/v1/expanse/categories/${qs}`)
  return res.data
}

export async function createCategory(payload: CategoryWritePayload) {
  const res = await http.post<Category>('/v1/expanse/categories/', payload)
  return res.data
}

export async function deleteCategory(id: number) {
  await http.delete(`/v1/expanse/categories/${id}/`)
}

export async function updateCategory(id: number, payload: CategoryWritePayload) {
  const res = await http.put<Category>(`/v1/expanse/categories/${id}/`, payload)
  return res.data
}
