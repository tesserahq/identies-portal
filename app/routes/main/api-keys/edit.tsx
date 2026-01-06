/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import { ApiKeyForm } from '@/components/crud-form/api-key-form'
import { useApp } from '@/context/AppContext'
import { useApiKeyDetail, useUpdateApiKey } from '@/resources/hooks/api-keys'
import { ApiKeyFormData, ApiKeyType, apiKeyToFormValues } from '@/resources/queries/api-keys'
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ApiKeyEdit() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const { id: apiKeyId } = useParams()

  // Fetch API key detail
  const { data: apiKey, isLoading } = useApiKeyDetail(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    apiKeyId!,
    {
      enabled: !!token && !!apiKeyId,
    }
  )

  // API key update mutation
  const { mutateAsync: updateApiKey } = useUpdateApiKey(
    {
      apiUrl: apiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    apiKeyId!,
    {
      onSuccess: (data: ApiKeyType) => {
        navigate(`/api-keys/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: ApiKeyFormData): Promise<void> => {
    await updateApiKey(data)
  }

  if (isLoading || !apiKey) {
    return <AppPreloader />
  }

  return (
    <ApiKeyForm onSubmit={handleSubmit} defaultValues={apiKeyToFormValues(apiKey)} isEdit={true} />
  )
}
