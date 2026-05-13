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
}

/**
 * Client form data for API requests
 */
export type ClientFormData = Partial<Pick<ClientType, 'name'>>
