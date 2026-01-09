import { z } from 'zod'

const invalid_type_error = 'We expect a string here'
const required_error = 'API Key name cannot be blank'

export const apiKeysSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expires_at: z.string().optional(),
  revoked: z.boolean().optional(),
})

export type ApiKeysSchema = z.infer<typeof apiKeysSchema>
