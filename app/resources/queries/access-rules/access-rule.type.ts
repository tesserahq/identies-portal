/**
 * AccessRule Type
 */
export type AccessRuleType = {
  kind: string
  value: string
  note: string
  id: string
  created_at: string
  updated_at: string
}

/**
 * AccessRule form data for API requests
 */
export type AccessRuleFormData = Pick<AccessRuleType, 'kind' | 'value'> &
  Partial<Pick<AccessRuleType, 'note'>>
