/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import { ServiceAccountForm } from '@/components/crud-form/service-account-form'
import { useApp } from '@/context/AppContext'
import { useServiceAccount, useUpdateServiceAccount } from '@/resources/hooks/service-accounts'
import {
  ServiceAccountFormData,
  ServiceAccountType,
  serviceAccountToFormValues,
} from '@/resources/queries/service-accounts'
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ServiceAccountEdit() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const { id: serviceAccountId } = useParams()

  // Fetch service account detail
  const { data: serviceAccount, isLoading } = useServiceAccount(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    serviceAccountId!,
    {
      enabled: !!token && !!serviceAccountId,
    }
  )

  // Service account update mutation
  const { mutateAsync: updateServiceAccount } = useUpdateServiceAccount(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    serviceAccountId!,
    {
      onSuccess: (data: ServiceAccountType) => {
        navigate(`/service-accounts/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: ServiceAccountFormData): Promise<void> => {
    await updateServiceAccount(data)
  }

  if (isLoading || !serviceAccount) {
    return <AppPreloader />
  }

  return (
    <ServiceAccountForm
      onSubmit={handleSubmit}
      defaultValues={serviceAccountToFormValues(serviceAccount)}
      isEdit={true}
    />
  )
}
