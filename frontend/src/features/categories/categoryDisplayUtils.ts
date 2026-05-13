type Row = {
  name?: string
  category_name?: string
  category?: number | null
}

export function preferenceKeyFromRow(row: Row, nameById: Map<number, string>): string | undefined {
  const n = row.category_name?.trim()
  if (n) return n
  if (typeof row.category === 'number') return nameById.get(row.category)
  return undefined
}

export function displayCategoryLabel(
  row: Row,
  nameById: Map<number, string>,
  whenNoCategory: string,
): string {
  return (
    row.name ??
    row.category_name ??
    (row.category != null ? nameById.get(row.category) ?? `#${row.category}` : whenNoCategory)
  )
}
