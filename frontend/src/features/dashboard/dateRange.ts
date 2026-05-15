import type { CustomMonth, PeriodPreset } from './dashboardTypes'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfMonth(year: number, month1: number): Date {
  return new Date(year, month1 - 1, 1)
}

export function endOfMonth(year: number, month1: number): Date {
  return new Date(year, month1, 0)
}

export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, d.getDate())
}

export function monthName(month1: number): string {
  return MONTH_NAMES[month1 - 1] ?? 'January'
}

export function describeMonthRange(from: Date, to: Date): string {
  const a = from.getMonth() + 1
  const b = to.getMonth() + 1
  const yf = from.getFullYear()
  const yt = to.getFullYear()
  if (yf === yt && a === b) {
    const m = monthName(a)
    return `${m} 1 - ${m} ${to.getDate()}, ${yf}`
  }
  return `${monthName(a)} ${from.getDate()}, ${yf} - ${monthName(b)} ${to.getDate()}, ${yt}`
}

export function rangeForPreset(preset: PeriodPreset, now = new Date(), custom?: CustomMonth | null): { from: Date; to: Date } {
  const y = now.getFullYear()
  const m = now.getMonth() + 1

  if (preset === 'custom') {
    const c = custom ?? { year: y, month: m }
    return { from: startOfMonth(c.year, c.month), to: endOfMonth(c.year, c.month) }
  }

  if (preset === 'this_month') {
    return { from: startOfMonth(y, m), to: endOfMonth(y, m) }
  }
  if (preset === 'last_month') {
    const prev = addMonths(now, -1)
    const py = prev.getFullYear()
    const pm = prev.getMonth() + 1
    return { from: startOfMonth(py, pm), to: endOfMonth(py, pm) }
  }
  if (preset === 'last_3') {
    return { from: new Date(y, m - 1 - 2, 1), to: endOfMonth(y, m) }
  }
  if (preset === 'last_6') {
    return { from: new Date(y, m - 1 - 5, 1), to: endOfMonth(y, m) }
  }
  const _never: never = preset
  return _never
}

export function previousCalendarRange(from: Date, to: Date): { from: Date; to: Date } {
  const ms = to.getTime() - from.getTime()
  const prevTo = new Date(from)
  prevTo.setDate(prevTo.getDate() - 1)
  const prevFrom = new Date(prevTo.getTime() - ms)
  return { from: prevFrom, to: prevTo }
}

export function toMonthInputValue(c: CustomMonth): string {
  return `${String(c.year).padStart(4, '0')}-${String(c.month).padStart(2, '0')}`
}

export function parseMonthInputValue(s: string): CustomMonth | null {
  const m = /^(\d{4})-(\d{2})$/.exec(s.trim())
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null
  return { year, month }
}
