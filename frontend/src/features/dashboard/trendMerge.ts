import type { AnnotatedTrendPoint, FinanceTrendRow } from './dashboardTypes'

export function annotateFinanceTrend(year: number, rows: FinanceTrendRow[]): AnnotatedTrendPoint[] {
  return rows.map((r, i) => ({
    ...r,
    year,
    monthIndex: i + 1,
    key: `${year}-${i + 1}`,
  }))
}

export function mergeFinanceTrends(parts: AnnotatedTrendPoint[][]): AnnotatedTrendPoint[] {
  const flat = parts.flat()
  return flat.sort((a, b) => (a.year - b.year) * 400 + (a.monthIndex - b.monthIndex))
}
