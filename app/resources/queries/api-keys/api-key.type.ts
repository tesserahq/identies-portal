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
  full_key?: string
}

/**
 * API Key form data for API requests
 */
export type ApiKeyFormData = {
  name: string
  expires_at?: string
}
