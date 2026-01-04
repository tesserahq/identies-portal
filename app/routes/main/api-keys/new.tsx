/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiKeyForm } from '@/components/crud-form/api-key-form'
import { useApp } from '@/context/AppContext'
import { useCreateApiKey } from '@/resources/hooks/api-keys'
import { ApiKeyFormData, ApiKeyType } from '@/resources/queries/api-keys'
import { defaultApiKeyFormValues } from '@/resources/queries/api-keys/api-key.schema'
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ApiKeyNew() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  // API key create mutation
  const { mutateAsync: createApiKey } = useCreateApiKey(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv as any },
    {
      onSuccess: (data: ApiKeyType) => {
        navigate(`/api-keys/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: ApiKeyFormData): Promise<void> => {
    await createApiKey(data)
  }

  return <ApiKeyForm onSubmit={handleSubmit} defaultValues={defaultApiKeyFormValues} />
}
