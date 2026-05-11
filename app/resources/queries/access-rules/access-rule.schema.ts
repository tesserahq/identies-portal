import { z } from 'zod/v4'
import { AccessRuleType } from './access-rule.type'

export const accessRuleSchema = z.object({
  kind: z.string().min(1, 'Kind is required'),
  value: z.string().min(1, 'Value is required'),
  note: z.string().optional(),
})

export type AccessRuleFormValue = z.infer<typeof accessRuleSchema>

/**
 * Convert AccessRule API data to form values
 */
export function accessRuleToFormValues(data: AccessRuleType): AccessRuleFormValue {
  return {
    kind: data.kind || '',
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
  kind: '',
  value: '',
  note: '',
}
