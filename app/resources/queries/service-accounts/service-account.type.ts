import { NodeENVType } from '@/libraries/fetch'

/**
 * Service Account Type
 */
export type ServiceAccountType = {
  id: string
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
  created_at: string
  updated_at: string
  external_id: string
  service_account: boolean
}

/**
 * Service Account query configuration
 * Required configuration for API queries (apiUrl, token, nodeEnv)
 */
export interface ServiceAccountQueryConfig {
  apiUrl: string
  token: string
  nodeEnv: NodeENVType
}

/**
 * Service Account query parameters for pagination
 */
export interface ServiceAccountQueryParams {
  page: number
  size: number
}

/**
 * Service Account form data for API requests
 */
export type ServiceAccountFormData = {
  email: string
  username?: string
  avatar_url?: string
  avatar_asset_id?: string
  first_name: string
  last_name: string
  provider?: string
  verified?: boolean
  theme_preference?: 'light' | 'dark' | 'system'
  external_id?: string
  service_account?: boolean
}
