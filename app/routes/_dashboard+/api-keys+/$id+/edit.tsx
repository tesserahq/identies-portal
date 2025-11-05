/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { fetchApi } from '@/libraries/fetch'
import { apiKeysSchema } from '@/schemas/api-keys'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import { FormField, useCoreUI } from 'core-ui'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export async function loader({ params }: LoaderFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv, apiKeyId: params.id }
}

export default function EditAPIKey() {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const actionData = useActionData<typeof action>()
  const { identiesApiUrl, nodeEnv, apiKeyId } = useLoaderData<typeof loader>()
  const { token } = useCoreUI()
  const [errorFields, setErrorFields] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)
  const [apiKey, setApiKey] = useState<any>()
  const [revoked, setRevoked] = useState(false)

  const fetchApiKey = async () => {
    try {
      const response = await fetchApi(
        `${identiesApiUrl}/api-keys/${apiKeyId}`,
        token!,
        nodeEnv,
      )
      setApiKey(response)
      setRevoked(response.revoked || false)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)
      toast.error(`${convertError.status} - ${convertError.error}`, { duration: 10000 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && apiKeyId) {
      fetchApiKey()
    }
  }, [token, apiKeyId])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  if (isLoading) return <AppPreloader />

  return (
    <div className="flex animate-slide-up flex-col items-center">
      <Card className="m-5 w-full animate-slide-up border lg:max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="POST">
            <input name="token" value={token || ''} type="hidden" />
            <input name="revoked" value={revoked.toString()} type="hidden" />
            <div className="mb-5 flex flex-col space-y-1">
              <FormField
                label="Name"
                name="name"
                required
                defaultValue={apiKey?.name || ''}
              />
              {errorFields?.name && (
                <p className="text-xs text-red-500">{errorFields?.name}</p>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between gap-2 px-2">
                <Label htmlFor="revoked" className="mb-0">
                  Revoked
                </Label>
                <Switch id="revoked" checked={revoked} onCheckedChange={setRevoked} />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/api-keys')}>
                Cancel
              </Button>
              <Button type="submit" disabled={navigation.state === 'submitting'}>
                {navigation.state === 'submitting' ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const { name, revoked, token } = Object.fromEntries(formData)

  const validated = apiKeysSchema.safeParse({ name, revoked: revoked === 'true' })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(`${identiesApiUrl}/api-keys/${params.id}`, token.toString(), nodeEnv, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        revoked: revoked === 'true',
      }),
    })

    return redirectWithToast(`/api-keys/${params.id}`, {
      type: 'success',
      title: 'Success',
      description: 'API key updated successfully',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/api-keys/${params.id}/edit`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
