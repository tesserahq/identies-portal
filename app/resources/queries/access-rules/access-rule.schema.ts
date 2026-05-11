import { z } from 'zod/v4'

export const accessRuleSchema = z.object({
  kind: z.string().min(1, 'Kind is required'),
  value: z.string().min(1, 'Value is required'),
  note: z.string().optional(),
})

export type AccessRuleFormValue = z.infer<typeof accessRuleSchema>