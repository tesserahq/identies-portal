/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceAccountForm } from '@/components/crud-form/service-account-form'
import { useApp } from 'tessera-ui'
import { useCreateServiceAccount } from '@/resources/hooks/service-accounts'
import { ServiceAccountFormData, ServiceAccountType } from '@/resources/queries/service-accounts'
import { defaultServiceAccountFormValues } from '@/resources/queries/service-accounts/service-account.schema'
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ServiceAccountNew() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  // Service account create mutation
  const { mutateAsync: createServiceAccount } = useCreateServiceAccount(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv as any },
    {
      onSuccess: (data: ServiceAccountType) => {
        navigate(`/service-accounts/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: ServiceAccountFormData): Promise<void> => {
    await createServiceAccount(data)
  }

  return (
    <ServiceAccountForm onSubmit={handleSubmit} defaultValues={defaultServiceAccountFormValues} />
  )
}
