import { Button } from '@shadcn/ui/button'
import {
  ApiKeyFormData,
  ApiKeyFormValue,
  formValuesToApiKeyData,
} from '@/resources/queries/api-keys'
import { apiKeyFormSchema } from '@/resources/queries/api-keys/api-key.schema'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Form } from '../form'
import { FormLayout } from '../form/form-layout'
import { useFormContext } from '../form/form-context'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/modules/shadcn/ui/form'

interface ApiKeyFormProps {
  defaultValues: ApiKeyFormValue
  onSubmit: (data: ApiKeyFormData) => Promise<void> | void
  submitLabel?: string
  isEdit?: boolean
  onCancel?: () => void
}

// Expiration Select Component
const ExpirationSelect = () => {
  const { form } = useFormContext()
  const [expirationType, setExpirationType] = useState<string>('no-expiration')

  const calculateExpirationDate = (type: string): string => {
    const today = new Date()

    switch (type) {
      case '7days':
        return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30days':
        return new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      case '60days':
        return new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      case '90days':
        return new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
      case 'no-expiration':
        return ''
      default:
        return ''
    }
  }

  const handleExpirationTypeChange = (value: string) => {
    setExpirationType(value)
    const expiresAt = calculateExpirationDate(value)
    form.setValue('expires_at', expiresAt, { shouldValidate: true })
  }

  // Initialize expiration type based on default value
  useEffect(() => {
    const expiresAt = form.getValues('expires_at')
    if (!expiresAt || expiresAt === '') {
      setExpirationType('no-expiration')
    } else {
      // Try to determine which option matches the current date
      const expiresAtDate = new Date(expiresAt)
      const now = new Date()
      const diffDays = Math.ceil((expiresAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays > 0 && diffDays <= 7) setExpirationType('7days')
      else if (diffDays > 7 && diffDays <= 30) setExpirationType('30days')
      else if (diffDays > 30 && diffDays <= 60) setExpirationType('60days')
      else if (diffDays > 60 && diffDays <= 90) setExpirationType('90days')
      else setExpirationType('no-expiration')
    }
  }, [form])

  return (
    <FormField
      control={form.control}
      name="expires_at"
      render={() => (
        <FormItem>
          <FormLabel>Expires At</FormLabel>
          <FormControl>
            <Select value={expirationType} onValueChange={handleExpirationTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select expiration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">
                  7 days ({format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'PP')})
                </SelectItem>
                <SelectItem value="30days">
                  30 days ({format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'PP')})
                </SelectItem>
                <SelectItem value="60days">
                  60 days ({format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'PP')})
                </SelectItem>
                <SelectItem value="90days">
                  90 days ({format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'PP')})
                </SelectItem>
                <SelectItem value="no-expiration">No expiration</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Select when this API key should expire</FormDescription>
        </FormItem>
      )}
    />
  )
}

export const ApiKeyForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  isEdit = false,
  onCancel,
}: ApiKeyFormProps) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const title = isEdit ? 'Edit API Key' : 'New API Key'

  // Handle form submission
  const handleSubmit = async (data: ApiKeyFormValue) => {
    setIsSubmitting(true)

    try {
      const apiKeyData = formValuesToApiKeyData(data)
      await onSubmit(apiKeyData)
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
    <Form schema={apiKeyFormSchema} defaultValues={defaultValues} onSubmit={handleSubmit}>
      <FormLayout title={title}>
        <Form.Input field="name" label="Name" placeholder="Enter API key name" required autoFocus />

        <ExpirationSelect />

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
