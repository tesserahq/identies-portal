import { Card, CardHeader, CardTitle } from '@shadcn/ui/card'
import { UserForm } from './user-form'
import { UserFormData, UserFormValue } from '@/resources/queries/user'

interface Props {
  defaultValues: UserFormValue
  onSubmit: (data: UserFormData) => void
}

export const ProfileInformation = ({ defaultValues, onSubmit }: Props) => {
  return (
    <Card className="m-5 mb-4 w-full border lg:max-w-5xl">
      <CardHeader className="border-b p-5 pl-12">
        <CardTitle className="text-base font-medium">Profile Information</CardTitle>
      </CardHeader>
      <UserForm defaultValues={defaultValues} onSubmit={onSubmit} />
    </Card>
  )
}
