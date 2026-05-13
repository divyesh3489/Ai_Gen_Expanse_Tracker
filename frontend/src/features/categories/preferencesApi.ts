import { http } from '../../app/api/http'
import { extractResults } from '../../utils/pagination'
import type {
  UserCategoryPreferenceRow,
  UserCategoryPreferenceWritePayload,
  UserCategoryPreferenceWriteResponse,
} from './types'

export async function listUserCategoryPreferences() {
  const res = await http.get('/v1/expanse/user-category-preferences/')
  const { results } = extractResults<UserCategoryPreferenceRow>(res.data)
  return results
}

export async function createUserCategoryPreference(payload: UserCategoryPreferenceWritePayload) {
  const res = await http.post<UserCategoryPreferenceWriteResponse>(
    '/v1/expanse/user-category-preferences/',
    payload,
  )
  return res.data
}

export async function updateUserCategoryPreference(
  id: number,
  payload: UserCategoryPreferenceWritePayload,
) {
  const res = await http.put<UserCategoryPreferenceWriteResponse>(
    `/v1/expanse/user-category-preferences/${id}/`,
    payload,
  )
  return res.data
}

export async function deleteUserCategoryPreference(id: number) {
  await http.delete(`/v1/expanse/user-category-preferences/${id}/`)
}
