/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import { ApiKeyForm } from '@/components/crud-form/api-key-form'
import { useApp } from 'tessera-ui'
import { useApiKey, useUpdateApiKey } from '@/resources/hooks/api-keys'
import { ApiKeyFormData, ApiKeyType, apiKeyToFormValues } from '@/resources/queries/api-keys'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import EmptyContent from '@/components/empty-content/empty-content'
import { Button } from '@/modules/shadcn/ui/button'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function UserApiKeyEdit() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const params = useParams()

  // Fetch API key detail
  const {
    data: apiKey,
    isLoading,
    error,
  } = useApiKey(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    params.apiKeyId!,
    {
      enabled: !!token && !!params.apiKeyId,
    }
  )

  // API key update mutation
  const { mutateAsync: updateApiKey } = useUpdateApiKey(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    params.apiKeyId!,
    {
      onSuccess: (data: ApiKeyType) => {
        navigate(`/users/${params.id}/api-keys/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: ApiKeyFormData): Promise<void> => {
    await updateApiKey(data)
  }

  if (isLoading) {
    return <AppPreloader />
  }

  if (error || !apiKey) {
    return (
      <EmptyContent
        title="Error Fetching API Key Detail"
        image="/images/empty-api-keys.png"
        description={error?.message}>
        <Button onClick={() => navigate(`/users/${params.id}/api-keys`)}>Back to API Keys</Button>
      </EmptyContent>
    )
  }

  return (
    <ApiKeyForm onSubmit={handleSubmit} defaultValues={apiKeyToFormValues(apiKey)} isEdit={true} />
  )
}
