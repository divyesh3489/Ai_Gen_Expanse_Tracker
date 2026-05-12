export type Category = {
  id: number
  name: string
  type: 'expense' | 'income'
  /** Stored icon key: `pack:ExportName` or legacy export name (defaults to fa pack). */
  icon: string
  /** Effective tint including user preference when API provides it. */
  color?: string
  default_color?: string
  is_default?: boolean
}

/** Row from `GET /v1/expanse/user-category-preferences/` (merged defaults + user overrides). */
export type UserCategoryPreferenceRow = {
  id: number | null
  category: number
  category_name: string
  custom_color: string
  default_color: string
  icon: string
}

/** Body/response fields for POST/PUT `user-category-preferences` (serializer omits default_color/icon). */
export type UserCategoryPreferenceWritePayload = {
  category: number
  custom_color: string
}

export type UserCategoryPreferenceWriteResponse = {
  id: number
  category: number
  category_name: string
  custom_color: string
}
