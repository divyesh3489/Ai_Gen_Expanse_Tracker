/** ISO date range for a calendar year (caps `to` at today for the current year). */
export function yearToISORange(year: number, now = new Date()): { from: string; to: string } {
  const from = `${year}-01-01`
  if (year < now.getFullYear()) {
    return { from, to: `${year}-12-31` }
  }
  if (year > now.getFullYear()) {
    return { from, to: from }
  }
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return { from, to: `${year}-${m}-${d}` }
}
