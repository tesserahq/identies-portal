/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import DeleteConfirmation from '@/components/misc/DeleteConfirmation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { fetchApi } from '@/libraries/fetch'
import { IApiKey } from '@/types/api-keys'
import { handleFetcherData } from '@/utils/fetcher.data'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate, useParams, useFetcher } from '@remix-run/react'
import { useCoreUI } from 'core-ui'
import { format } from 'date-fns'
import { EllipsisVertical, Pencil, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv }
}

export default function APIKeysIndex() {
  const { identiesApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useCoreUI()
  const params = useParams()
  const navigate = useNavigate()
  const deleteFetcher = useFetcher()
  const revokeFetcher = useFetcher()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [apiKey, setApiKey] = useState<IApiKey>()
  const [deletionDialog, setDeletionDialog] = useState(false)
  const [apiKeyDelete, setApiKeyDelete] = useState<IApiKey>()

  const fetchApiKey = async () => {
    try {
      const response = await fetchApi(
        `${identiesApiUrl}/api-keys/${params.id}`,
        token!,
        nodeEnv,
        {
          method: 'GET',
        },
      )

      setApiKey(response)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)
      toast.error(`${convertError.status} - ${convertError.error}`, { duration: 10000 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchApiKey()
    }
  }, [token])

  useEffect(() => {
    if (revokeFetcher.data) {
      handleFetcherData(revokeFetcher.data)
      fetchApiKey()
    }
  }, [revokeFetcher.data])

  useEffect(() => {
    if (deleteFetcher.data) {
      handleFetcherData(deleteFetcher.data, () => {
        navigate('/api-keys')
        setDeletionDialog(false)
        setApiKeyDelete(undefined)
      })
    }
  }, [deleteFetcher.data])

  if (isLoading) {
    return <AppPreloader />
  }

  const openApiKeyDeletion = (deleteThisApiKey: IApiKey) => {
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
    <div className="flex animate-slide-up flex-col items-center">
      <Card className="m-5 w-full animate-slide-up border lg:max-w-3xl">
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
                {apiKey?.expires_at
                  ? format(apiKey?.expires_at + 'z', 'PPPpp')
                  : 'No expiration'}
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Last Used At</dt>
              <dd className="d-content">
                {apiKey?.last_used_at
                  ? format(apiKey?.last_used_at + 'z', 'PPPpp')
                  : 'Never'}
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

        return redirectWithToast('/api-keys', {
          type: 'success',
          title: 'Success',
          description: 'API key deleted successfully',
        })
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
