/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import CreateButton from '@/components/misc/CreateButton'
import DeleteConfirmation from '@/components/misc/DeleteConfirmation'
import EmptyContent from '@/components/misc/EmptyContent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Separator from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { IApiKey } from '@/types/api-keys'
import { handleFetcherData } from '@/utils/fetcher.data'
import { ActionFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import { useCoreUI } from 'core-ui'
import { format } from 'date-fns'
import { EllipsisVertical, Eye, Pencil, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv }
}

export default function APIKeys() {
  const { identiesApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useCoreUI()
  const navigate = useNavigate()

  const revokeFetcher = useFetcher()
  const deleteFetcher = useFetcher()
  const [apiKeys, setApiKeys] = useState<IApiKey[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [deletionDialog, setDeletionDialog] = useState(false)
  const [apiKeyDelete, setApiKeyDelete] = useState<IApiKey>()

  const fetchApiKeys = async () => {
    setIsLoading(true)

    try {
      const response = await fetchApi(`${identiesApiUrl}/api-keys`, token!, nodeEnv, {
        method: 'GET',
      })

      setApiKeys(response.data)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)
      toast.error(`${convertError.status} - ${convertError.error}`, { duration: 10000 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchApiKeys()
    }
  }, [token])

  useEffect(() => {
    if (deleteFetcher.data) {
      handleFetcherData(deleteFetcher.data, (data) => {
        setApiKeys((prevApiKeys) =>
          prevApiKeys.filter((apiKey) => apiKey.id !== data.api_key_id),
        )
        setDeletionDialog(false)
        setApiKeyDelete(undefined)
      })
    }
  }, [deleteFetcher.data])

  useEffect(() => {
    if (revokeFetcher.data) {
      handleFetcherData(revokeFetcher.data, (data) => {
        const revokedId = data.api_key_id

        setApiKeys((prevApiKeys) =>
          prevApiKeys.map((key) =>
            key.id === revokedId ? { ...key, revoked: true } : key,
          ),
        )
      })
    }
  }, [revokeFetcher.data])

  if (isLoading) {
    return <AppPreloader />
  }

  const openApiKeyDeletion = (deleteThisApiKey: IApiKey): void => {
    setApiKeyDelete(deleteThisApiKey)
    setDeletionDialog(true)
  }

  const handleApiKeyDeletion = (apiKeyId: string) => {
    const formData = new FormData()
    formData.set('id', apiKeyId)
    formData.set('token', token!)
    formData.set('form_method', 'delete_api_key')

    deleteFetcher.submit(formData, { method: 'POST' })
  }

  return (
    <div className="flex w-full animate-slide-up flex-col items-center">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">API Keys</h1>
        {apiKeys.length > 0 && (
          <CreateButton label="New API Key" onClick={() => navigate('new')} />
        )}
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
        apiKeys.map((apiKey) => {
          const isRevoked = apiKey.revoked
          const isExpired =
            apiKey?.expires_at && new Date() > new Date(apiKey?.expires_at)

          return (
            <Card key={apiKey.id} className="mb-3 w-full shadow-card">
              <CardContent className="flex items-center gap-2 pt-4">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <Link
                      to={apiKey.id}
                      className="mb-1 text-base font-medium text-black hover:text-primary hover:underline dark:text-primary-foreground">
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
                        disabled={
                          isRevoked || isExpired || revokeFetcher.state === 'submitting'
                        }>
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
        })
      )}

      <DeleteConfirmation
        open={deletionDialog}
        onOpenChange={setDeletionDialog}
        title="Delete API Key?"
        description={`You'Il permanently lose your API Key "${apiKeyDelete?.name}"`}
        onDelete={() => apiKeyDelete && handleApiKeyDeletion(apiKeyDelete.id)}
        fetcher={deleteFetcher}
      />
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
          { status: 200 },
        )
      }

      default: {
        // Handle revoke (PUT request)
        if (request.method === 'PUT') {
          await fetchApi(
            `${identiesApiUrl}/api-keys/${id}/revoke`,
            token.toString(),
            nodeEnv,
            {
              method: 'PUT',
            },
          )

          return Response.json(
            {
              toast: {
                type: 'success',
                title: 'Success',
                description: 'API key revoked successfully',
              },
              response: { api_key_id: id },
            },
            { status: 200 },
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
          { status: 400 },
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
      { status: parsedError.status || 500 },
    )
  }
}
