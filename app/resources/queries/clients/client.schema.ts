import { z } from 'zod/v4'

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required and must be at least 1 character.' })
    .max(100, { message: 'Name must be at most 100 characters.' }),
})

export type ClientFormValue = z.infer<typeof clientFormSchema>

/**
 * Default form values for client form
 */
export const defaultClientFormValues: ClientFormValue = {
  name: '',
}
