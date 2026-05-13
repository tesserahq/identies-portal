// Query functions
export {
  fetchClient,
  fetchClients,
  createClient,
  deleteCliente,
  updateClient,
  ResourceClientUrlEnum,
} from './client.queries'

// Types
export type { ClientType, ClientFormData } from './client.type'

// Schemas
export { clientFormSchema, defaultClientFormValues, type ClientFormValue } from './client.schema'
