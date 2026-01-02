import { fetchApi } from '@/libraries/fetch'
import { UserQueryConfig, UserFormData, UserType } from './user.type'

/**
 * Get a user by ID.
 */
export async function fetchUser(config: UserQueryConfig) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/user`, token, nodeEnv)

  return response as UserType
}

/**
 * Update a user by ID.
 */
export async function updateUser(config: UserQueryConfig, updateData: Partial<UserFormData>) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/user`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  })

  return response
}
