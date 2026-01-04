export interface IApiKey {
  name: string
  expires_at: string
  id: string
  key_id: string
  created_at: string
  last_used_at: string
  revoked: boolean
  full_key?: string
}
