/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiKeyPreview } from '@/components/api-key-preview/api-key-preview'
import { ApiKeyForm } from '@/components/crud-form/api-key-form'
import { useApp } from '@/context/AppContext'
import { useCreateApiKey } from '@/resources/hooks/api-keys'
import { useCreateServiceAccountApiKey } from '@/resources/hooks/service-accounts'
import { ApiKeyFormData, ApiKeyType } from '@/resources/queries/api-keys'
import { defaultApiKeyFormValues } from '@/resources/queries/api-keys/api-key.schema'
import { useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ApiKeyNew() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState<ApiKeyType>()

  // API key create mutation
  const { mutateAsync: createApiKey } = useCreateServiceAccountApiKey(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv as any },
    params.id as string,
    {
      onSuccess: setApiKey,
    }
  )

  const handleSubmit = async (data: ApiKeyFormData): Promise<void> => {
    await createApiKey(data)
  }

  const onCancel = () => navigate(-1)

  return apiKey ? (
    <ApiKeyPreview apiKey={apiKey} backTo={`/service-accounts/${params.id}/api-keys`} />
  ) : (
    <ApiKeyForm
      onSubmit={handleSubmit}
      defaultValues={defaultApiKeyFormValues}
      onCancel={onCancel}
    />
  )
}
