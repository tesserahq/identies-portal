import { z } from 'zod'

const invalid_type_error = 'We expect a string here'
const required_error = 'This field cannot be empty'

export const userSchema = z.object({
  first_name: z
    .string({ invalid_type_error, required_error })
    .min(1, 'First name is required'),
  last_name: z
    .string({ invalid_type_error, required_error })
    .min(1, 'Last name is required'),
})

export type UserSchema = z.infer<typeof userSchema>
