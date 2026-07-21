/**
 * AccessRule Type
 */
export type AccessRuleType = {
  kind: AccessRuleKindTypes['id']
  value: string
  note: string
  id: string
  created_at: string
  updated_at: string
}

/**
 * AccessRule Type
 */
export type AccessRuleKindTypes = {
  id: string
  name: string
}

/**
 * AccessRule form data for API requests
 */
export type AccessRuleFormData = Pick<AccessRuleType, 'kind' | 'value'> &
  Partial<Pick<AccessRuleType, 'note'>>
