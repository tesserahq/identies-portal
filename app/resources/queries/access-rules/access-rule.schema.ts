import { z } from 'zod/v4'
import { AccessRuleKindTypes, AccessRuleType } from './access-rule.type'

export const accessRuleSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal<AccessRuleKindTypes['id']>('email'),
    value: z.string().min(1, 'Value is required').email({ message: 'Invalid email address' }),
    note: z.string().optional(),
  }),
  z.object({
    kind: z.literal<AccessRuleKindTypes['id']>('domain'),
    value: z.string().min(1, 'Value is required').regex(z.regexes.domain, {
      message: 'Invalid domain name. Must include a valid domain extension',
    }),
    note: z.string().optional(),
  }),
])

export type AccessRuleFormValue = z.infer<typeof accessRuleSchema>

/**
 * Convert AccessRule API data to form values
 */
export function accessRuleToFormValues(data: AccessRuleType): AccessRuleFormValue {
  return {
    kind: (data.kind as AccessRuleKindTypes['id']) || 'email',
    value: data.value || '',
    note: data.note || '',
  }
}

/**
 * Convert form values to AccessRule API data
 */
export function formValuesToAccessRuleData(
  formValues: AccessRuleFormValue
): Omit<AccessRuleType, 'id' | 'created_at' | 'updated_at'> {
  return {
    kind: formValues.kind,
    value: formValues.value,
    note: formValues.note || '',
  }
}

/**
 * Default form values for AccessRule form
 */
export const defaultAccessRuleFormValues: AccessRuleFormValue = {
  kind: 'email',
  value: '',
  note: '',
}
