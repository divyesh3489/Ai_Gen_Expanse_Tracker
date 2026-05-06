import { AxiosError, isAxiosError } from 'axios'

function hasStringDetail(x: unknown): x is { detail: string } {
  if (!x || typeof x !== 'object') return false
  const rec = x as Record<string, unknown>
  return typeof rec.detail === 'string'
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
}

function tryGetDrfValidationMessage(data: unknown): string | null {
  if (!isRecord(data)) return null

  const nonField = data.non_field_errors
  if (Array.isArray(nonField)) {
    const msgs = nonField.filter((x): x is string => typeof x === 'string')
    if (msgs.length) return msgs.join(' ')
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === 'detail') continue
    if (typeof value === 'string') return value
    if (Array.isArray(value)) {
      const msgs = value.filter((x): x is string => typeof x === 'string')
      if (msgs.length) return msgs.join(' ')
    }
  }

  return null
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (isAxiosError(error)) {
    const data = error.response?.data as unknown
    if (hasStringDetail(data)) return data.detail
    if (typeof data === 'string' && data.trim()) return data
    const drf = tryGetDrfValidationMessage(data)
    if (drf) return drf
    if (typeof error.message === 'string' && error.message) return error.message
  }

  // Backup in case instanceof works but isAxiosError doesn’t.
  if (error instanceof AxiosError) {
    const data = error.response?.data as unknown
    const drf = tryGetDrfValidationMessage(data)
    if (drf) return drf
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

