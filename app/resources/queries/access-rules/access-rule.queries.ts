import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import { AccessRuleFormData, AccessRuleKindTypes, AccessRuleType } from './access-rule.type'

/**
 * List all resource with pagination.
 */
export async function fetchAccessRules(config: IQueryConfig, params: IQueryParams) {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const response = await fetchApi(`${apiUrl}/access-rules/`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return response as IPaging<AccessRuleType>
}

/**
 * Get an resource by ID.
 */
export async function fetchAccessRuleDetail(config: IQueryConfig, accessRuleID: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/access-rules/${accessRuleID}`, token, nodeEnv)

  return response as AccessRuleType
}

/**
 * Create a new resource.
 */
export async function createAccessRule(config: IQueryConfig, data: AccessRuleFormData) {
  const { apiUrl, token, nodeEnv } = config

  const payload = {
    kind: data.kind,
    value: data.value,
    note: data.note,
  }

  const response = await fetchApi(`${apiUrl}/access-rules/`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response as AccessRuleType
}

/**
 * Update an resource.
 */
export async function updateAccessRule(
  config: IQueryConfig,
  accessRuleID: string,
  updateData: Partial<AccessRuleFormData>
) {
  const { apiUrl, token, nodeEnv } = config

  const payload: Partial<AccessRuleFormData> = {}

  if (updateData.kind !== undefined) payload.kind = updateData.kind
  if (updateData.value !== undefined) payload.value = updateData.value
  if (updateData.note !== undefined) payload.note = updateData.note

  const response = await fetchApi(`${apiUrl}/access-rules/${accessRuleID}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response as AccessRuleType
}

/**
 * Delete an resource.
 */
export async function deleteAccessRule(config: IQueryConfig, accessRuleID: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/access-rules/${accessRuleID}`, token, nodeEnv, {
    method: 'DELETE',
  })

  return response
}

/**
 * List all access rule types
 */
export async function fetchAccessRuleKindTypes(config: IQueryConfig, params: IQueryParams) {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const response = await fetchApi(`${apiUrl}/access-rules/types`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return response as IPaging<AccessRuleKindTypes>
}
