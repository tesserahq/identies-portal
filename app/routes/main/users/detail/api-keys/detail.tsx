/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from 'tessera-ui'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader'
import { type RevokeConfirmationHandle } from '@/components/revoke-confirmation/revoke-confirmation'
import { useApp } from '@/context/AppContext'
import { useApiKey, useDeleteApiKey, useRevokeApiKey } from '@/resources/hooks/api-keys'
import type { ApiKeyType } from '@/resources/queries/api-keys'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { EllipsisVertical, Pencil, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'

export function loader() {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv }
}

export default function UserApiKeyDetail() {
  const { identiesApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const revokeConfirmationRef = useRef<RevokeConfirmationHandle>(null)
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [apiKeyRevoke, setApiKeyRevoke] = useState<ApiKeyType>()
  const [apiKeyDelete, setApiKeyDelete] = useState<ApiKeyType>()

  // React Query hooks
  const {
    data: apiKey,
    isLoading,
    error,
  } = useApiKey(
    {
      apiUrl: identiesApiUrl!,
      token: token || '',
      nodeEnv: nodeEnv as any,
    },
    params.apiKeyId!,
    {
      enabled: !!token && !!params.apiKeyId,
    }
  )

  const revokeApiKeyMutation = useRevokeApiKey(
    {
      apiUrl: identiesApiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    {
      onSuccess: () => {
        setApiKeyRevoke(undefined)
        revokeConfirmationRef.current?.close()
      },
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
        navigate(`/users/${params.id}/api-keys`)
      },
    }
  )

  // Update RevokeConfirmation loading state
  useEffect(() => {
    if (apiKeyRevoke && revokeConfirmationRef.current) {
      revokeConfirmationRef.current.updateConfig({
        isLoading: revokeApiKeyMutation.isPending,
      })
    }
  }, [revokeApiKeyMutation.isPending, apiKeyRevoke])

  // Update DeleteConfirmation loading state
  useEffect(() => {
    if (apiKeyDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteApiKeyMutation.isPending,
      })
    }
  }, [deleteApiKeyMutation.isPending, apiKeyDelete])

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  const openApiKeyRevoke = (revokeThisApiKey: ApiKeyType): void => {
    setApiKeyRevoke(revokeThisApiKey)
    revokeConfirmationRef.current?.open({
      title: 'Revoke API Key?',
      description: `Are you sure you want to revoke "${revokeThisApiKey.name}"? This action cannot be undone.`,
      onRevoke: () => {
        revokeConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        revokeApiKeyMutation.mutate(revokeThisApiKey.id)
      },
    })
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

  if (error) {
    return (
      <EmptyContent
        title="Error Fetching API Key Detail"
        image="/images/empty-api-keys.png"
        description={error.message}>
        <Button onClick={() => navigate(`/users/${params.id}/api-keys`)}>Back to API Keys</Button>
      </EmptyContent>
    )
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
                    onClick={() => navigate(`/users/${params.id}/api-keys/${apiKey?.id}/edit`)}>
                    <Pencil />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start"
                    disabled={
                      !!apiKey?.revoked || !!apiKey?.expires_at || revokeApiKeyMutation.isPending
                    }
                    onClick={() => apiKey && openApiKeyRevoke(apiKey)}>
                    <ShieldX />
                    <span>
                      {revokeApiKeyMutation.isPending
                        ? 'Revoking...'
                        : apiKey?.revoked
                          ? 'Revoked'
                          : 'Revoke'}
                    </span>
                  </Button>
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
                {apiKey?.expires_at ? <DateTime date={apiKey?.expires_at} /> : 'No expiration'}
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Last Used At</dt>
              <dd className="d-content">
                {apiKey?.last_used_at ? <DateTime date={apiKey?.last_used_at} /> : 'Never'}
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Created At</dt>
              <dd className="d-content">
                {apiKey?.created_at && <DateTime date={apiKey?.created_at} />}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
