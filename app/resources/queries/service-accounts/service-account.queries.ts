import { fetchApi } from '@/libraries/fetch'
import { ServiceAccountType, ServiceAccountFormData } from './service-account.type'
import { IPaging } from '@/resources/types'
import { ApiKeyFormData, ApiKeyType } from '../api-keys'
import { IQueryConfig, IQueryParams } from '..'

/**
 * List all service accounts with pagination.
 */
export async function fetchServiceAccounts(config: IQueryConfig, params: IQueryParams) {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const url = new URL(`${apiUrl}/service-accounts`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('size', String(size))

  const response = await fetchApi(url.toString(), token, nodeEnv, {
    method: 'GET',
  })

  return response as IPaging<ServiceAccountType>
}

/**
 * Get a service account by ID.
 */
export async function fetchServiceAccountDetail(config: IQueryConfig, serviceAccountId: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/service-accounts/${serviceAccountId}`, token, nodeEnv)

  return response as ServiceAccountType
}

/**
 * Create a new service account.
 */
export async function createServiceAccount(config: IQueryConfig, data: ServiceAccountFormData) {
  const { apiUrl, token, nodeEnv } = config

  const payload = {
    email: data.email,
    username: data.username,
    avatar_url: data.avatar_url,
    avatar_asset_id: data.avatar_asset_id,
    first_name: data.first_name,
    last_name: data.last_name,
    provider: data.provider,
    verified: data.verified ?? false,
    theme_preference: data.theme_preference || 'system',
    external_id: data.external_id,
    service_account: data.service_account ?? true,
  }

  const response = await fetchApi(`${apiUrl}/service-accounts`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response as ServiceAccountType
}

/**
 * Update a service account.
 */
export async function updateServiceAccount(
  config: IQueryConfig,
  serviceAccountId: string,
  updateData: Partial<ServiceAccountFormData>
) {
  const { apiUrl, token, nodeEnv } = config

  const payload: Partial<ServiceAccountFormData> = {}

  if (updateData.email !== undefined) payload.email = updateData.email
  if (updateData.username !== undefined) payload.username = updateData.username
  if (updateData.avatar_url !== undefined) payload.avatar_url = updateData.avatar_url
  if (updateData.avatar_asset_id !== undefined) payload.avatar_asset_id = updateData.avatar_asset_id
  if (updateData.first_name !== undefined) payload.first_name = updateData.first_name
  if (updateData.last_name !== undefined) payload.last_name = updateData.last_name
  if (updateData.provider !== undefined) payload.provider = updateData.provider
  if (updateData.verified !== undefined) payload.verified = updateData.verified
  if (updateData.theme_preference !== undefined)
    payload.theme_preference = updateData.theme_preference
  if (updateData.external_id !== undefined) payload.external_id = updateData.external_id
  if (updateData.service_account !== undefined) payload.service_account = updateData.service_account

  const response = await fetchApi(
    `${apiUrl}/service-accounts/${serviceAccountId}`,
    token,
    nodeEnv,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  )

  return response as ServiceAccountType
}

/**
 * Delete a service account.
 */
export async function deleteServiceAccount(config: IQueryConfig, serviceAccountId: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(
    `${apiUrl}/service-accounts/${serviceAccountId}`,
    token,
    nodeEnv,
    {
      method: 'DELETE',
    }
  )

  return response
}

/**
 * SERVICE ACCOUNTS API KEYS
 */

/**
 * Get service account api-keys
 */
export async function fetchServiceAccountApiKeys(serviceAccountId: string, config: IQueryConfig) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(
    `${apiUrl}/service-accounts/${serviceAccountId}/api-keys`,
    token,
    nodeEnv
  )

  return response as IPaging<ApiKeyType>
}

/**
 * Create service account api-keys
 */
export async function createServiceAccountApiKey(
  config: IQueryConfig,
  serviceAccountId: string,
  data: ApiKeyFormData
) {
  const { apiUrl, token, nodeEnv } = config

  // Convert expires_at to end of day (23:59:59.999Z) or null for no expiration
  const expiresAtEndOfDay =
    data.expires_at && data.expires_at !== ''
      ? (() => {
          const expiresAtDate = new Date(data.expires_at)
          return new Date(
            Date.UTC(
              expiresAtDate.getFullYear(),
              expiresAtDate.getMonth(),
              expiresAtDate.getDate(),
              23,
              59,
              59,
              999
            )
          ).toISOString()
        })()
      : null

  const payload = {
    name: data.name,
    expires_at: expiresAtEndOfDay,
  }

  const response = await fetchApi(
    `${apiUrl}/service-accounts/${serviceAccountId}/api-keys`,
    token,
    nodeEnv,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )

  return response as ApiKeyType
}
