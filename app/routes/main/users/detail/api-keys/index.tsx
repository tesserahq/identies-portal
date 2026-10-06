/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { Pagination } from '@/components/data-table/data-pagination'
import { AppPreloader } from '@/components/loader'
import CreateButton from '@/components/new-button/new-button'
import RevokeConfirmation, {
  type RevokeConfirmationHandle,
} from '@/components/revoke-confirmation/revoke-confirmation'
import { ResourceID, useApp } from 'tessera-ui'
import { useDeleteApiKey, useRevokeApiKey } from '@/resources/hooks/api-keys'
import { useUserApiKeys, usersQueryKeys } from '@/resources/hooks/users'
import type { ApiKeyType } from '@/resources/queries/api-keys'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Separator } from '@shadcn/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn/ui/tooltip'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { EllipsisVertical, Eye, Pencil, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from 'react-router'
import { DateTime } from 'tessera-ui'

export function loader({ request }: LoaderFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const pagination = ensureCanonicalPagination(request, { defaultSize: 25, defaultPage: 1 })

  if (pagination instanceof Response) {
    return pagination
  }

  return { identiesApiUrl, nodeEnv, pagination }
}

export default function UserApiKeys() {
  const { identiesApiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = params.userID as string

  const revokeConfirmationRef = useRef<RevokeConfirmationHandle>(null)
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [apiKeyRevoke, setApiKeyRevoke] = useState<ApiKeyType>()
  const [apiKeyDelete, setApiKeyDelete] = useState<ApiKeyType>()

  // React Query hooks
  const { data: apiKeysData, isLoading } = useUserApiKeys(
    {
      apiUrl: identiesApiUrl!,
      token: token || '',
      nodeEnv: nodeEnv as any,
    },
    userId,
    {
      page: pagination.page,
      size: pagination.size,
    },
    {
      enabled: !!token && !!userId,
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
        // Invalidate user API keys list
        queryClient.invalidateQueries({
          queryKey: usersQueryKeys.apiKeysList(userId),
        })
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
        // Invalidate user API keys list
        queryClient.invalidateQueries({
          queryKey: usersQueryKeys.apiKeysList(userId),
        })
      },
    }
  )

  const apiKeys = Array.isArray(apiKeysData?.items) ? apiKeysData?.items : []

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

  return (
    <div className="flex w-full flex-col items-center p-3 animate-slide-up">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">API Keys</h1>
        {apiKeys.length > 0 && (
          <CreateButton
            label="New API Key"
            onClick={() => navigate(`/users/${userId}/api-keys/new`)}
          />
        )}
      </div>
      {apiKeys.length === 0 ? (
        <EmptyContent
          image="/images/empty-api-keys.png"
          title="No API Keys found"
          description="Click the button below to start creating API Keys">
          <Button variant="black" onClick={() => navigate(`/users/${userId}/api-keys/new`)}>
            Start Creating
          </Button>
        </EmptyContent>
      ) : (
        <div className="space-y-3 w-full">
          {apiKeys.map((apiKey: ApiKeyType) => {
            const isRevoked = apiKey.revoked
            const isExpired = apiKey?.expires_at && new Date() > new Date(apiKey?.expires_at)

            return (
              <Card key={apiKey.id} className="mb-3 w-full shadow-card">
                <CardContent className="flex items-center gap-2 pt-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <div
                        className="mb-1 text-base font-medium text-foreground hover:text-primary
                          hover:underline cursor-pointer"
                        onClick={() => navigate(`/users/${userId}/api-keys/${apiKey.id}`)}>
                        {apiKey.name}
                      </div>
                      {isRevoked && (
                        <Badge
                          variant="outline"
                          className="border border-destructive text-destructive">
                          <span className="text-xs">Revoked</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {isExpired ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-xs font-semibold text-destructive">
                                Expired
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                              <span className="text-xs text-muted-foreground">
                                Expired at {format(apiKey?.expires_at + 'z', 'PPPpp')}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span>
                          {apiKey.expires_at ? (
                            <div>
                              Expired <DateTime date={apiKey.expires_at} tooltipSide="bottom" />
                            </div>
                          ) : (
                            'No expiration'
                          )}
                        </span>
                      )}
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <div>
                        Created <DateTime date={apiKey.created_at} tooltipSide="bottom" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ResourceID value={apiKey.id} />
                    <Popover>
                      <PopoverTrigger>
                        <Button variant="ghost" size="icon">
                          <EllipsisVertical />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" side="left" className="w-44 p-2">
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start"
                          onClick={() => navigate(`/users/${userId}/api-keys/${apiKey.id}`)}>
                          <Eye />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start"
                          onClick={() => navigate(`/users/${userId}/api-keys/${apiKey.id}/edit`)}>
                          <Pencil />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start"
                          disabled={isRevoked || isExpired || revokeApiKeyMutation.isPending}
                          onClick={() => openApiKeyRevoke(apiKey)}>
                          <ShieldX />
                          <span>
                            {revokeApiKeyMutation.isPending
                              ? 'Revoking...'
                              : isRevoked
                                ? 'Revoked'
                                : 'Revoke'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start hover:bg-destructive
                            hover:text-destructive-foreground"
                          onClick={() => openApiKeyDeletion(apiKey)}>
                          <Trash2 />
                          <span>Remove</span>
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Pagination
            meta={{
              page: apiKeysData?.page || 1,
              pages: apiKeysData?.pages || 1,
              size: apiKeysData?.size || 1,
              total: apiKeysData?.total || 1,
            }}
          />
        </div>
      )}

      <RevokeConfirmation ref={revokeConfirmationRef} />
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
