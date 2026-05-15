import { Button } from '@shadcn/ui/button'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Form } from '../form'
import { FormLayout } from '../form/form-layout'
import { ClientFormData, clientFormSchema, ClientFormValue } from '@/resources/queries/clients'

interface Props {
  defaultValues: ClientFormValue
  onSubmit: (data: ClientFormData) => Promise<void> | void
  submitLabel?: string
  isEdit?: boolean
  onCancel?: () => void
}

export const ClientForm = ({ defaultValues, onSubmit, submitLabel = 'Save', onCancel }: Props) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Handle form submission
  const handleSubmit = async (data: ClientFormValue) => {
    setIsSubmitting(true)

    try {
      const body = {
        name: data.name,
      }
      await onSubmit(body)
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate('/accounts/api-keys')
    }
  }

  return (
    <Form schema={clientFormSchema} defaultValues={defaultValues} onSubmit={handleSubmit}>
      <FormLayout title={'New Client'}>
        <Form.Input field="name" label="Name" placeholder="Enter Client name" required autoFocus />

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={handleCancel}>
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
