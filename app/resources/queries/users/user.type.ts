/**
 * User Type
 */
export type UserType = {
  email?: string
  avatar_url?: string
  avatar_asset_id?: string
  first_name?: string
  last_name?: string
  provider?: string
  confirmed_at?: string
  verified?: boolean
  verified_at?: string
  theme_preference?: 'light' | 'dark' | 'system'
  id: string
  created_at?: string
  updated_at?: string
  external_id?: string
  service_account?: boolean
}

/**
 * User form data for API requests
 */
export type UserFormData = {
  email: string
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
