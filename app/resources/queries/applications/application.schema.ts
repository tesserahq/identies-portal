import { z } from 'zod/v4'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Base application schema with common fields
 */
const baseApplicationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
  logo: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

/**
 * Create application schema
 */
export const applicationCreateSchema = baseApplicationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

/**
 * Update application schema (all fields optional)
 */
export const applicationUpdateSchema = baseApplicationSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

export const applicationFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
  logo: z.string().optional(),
  description: z.string().optional(),
})

export type ApplicationFormValue = z.infer<typeof applicationFormSchema>

/**
 * Default form values for application form
 */
export const defaultApplicationFormValues: ApplicationFormValue = {
  name: '',
  url: '',
  logo: '',
  description: '',
}
