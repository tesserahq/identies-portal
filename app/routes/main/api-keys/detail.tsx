/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { fetchApi } from '@/libraries/fetch'
import { handleFetcherData } from '@/utils/helpers/fetcher.helper'
import { ActionFunctionArgs } from 'react-router'
import { useLoaderData, useNavigate, useParams, useFetcher } from 'react-router'
import { format } from 'date-fns'
import { EllipsisVertical, Pencil, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useApiKeyDetail, useDeleteApiKey, apiKeyQueryKeys } from '@/resources/hooks/api-keys'
import type { ApiKeyType } from '@/resources/queries/api-keys'
import { useQueryClient } from '@tanstack/react-query'

export function loader() {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv }
}

export default function APIKeysIndex() {
  const { identiesApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const revokeFetcher = useFetcher()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [apiKeyDelete, setApiKeyDelete] = useState<ApiKeyType>()

  // React Query hooks
  const { data: apiKey, isLoading } = useApiKeyDetail(
    {
      apiUrl: identiesApiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    params.id!,
    {
      enabled: !!token && !!params.id,
    }
  )

  const deleteApiKeyMutation = useDeleteApiKey(
    {
      apiUrl: identiesApiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    {
      onSuccess: () => {
        setApiKeyDelete(undefined)
        deleteConfirmationRef.current?.close()
        navigate('/api-keys')
      },
    }
  )

  useEffect(() => {
    if (revokeFetcher.data) {
      handleFetcherData(revokeFetcher.data, () => {
        // Invalidate API keys detail and lists to refetch after revoke
        if (params.id) {
          queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.detail(params.id) })
        }
        queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() })
      })
    }
  }, [revokeFetcher.data, queryClient, params.id])

  // Update DeleteConfirmation loading state
  useEffect(() => {
    if (apiKeyDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteApiKeyMutation.isPending,
      })
    }
  }, [deleteApiKeyMutation.isPending, apiKeyDelete])

  if (isLoading) {
    return <AppPreloader />
  }

  const openApiKeyDeletion = (deleteThisApiKey: ApiKeyType): void => {
    setApiKeyDelete(deleteThisApiKey)
    deleteConfirmationRef.current?.open({
      title: 'Delete API Key?',
      description: `You'll permanently lose your API Key "${deleteThisApiKey.name}"`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteApiKeyMutation.mutate(deleteThisApiKey.id)
      },
    })
  }

  return (
    <div className="flex flex-col items-center">
      <Card className="m-5 w-full border lg:max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{apiKey?.name}</h1>
              {apiKey?.revoked && <Badge variant="destructive">Revoked</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger>
                  <Button variant="ghost" size="icon">
                    <EllipsisVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="left" align="start" className="w-44 p-2">
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start"
                    onClick={() => navigate(`/api-keys/${apiKey?.id}/edit`)}>
                    <Pencil />
                    <span>Edit</span>
                  </Button>
                  <revokeFetcher.Form method="PUT">
                    <input name="token" value={token!} type="hidden" />
                    <input name="id" value={apiKey?.id} type="hidden" />
                    <Button
                      variant="ghost"
                      className="flex w-full justify-start"
                      disabled={apiKey?.revoked || revokeFetcher.state === 'submitting'}>
                      <ShieldX />
                      <span>{apiKey?.revoked ? 'Revoked' : 'Revoke'}</span>
                    </Button>
                  </revokeFetcher.Form>
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start hover:bg-destructive hover:text-white"
                    onClick={() => apiKey && openApiKeyDeletion(apiKey)}>
                    <Trash2 />
                    <span>Remove</span>
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="d-list">
            <div className="d-item">
              <dt className="d-label">Expires At</dt>
              <dd className="d-content">
                {apiKey?.expires_at ? format(apiKey?.expires_at + 'z', 'PPPpp') : 'No expiration'}
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Last Used At</dt>
              <dd className="d-content">
                {apiKey?.last_used_at ? format(apiKey?.last_used_at + 'z', 'PPPpp') : 'Never'}
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Created At</dt>
              <dd className="d-content">
                {apiKey?.created_at && format(apiKey?.created_at + 'z', 'PPPpp')}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { id, token } = Object.fromEntries(formData)

  try {
    // Handle revoke (PUT request)
    if (request.method === 'PUT') {
      await fetchApi(`${identiesApiUrl}/api-keys/${id}/revoke`, token.toString(), nodeEnv, {
        method: 'PUT',
      })

      return {
        success: true,
        toast: {
          type: 'success',
          description: 'API key revoked successfully',
        },
      }
    }

    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'Bad Request',
          description: 'Invalid method or form submission',
        },
      },
      { status: 400 }
    )
  } catch (error: any) {
    let parsedError
    try {
      parsedError = JSON.parse(error.message)
    } catch {
      parsedError = { status: 500, error: error.message }
    }

    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'Error',
          description:
            parsedError.status === 500
              ? 'Oops it seems we are having troubles. Please try again later'
              : parsedError.error,
        },
      },
      { status: parsedError.status || 500 }
    )
  }
}
