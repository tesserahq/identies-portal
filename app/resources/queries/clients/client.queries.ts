import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig } from '..'
import { ClientFormData, ClientType } from './client.type'

export enum ResourceClientUrlEnum {
  SERVICE_ACCOUNT = '/service_accounts',
  USER = '/users',
}

/**
 * List all clients.
 */
export async function fetchClients(
  config: IQueryConfig,
  resourceURL: ResourceClientUrlEnum,
  resourceID: string
): Promise<ClientType[]> {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}${resourceURL}/${resourceID}/clients`, token, nodeEnv, {
    method: 'GET',
  })

  return response as ClientType[]
}

/**
 * Get a single client by ID
 */
export async function fetchClient(config: IQueryConfig, id: string): Promise<ClientType> {
  const { apiUrl, token, nodeEnv } = config

  const client = await fetchApi(`${apiUrl}/clients/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return client as ClientType
}

/**
 * Create client
 */
export async function createClient(
  config: IQueryConfig,
  resourceURL: ResourceClientUrlEnum,
  resourceID: string,
  data: ClientFormData
): Promise<ClientType> {
  const { apiUrl, token, nodeEnv } = config

  const payload = {
    name: data.name,
  }

  const response = await fetchApi(`${apiUrl}${resourceURL}/${resourceID}/clients`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response as ClientType
}

/**
 * Revoke client by ID
 */
export async function updateClient(config: IQueryConfig, id: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/clients/${id}/revoke`, token, nodeEnv, {
    method: 'PUT',
  })

  return response
}

/**
 * Delete an resource.
 */
export async function deleteCliente(config: IQueryConfig, id: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/clients/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })

  return response
}
