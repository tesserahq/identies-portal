import { z } from 'zod/v4'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Base API key schema with common fields
 */
const baseApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expires_at: z.string().optional(),
  user_id: z.string(),
  id: z.string(),
  key_id: z.string(),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
  revoked: z.boolean(),
})

/**
 * Create API key schema
 */
export const apiKeyCreateSchema = baseApiKeySchema.omit({
  id: true,
  key_id: true,
  created_at: true,
  last_used_at: true,
  revoked: true,
  user_id: true,
})

/**
 * Update API key schema (all fields optional)
 */
export const apiKeyUpdateSchema = baseApiKeySchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

export const apiKeyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expires_at: z.string().optional(),
})

export type ApiKeyFormValue = z.infer<typeof apiKeyFormSchema>

/**
 * Default form values for API key form
 */
export const defaultApiKeyFormValues: ApiKeyFormValue = {
  name: '',
  expires_at: '',
}
