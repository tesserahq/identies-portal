import { fetchApi } from '@/libraries/fetch'
import { UserFormData, UserType } from './user.type'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import { ApiKeyFormData, ApiKeyType } from '../api-keys'

/**
 * List all users with pagination.
 */
export async function fetchUsers(config: IQueryConfig, params: IQueryParams) {
  const { apiUrl, token, nodeEnv } = config
  const { page, size, q } = params

  const response = await fetchApi(`${apiUrl}/users`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
    params: { q },
  })

  return response as IPaging<UserType>
}

/**
 * Get a single user by ID
 */
export async function getUser(config: IQueryConfig, id: string): Promise<UserType> {
  const { apiUrl, token, nodeEnv } = config

  const user = await fetchApi(`${apiUrl}/users/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return user as UserType
}

/**
 * Get a me.
 */
export async function fetchMe(config: IQueryConfig) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/me`, token, nodeEnv)

  return response as UserType
}

/**
 * Update me
 */
export async function updateMe(config: IQueryConfig, updateData: Partial<UserFormData>) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/me`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  })

  return response
}

/**
 * USERS API KEYS
 */

/**
 * Get user api-keys
 */
export async function fetchUserApiKeys(userId: string, config: IQueryConfig, params: IQueryParams) {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const response = await fetchApi(`${apiUrl}/users/${userId}/api-keys`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return response as IPaging<ApiKeyType>
}

/**
 * Create user api-keys
 */
export async function createUserApiKey(config: IQueryConfig, userId: string, data: ApiKeyFormData) {
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

  const response = await fetchApi(`${apiUrl}/users/${userId}/api-keys`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response as ApiKeyType
}
