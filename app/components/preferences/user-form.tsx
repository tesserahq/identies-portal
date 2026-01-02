import { Button } from '@shadcn/ui/button'
import { CardContent, CardFooter } from '@shadcn/ui/card'
import { Form } from '@/components/form'
import {
  formValuesToUserData,
  UserFormData,
  userFormSchema,
  UserFormValue,
} from '@/resources/queries/user'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router'

interface UserFormProps {
  defaultValues: UserFormValue
  onSubmit: (data: UserFormData) => void
  submitLabel?: string
}

export const UserForm = ({ onSubmit, defaultValues, submitLabel = 'Save' }: UserFormProps) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (data: UserFormValue) => {
    setIsSubmitting(true)

    try {
      const userData = formValuesToUserData(data)
      await onSubmit(userData)
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Form
      schema={userFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      reValidateMode="onChange">
      <CardContent>
        <div className="w-full space-y-6 p-4 md:p-8">
          <Form.Input
            label="First Name"
            className="w-full"
            // onChange={(e) => onFieldChange('first_name')(e.target.value)}
            field="first_name"
            required
          />
          <Form.Input
            label="Last Name"
            field="last_name"
            className="w-full"
            // onChange={(e) => onFieldChange('last_name')(e.target.value)}
            required
          />
          <Form.Input
            label="Email"
            field="email"
            className="w-full"
            // defaultValue={user?.email}
            disabled
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t pr-12 pt-4">
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/contacts')}>
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
      </CardFooter>
    </Form>
  )
}
