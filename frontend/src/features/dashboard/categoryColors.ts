/** Vibrant palette; falls back to HSL rotation for extra categories. */
const PALETTE = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A78BFA',
  '#60A5FA',
  '#F472B6',
  '#34D399',
  '#FB923C',
  '#818CF8',
  '#2DD4BF',
] as const

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}

/** Stable, high-contrast color per category (readable on dark backgrounds). */
export function colorForCategory(category: string, index: number): string {
  const seed = hashString(category)
  if (index < PALETTE.length) return PALETTE[(seed + index) % PALETTE.length]
  const h = (seed + index * 47) % 360
  return `hsl(${h}, 78%, 62%)`
}
