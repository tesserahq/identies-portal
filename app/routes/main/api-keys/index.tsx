/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import CreateButton from '@/components/new-button/new-button'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import Separator from '@shadcn/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { handleFetcherData } from '@/utils/helpers/fetcher.helper'
import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { Link, useFetcher, useLoaderData, useNavigate } from 'react-router'
import { format } from 'date-fns'
import { EllipsisVertical, Eye, Pencil, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { useApiKeys, useDeleteApiKey, apiKeyQueryKeys } from '@/resources/hooks/api-keys'
import { useQueryClient } from '@tanstack/react-query'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import type { ApiKeyType } from '@/resources/queries/api-keys'
import { Pagination } from '@/components/data-table/data-pagination'

export function loader({ request }: LoaderFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const pagination = ensureCanonicalPagination(request, { defaultSize: 100, defaultPage: 1 })

  if (pagination instanceof Response) {
    return pagination
  }

  return { identiesApiUrl, nodeEnv, pagination }
}

export default function APIKeys() {
  const { identiesApiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const revokeFetcher = useFetcher()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [apiKeyDelete, setApiKeyDelete] = useState<ApiKeyType>()

  // React Query hooks
  const { data: apiKeysData, isLoading } = useApiKeys(
    {
      apiUrl: identiesApiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    {
      page: pagination.page,
      size: pagination.size,
    },
    {
      enabled: !!token,
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
      },
    }
  )

  const apiKeys = apiKeysData?.items || []

  useEffect(() => {
    if (revokeFetcher.data) {
      handleFetcherData(revokeFetcher.data, () => {
        // Invalidate API keys list to refetch after revoke
        queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() })
      })
    }
  }, [revokeFetcher.data, queryClient])

  // Update DeleteConfirmation loading state
  useEffect(() => {
    if (apiKeyDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteApiKeyMutation.isPending,
      })
    }
  }, [deleteApiKeyMutation.isPending, apiKeyDelete])

  if (isLoading || !token) {
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
    <div className="flex w-full flex-col items-center">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">API Keys</h1>
        {apiKeys.length > 0 && <CreateButton label="New API Key" onClick={() => navigate('new')} />}
      </div>
      {apiKeys.length === 0 ? (
        <EmptyContent
          image="/images/empty-api-keys.png"
          title="No API Keys found"
          description="Click the button below to start creating API Keys">
          <Button variant="black" onClick={() => navigate('new')}>
            Start Now
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
                      <Link
                        to={apiKey.id}
                        className="mb-1 text-base font-medium text-black hover:text-primary
                          hover:underline dark:text-primary-foreground">
                        {apiKey.name}
                      </Link>
                      {apiKey?.revoked && (
                        <Badge
                          variant="outline"
                          className="border border-destructive text-destructive">
                          <span className="text-xs">Revoked</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      {isExpired ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-xs font-semibold text-destructive">
                                Expired
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <span className="text-xs text-muted-foreground">
                                Expired at {format(apiKey?.expires_at + 'z', 'PPPpp')}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span>
                          {apiKey.expires_at
                            ? `Expires At ${format(apiKey?.expires_at + 'z', 'PPP')}`
                            : 'No expiration'}
                        </span>
                      )}
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <span>Created {format(apiKey?.created_at + 'z', 'PPP')}</span>
                    </div>
                  </div>
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
                        onClick={() => navigate(`/api-keys/${apiKey.id}`)}>
                        <Eye />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => navigate(`/api-keys/${apiKey.id}/edit`)}>
                        <Pencil />
                        <span>Edit</span>
                      </Button>
                      <revokeFetcher.Form method="PUT">
                        <input name="token" value={token!} type="hidden" />
                        <input name="id" value={apiKey.id} type="hidden" />
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start"
                          disabled={isRevoked || isExpired || revokeFetcher.state === 'submitting'}>
                          <ShieldX />
                          <span>
                            {revokeFetcher.state === 'submitting'
                              ? 'Revoking...'
                              : isRevoked
                                ? 'Revoked'
                                : 'Revoke'}
                          </span>
                        </Button>
                      </revokeFetcher.Form>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start hover:bg-destructive hover:text-white"
                        onClick={() => openApiKeyDeletion(apiKey)}>
                        <Trash2 />
                        <span>Remove</span>
                      </Button>
                    </PopoverContent>
                  </Popover>
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

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { id, token, form_method } = Object.fromEntries(formData)

  try {
    switch (form_method) {
      case 'delete_api_key': {
        await fetchApi(`${identiesApiUrl}/api-keys/${id}`, token.toString(), nodeEnv, {
          method: 'DELETE',
        })
        return Response.json(
          {
            toast: {
              type: 'success',
              title: 'Success',
              description: 'Successfully deleted API key',
            },
            response: { api_key_id: id },
          },
          { status: 200 }
        )
      }

      default: {
        // Handle revoke (PUT request)
        if (request.method === 'PUT') {
          await fetchApi(`${identiesApiUrl}/api-keys/${id}/revoke`, token.toString(), nodeEnv, {
            method: 'PUT',
          })

          return Response.json(
            {
              toast: {
                type: 'success',
                title: 'Success',
                description: 'API key revoked successfully',
              },
              response: { api_key_id: id },
            },
            { status: 200 }
          )
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
      }
    }
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
