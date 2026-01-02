import { NodeENVType } from '@/libraries/fetch'

/**
 * User Type
 */
export type UserType = {
  email: string
  username: string
  avatar_url: string
  avatar_asset_id: string
  first_name: string
  last_name: string
  provider: string
  confirmed_at: string
  verified: boolean
  verified_at: string
  theme_preference: 'light' | 'dark' | 'system'
  id: string
  created_at: string
  updated_at: string
}

/**
 * User query configuration
 * Required configuration for API queries (apiUrl, token, nodeEnv)
 */
export interface UserQueryConfig {
  apiUrl: string
  token: string
  nodeEnv: NodeENVType
}

/**
 * User form data for API requests
 */
export type UserFormData = {
  email: string
  username?: string
  avatar_url?: string
  avatar_asset_id?: string
  first_name: string
  last_name: string
  provider?: string
  verified?: boolean
  theme_preference?: 'light' | 'dark' | 'system'
}

/**
 * Update user data (all fields optional)
 */
export type UpdateUserData = Partial<UserType>
