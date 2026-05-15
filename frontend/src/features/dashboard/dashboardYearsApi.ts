import { http } from '../../app/api/http'

/** Distinct expense years for the signed-in user (newest first). */
export async function fetchDashboardYears(): Promise<number[]> {
  const res = await http.get<number[]>('/v1/expanse/reports/dashboard/years/')
  const data = res.data
  if (!Array.isArray(data)) return []
  return data.map((y) => Number(y)).filter((y) => Number.isFinite(y))
}
