import { Button } from '@shadcn/ui/button'
import {
  ServiceAccountFormData,
  ServiceAccountFormValue,
  formValuesToServiceAccountData,
} from '@/resources/queries/service-accounts'
import { serviceAccountFormSchema } from '@/resources/queries/service-accounts/service-account.schema'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Form } from '../form'
import { FormLayout } from '../form/form-layout'

interface ServiceAccountFormProps {
  defaultValues: ServiceAccountFormValue
  onSubmit: (data: ServiceAccountFormData) => Promise<void> | void
  submitLabel?: string
  isEdit?: boolean
}

export const ServiceAccountForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  isEdit = false,
}: ServiceAccountFormProps) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const title = isEdit ? 'Edit Service Account' : 'New Service Account'

  // Handle form submission
  const handleSubmit = async (data: ServiceAccountFormValue) => {
    setIsSubmitting(true)

    try {
      const serviceAccountData = formValuesToServiceAccountData(data)
      await onSubmit(serviceAccountData)
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form schema={serviceAccountFormSchema} defaultValues={defaultValues} onSubmit={handleSubmit}>
      <FormLayout title={title}>
        <Form.Email
          autoFocus
          field="email"
          label="Email"
          placeholder="Enter email address"
          required
        />

        <Form.Input field="first_name" label="First Name" placeholder="Enter first name" required />

        <Form.Input field="last_name" label="Last Name" placeholder="Enter last name" required />

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/service-accounts')}>
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
