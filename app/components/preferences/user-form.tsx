import { Button } from '@shadcn/ui/button'
import { CardContent, CardFooter } from '@shadcn/ui/card'
import { Form } from '@/components/form'
import {
  formValuesToUserData,
  UserFormData,
  userFormSchema,
  UserFormValue,
} from '@/resources/queries/users'
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
      // Ensure email is non-undefined string to satisfy UserFormData type
      if (userData.email === undefined) {
        throw new Error('Email is required')
      }

      // Ensure required fields are present and conform to UserFormData types
      const {
        first_name = '',
        last_name = '',
        avatar_url,
        avatar_asset_id,
        provider,
        verified,
        theme_preference,
        email,
      } = userData

      await onSubmit({
        email,
        first_name,
        last_name,
        avatar_url,
        avatar_asset_id,
        provider,
        verified,
        theme_preference,
      })
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
