/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import { ApplicationForm } from '@/components/crud-form/application-form'
import { useApp } from 'tessera-ui'
import { useApplication, useUpdateApplication } from '@/resources/hooks/applications'
import {
  ApplicationFormData,
  ApplicationType,
  applicationToFormValues,
} from '@/resources/queries/applications'
import { useLoaderData, useNavigate, useParams } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const vaultaApiUrl = process.env.VAULTA_API_URL

  return { apiUrl, nodeEnv, vaultaApiUrl }
}

export default function ApplicationEdit() {
  const { apiUrl, nodeEnv, vaultaApiUrl } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const params = useParams()

  const { data: application, isLoading } = useApplication(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    params.applicationID!,
    {
      enabled: !!token && !!params.applicationID,
    }
  )

  const { mutateAsync: updateApplication } = useUpdateApplication(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    params.applicationID!,
    {
      onSuccess: (data: ApplicationType) => {
        navigate(`/applications/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: ApplicationFormData): Promise<void> => {
    await updateApplication(data)
  }

  if (isLoading || !application) {
    return <AppPreloader />
  }

  return (
    <ApplicationForm
      onSubmit={handleSubmit}
      defaultValues={applicationToFormValues(application)}
      isEdit={true}
      token={token || ''}
      vaultaApiUrl={vaultaApiUrl || ''}
    />
  )
}
