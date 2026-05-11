import { Button } from '@shadcn/ui/button'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Form } from '../form'
import { FormLayout } from '../form/form-layout'
import {
  AccessRuleFormData,
  AccessRuleFormValue,
  accessRuleSchema,
  formValuesToAccessRuleData,
} from '@/resources/queries/access-rules'

interface AccessRuleFormProps {
  defaultValues: AccessRuleFormValue
  onSubmit: (data: AccessRuleFormData) => Promise<void> | void
  submitLabel?: string
  isEdit?: boolean
}

export const AccessRuleForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  isEdit = false,
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
        <Form.Input
          autoFocus
          field="kind"
          label="Kind"
          placeholder="Enter kind of access"
          required
        />

        <Form.Input field="value" label="Value" placeholder="Enter value" required />

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
