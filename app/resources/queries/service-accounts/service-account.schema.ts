import { z } from 'zod/v4'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Base service account schema with common fields
 */
const baseServiceAccountSchema = z.object({
  id: z.string(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  username: z.string(),
  avatar_url: z.string(),
  avatar_asset_id: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  provider: z.string(),
  confirmed_at: z.string(),
  verified: z.boolean(),
  verified_at: z.string(),
  theme_preference: z.enum(['light', 'dark', 'system']),
  created_at: z.string(),
  updated_at: z.string(),
  external_id: z.string(),
  service_account: z.boolean(),
})

/**
 * Create service account schema
 */
export const serviceAccountCreateSchema = baseServiceAccountSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  confirmed_at: true,
  verified_at: true,
})

/**
 * Update service account schema (all fields optional)
 */
export const serviceAccountUpdateSchema = baseServiceAccountSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

export const serviceAccountFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailPattern.test(val)
      },
      {
        message: 'Must have the @ sign and no spaces',
      }
    ),
  username: z.string().optional(),
  avatar_url: z.string().optional(),
  avatar_asset_id: z.string().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  provider: z.string().optional(),
  verified: z.boolean().optional(),
  theme_preference: z.enum(['light', 'dark', 'system']).optional(),
  external_id: z.string().optional(),
  service_account: z.boolean().optional(),
})

export type ServiceAccountFormValue = z.infer<typeof serviceAccountFormSchema>

/**
 * Default form values for service account form
 */
export const defaultServiceAccountFormValues: ServiceAccountFormValue = {
  email: '',
  username: '',
  avatar_url: '',
  avatar_asset_id: '',
  first_name: '',
  last_name: '',
  provider: '',
  verified: false,
  theme_preference: 'system',
  external_id: '',
  service_account: true,
}
