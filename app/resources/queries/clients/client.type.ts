/**
 * Client Type
 */
export type ClientType = {
  name: string
  owner_id: string
  created_by_id: string
  id: string
  client_id: string
  revoked: boolean
  created_at: string
  client_secret?: string
}

/**
 * Client form data for API requests
 */
export type ClientFormData = Pick<ClientType, 'name'>
