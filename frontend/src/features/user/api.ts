import { http } from '../../app/api/http'
import type { User } from '../../app/auth/AuthContext'

export type UpdateMePayload = {
  first_name?: string
  last_name?: string
  gender?: 'male' | 'female' | null
  dob?: string | null
}

export async function getMe() {
  const res = await http.get<User>('/v1/user/me/')
  return res.data
}

export async function patchMe(payload: UpdateMePayload) {
  const res = await http.patch<User>('/v1/user/me/', payload)
  return res.data
}

export async function uploadProfilePicture(file: File) {
  const form = new FormData()
  form.append('profile_picture', file)
  const res = await http.post<{ message?: string; profile_picture: string }>(
    '/v1/user/upload-profile-picture/',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return res.data
}

export async function requestPasswordReset(email: string) {
  const res = await http.post<{ message?: string }>('/v1/user/request-password-reset/', { email })
  return res.data
}

export async function resetPassword(payload: { token: string; new_password: string }) {
  const res = await http.post<{ message?: string }>('/v1/user/reset-password/', payload)
  return res.data
}

