import { NodeENVType } from '@/libraries/fetch'

/**
 * API Key Type
 */
export type ApiKeyType = {
  name: string
  expires_at: string
  user_id: string
  id: string
  key_id: string
  created_at: string
  last_used_at: string | null
  revoked: boolean
}

/**
 * API Key query configuration
 * Required configuration for API queries (apiUrl, token, nodeEnv)
 */
export interface ApiKeyQueryConfig {
  apiUrl: string
  token: string
  nodeEnv: NodeENVType
}

/**
 * API Key query parameters for pagination
 */
export interface ApiKeyQueryParams {
  page: number
  size: number
}

/**
 * API Key form data for API requests
 */
export type ApiKeyFormData = {
  name: string
  expires_at?: string
}
