import { fetchApi } from '@/libraries/fetch'
import { ApiKeyQueryParams, ApiKeyQueryConfig, ApiKeyType, ApiKeyFormData } from './api-key.type'
import { IPaging } from '@/resources/types'

/**
 * List all API keys with pagination.
 */
export async function fetchApiKeys(config: ApiKeyQueryConfig, params: ApiKeyQueryParams) {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const url = new URL(`${apiUrl}/api-keys`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('size', String(size))

  const response = await fetchApi(url.toString(), token, nodeEnv, {
    method: 'GET',
  })

  return response as IPaging<ApiKeyType>
}

/**
 * Get an API key by ID.
 */
export async function fetchApiKeyDetail(apiKeyId: string, config: ApiKeyQueryConfig) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/api-keys/${apiKeyId}`, token, nodeEnv)

  return response as ApiKeyType
}

/**
 * Create a new API key.
 */
export async function createApiKey(config: ApiKeyQueryConfig, data: ApiKeyFormData) {
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

  const response = await fetchApi(`${apiUrl}/api-keys`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response as ApiKeyType
}

/**
 * Update an API key.
 */
export async function updateApiKey(
  config: ApiKeyQueryConfig,
  apiKeyId: string,
  updateData: Partial<ApiKeyFormData>
) {
  const { apiUrl, token, nodeEnv } = config

  // Convert expires_at to end of day (23:59:59.999Z) or null for no expiration if provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    name: updateData.name,
  }

  if (updateData.expires_at !== undefined) {
    payload.expires_at =
      updateData.expires_at && updateData.expires_at !== ''
        ? (() => {
            const expiresAtDate = new Date(updateData.expires_at)
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
  }

  const response = await fetchApi(`${apiUrl}/api-keys/${apiKeyId}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response as ApiKeyType
}

/**
 * Delete an API key.
 */
export async function deleteApiKey(config: ApiKeyQueryConfig, apiKeyId: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/api-keys/${apiKeyId}`, token, nodeEnv, {
    method: 'DELETE',
  })

  return response
}
