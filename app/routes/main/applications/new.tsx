/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationForm } from '@/components/crud-form/application-form'
import { useApp } from 'tessera-ui'
import { useCreateApplication } from '@/resources/hooks/applications'
import { ApplicationFormData, ApplicationType } from '@/resources/queries/applications'
import { defaultApplicationFormValues } from '@/resources/queries/applications/application.schema'
import { useLoaderData, useNavigate } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const vaultaApiUrl = process.env.VAULTA_API_URL

  return { apiUrl, nodeEnv, vaultaApiUrl }
}

export default function ApplicationNew() {
  const { apiUrl, nodeEnv, vaultaApiUrl } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const { mutateAsync: createApplication } = useCreateApplication(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv as any },
    {
      onSuccess: (data: ApplicationType) => {
        navigate(`/applications/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: ApplicationFormData): Promise<void> => {
    await createApplication(data)
  }

  return (
    <ApplicationForm
      onSubmit={handleSubmit}
      defaultValues={defaultApplicationFormValues}
      token={token || ''}
      vaultaApiUrl={vaultaApiUrl!}
    />
  )
}
