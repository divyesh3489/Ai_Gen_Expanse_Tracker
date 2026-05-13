import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react'

export type InfiniteScrollSentinelOptions = {
  hasMore: boolean
  loading: boolean
  initialLoading: boolean
  loadMore: () => void | Promise<void>
}

/**
 * Infinite scroll: when the sentinel nears the viewport, calls loadMore().
 * Pass resultsVersion (e.g. results.length) so after a short page append we re-check
 * if the sentinel is still on-screen and load again.
 */
export function useInfiniteScrollSentinel(
  sentinelRef: RefObject<HTMLElement | null>,
  { hasMore, loading, initialLoading, loadMore }: InfiniteScrollSentinelOptions,
  resultsVersion: number,
) {
  const loadMoreRef = useRef(loadMore)
  const loadingRef = useRef(loading)

  useLayoutEffect(() => {
    loadMoreRef.current = loadMore
    loadingRef.current = loading
  }, [loadMore, loading])

  useEffect(() => {
    if (!hasMore || initialLoading) return
    const el = sentinelRef.current
    if (!el) return

    let cancelled = false

    const tryLoad = () => {
      if (cancelled || loadingRef.current) return
      void Promise.resolve(loadMoreRef.current())
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        tryLoad()
      },
      { root: null, rootMargin: '320px 0px', threshold: 0 },
    )

    obs.observe(el)

    queueMicrotask(() => {
      if (cancelled || loadingRef.current) return
      const r = el.getBoundingClientRect()
      const vh = typeof window !== 'undefined' ? window.innerHeight : 0
      if (r.top < vh + 320 && r.bottom > -320) tryLoad()
    })

    return () => {
      cancelled = true
      obs.disconnect()
    }
  }, [hasMore, initialLoading, resultsVersion, sentinelRef])
}
