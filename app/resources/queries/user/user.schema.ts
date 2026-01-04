import { z } from 'zod/v4'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Base user schema with common fields
 */
const baseUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  username: z.string().optional(),
  avatar_url: z.string().optional(),
  avatar_asset_id: z.string().optional(),
  provider: z.string(),
  confirmed_at: z.string(),
  verified: z.boolean(),
  verified_at: z.string(),
  theme_preference: z.enum(['light', 'dark', 'system']),
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

/**
 * Create user schema
 */
export const userCreateSchema = baseUserSchema

/**
 * Update user schema (all fields optional)
 */
export const userUpdateSchema = baseUserSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

export const userFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .email('Invalid email address')
    .or(z.literal(''))
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
  provider: z.string(),
  confirmed_at: z.string(),
  verified: z.boolean(),
  verified_at: z.string(),
  theme_preference: z.enum(['light', 'dark', 'system']),
})

export type UserFormValue = z.infer<typeof userFormSchema>

/**
 * Default form values for user form
 */
export const defaultUserFormValues: UserFormValue = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  avatar_url: '',
  avatar_asset_id: '',
  provider: '',
  confirmed_at: '',
  verified: true,
  verified_at: '',
  theme_preference: 'light',
}
