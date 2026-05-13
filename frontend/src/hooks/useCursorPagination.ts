import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { http } from '../app/api/http'
import { getErrorMessage } from '../app/api/error'
import { compactRequestParams, extractCursor, extractResults } from '../utils/pagination'

export type UseCursorPaginationOptions = {
  pageSize?: number
  autoLoad?: boolean
}

export type RequestParams = Record<string, string | number | boolean | undefined | null>

/**
 * Cursor-based pagination for list endpoints using the shared axios instance.
 */
export function useCursorPagination<T>(
  endpoint: string,
  params: RequestParams = {},
  options: UseCursorPaginationOptions = {},
) {
  const pageSize = options.pageSize ?? 20
  const autoLoad = options.autoLoad ?? true

  const [results, setResults] = useState<T[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [prevUrl, setPrevUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoLoad)
  const [error, setError] = useState<unknown>(null)
  const [hasMore, setHasMore] = useState(false)

  const paramsRef = useRef(params)
  const serializedParams = JSON.stringify(params)
  useLayoutEffect(() => {
    paramsRef.current = params
  }, [params, serializedParams])

  const load = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (!append) {
        setInitialLoading(true)
        setError(null)
      }
      setLoading(true)
      try {
        const res = await http.get(endpoint, {
          params: compactRequestParams({
            ...paramsRef.current,
            page_size: pageSize,
            ...(cursor ? { cursor } : {}),
          }),
        })
        const { results: chunk, next, previous } = extractResults<T>(res.data)
        setResults((prev) => (append ? [...prev, ...chunk] : chunk))
        setNextUrl(next)
        setPrevUrl(previous)
        setHasMore(!!next)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
        if (!append) setInitialLoading(false)
      }
    },
    // serializedParams must bump this callback when filters change so the bootstrap effect re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- paramsRef + serializedParams together keep cursor lists in sync
    [endpoint, pageSize, serializedParams],
  )

  useEffect(() => {
    if (!autoLoad) return
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) void load(null, false)
    })
    return () => {
      cancelled = true
    }
  }, [autoLoad, load])

  const loadMore = useCallback(async () => {
    const c = extractCursor(nextUrl)
    if (!c || loading) return
    await load(c, true)
  }, [load, loading, nextUrl])

  const refresh = useCallback(async () => {
    await load(null, false)
  }, [load])

  const reset = useCallback(() => {
    setResults([])
    setNextUrl(null)
    setPrevUrl(null)
    setLoading(false)
    setInitialLoading(true)
    setError(null)
    setHasMore(false)
  }, [])

  return {
    results,
    loading,
    initialLoading,
    error,
    hasMore,
    nextCursor: extractCursor(nextUrl),
    prevCursor: extractCursor(prevUrl),
    nextUrl,
    prevUrl,
    loadMore,
    refresh,
    reset,
    errorMessage: error ? getErrorMessage(error, 'Something went wrong.') : null,
  }
}
