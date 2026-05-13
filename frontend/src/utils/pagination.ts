import { http } from '../app/api/http'

/** Parsed cursor page — works with legacy plain-array responses and DRF cursor pages. */
export type ExtractedPage<T = unknown> = {
  results: T[]
  next: string | null
  previous: string | null
  pageSize: number
}

function readNullableString(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === 'string') return v
  return String(v)
}

/**
 * Safely extracts data from both old (array) and new (paginated object) responses.
 */
export function extractResults<T = unknown>(response: unknown): ExtractedPage<T> {
  if (Array.isArray(response)) {
    return { results: response as T[], next: null, previous: null, pageSize: 20 }
  }
  if (!response || typeof response !== 'object') {
    return { results: [], next: null, previous: null, pageSize: 20 }
  }
  const r = response as Record<string, unknown>
  const rawResults = r.results
  const results = Array.isArray(rawResults) ? (rawResults as T[]) : []
  const next = readNullableString(r.next)
  const previous = readNullableString(r.previous)
  const ps = r.page_size
  const pageSize = typeof ps === 'number' && Number.isFinite(ps) ? ps : 20
  return { results, next, previous, pageSize }
}

/**
 * Extracts the cursor param value from a full cursor URL returned by DRF.
 */
export function extractCursor(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url, window.location.origin).searchParams.get('cursor')
  } catch {
    return null
  }
}

export function compactRequestParams(
  params: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    out[k] = v
  }
  return out
}

/**
 * Follows cursor pages until `next` is null. Used for dashboard totals where the API
 * has no aggregate endpoint (cursor APIs cannot jump to “page N”).
 */
export async function fetchAllCursorPages<T>(
  path: string,
  baseParams: Record<string, string | number | boolean | undefined | null> = {},
  pageSize = 100,
): Promise<T[]> {
  const all: T[] = []
  let cursor: string | null = null
  let hasNext = true

  while (hasNext) {
    const res = await http.get(path, {
      params: compactRequestParams({
        ...baseParams,
        page_size: pageSize,
        ...(cursor ? { cursor } : {}),
      }),
    })
    const { results, next } = extractResults<T>(res.data)
    all.push(...results)
    cursor = extractCursor(next)
    hasNext = !!next
  }

  return all
}
