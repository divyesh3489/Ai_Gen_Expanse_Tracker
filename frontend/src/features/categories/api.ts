import { http } from '../../app/api/http'
import type { Category } from './types'

export async function listCategories() {
  const res = await http.get<Category[]>('/v1/expanse/categories/')
  return res.data
}

export async function createCategory(payload: { name: string }) {
  const res = await http.post<Category>('/v1/expanse/categories/', payload)
  return res.data
}

export async function deleteCategory(id: number) {
  await http.delete(`/v1/expanse/categories/${id}/`)
}

export async function updateCategory(id: number, payload: { name?: string }) {
  const res = await http.patch<Category>(`/v1/expanse/categories/${id}/`, payload)
  return res.data
}

