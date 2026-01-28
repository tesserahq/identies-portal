import { fetchApi } from '@/libraries/fetch'
import { UserFormData, UserType } from './user.type'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'

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
