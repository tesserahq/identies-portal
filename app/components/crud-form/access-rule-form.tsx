import { Button } from '@shadcn/ui/button'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Form } from '../form'
import { FormLayout } from '../form/form-layout'
import {
  AccessRuleFormData,
  AccessRuleFormValue,
  AccessRuleKindTypes,
  accessRuleSchema,
  formValuesToAccessRuleData,
} from '@/resources/queries/access-rules'
import { useFormContext } from '../form/form-context'

interface CustomKindSelectProps {
  accessRuleKinds: AccessRuleKindTypes[]
}

const KIND_VALUE_CONFIG: Record<
  AccessRuleKindTypes['id'],
  { type: 'email' | 'text'; placeholder: string }
> = {
  email: { type: 'email', placeholder: 'name@example.com' },
  domain: { type: 'text', placeholder: 'example.com' },
}

const DEFAULT_VALUE_CONFIG = { type: 'text' as const, placeholder: 'Enter value' }

const CustomKindSelect = ({ accessRuleKinds }: CustomKindSelectProps) => {
  const { form } = useFormContext()
  const kind = form.watch('kind') as AccessRuleKindTypes['id'] | undefined
  const valueConfig =
    kind && kind in KIND_VALUE_CONFIG ? KIND_VALUE_CONFIG[kind] : DEFAULT_VALUE_CONFIG

  return (
    <>
      <Form.Select
        field="kind"
        label="Kind"
        placeholder="Select kind of access"
        required
        options={accessRuleKinds.map((k) => ({ label: k.name, value: k.id }))}
      />
      <Form.Input
        field="value"
        label="Value"
        type={valueConfig.type}
        placeholder={valueConfig.placeholder}
        required
      />
    </>
  )
}
interface AccessRuleFormProps {
  defaultValues: AccessRuleFormValue
  onSubmit: (data: AccessRuleFormData) => Promise<void> | void
  submitLabel?: string
  isEdit?: boolean
  accessRuleKinds: AccessRuleKindTypes[]
}

export const AccessRuleForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  isEdit = false,
  accessRuleKinds,
}: AccessRuleFormProps) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const title = isEdit ? 'Edit Access Rule' : 'New Access Rule'

  const handleSubmit = async (rawData: AccessRuleFormValue) => {
    setIsSubmitting(true)

    try {
      const data = formValuesToAccessRuleData(rawData)
      await onSubmit(data)
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form
      schema={accessRuleSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      reValidateMode="onBlur">
      <FormLayout title={title}>
        <CustomKindSelect accessRuleKinds={accessRuleKinds} />
        <Form.Textarea field="note" label="Notes" placeholder="Add note here" rows={2} />

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/access-rules')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </FormLayout>
    </Form>
  )
}
