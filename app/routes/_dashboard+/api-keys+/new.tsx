/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { apiKeysSchema } from '@/schemas/api-keys'
import { IApiKey } from '@/types/api-keys'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useNavigate, useNavigation } from '@remix-run/react'
import { FormField, useCoreUI } from 'core-ui'
import { format } from 'date-fns'
import { Check, CheckCircle2Icon, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function NewAPIKey() {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const actionData = useActionData<typeof action>()
  const { token } = useCoreUI()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [expirationType, setExpirationType] = useState<string>('no-expiration')
  const [errorFields, setErrorFields] = useState<any>()
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState<IApiKey>()

  useEffect(() => {
    if (actionData?.success) {
      toast.success('API Key created successfully')
      setApiKey(JSON.parse(actionData.message))
    }

    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  const calculateExpirationDate = (type: string): Date | undefined => {
    const today = new Date()

    switch (type) {
      case '7days':
        return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      case '30days':
        return new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      case '60days':
        return new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
      case '90days':
        return new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
      case 'custom':
        return date
      case 'no-expiration':
        return undefined
      default:
        return undefined
    }
  }

  const handleExpirationTypeChange = (value: string) => {
    setExpirationType(value)

    if (value !== 'custom') {
      const calculatedDate = calculateExpirationDate(value)
      setDate(calculatedDate)
    } else {
      setDate(undefined)
    }
  }

  return (
    <div className="flex animate-slide-up flex-col items-center">
      <Card className="m-5 w-full animate-slide-up border lg:max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">New API Key</CardTitle>
        </CardHeader>
        <CardContent>
          {actionData?.success ? (
            <>
              <Alert variant="success" className="mb-5">
                <CheckCircle2Icon size={18} className="dark:text-green-100" />
                <AlertTitle>
                  Make sure to copy your personal key now. You won&apos;t be able to see
                  it again!
                </AlertTitle>
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-green-100 px-3 py-2 text-sm dark:bg-green-600">
                      <span className="font-mono font-medium dark:text-white">
                        {apiKey?.full_key}
                      </span>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2 h-5 w-5 dark:bg-transparent dark:text-white"
                              onClick={() => {
                                navigator.clipboard.writeText(apiKey?.full_key || '')
                                setIsCopied(true)

                                setTimeout(() => setIsCopied(false), 2000)
                              }}>
                              {isCopied ? <Check /> : <Copy />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="font-sans">Copy Full Key</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <h3 className="mb-2 text-base font-medium">API Key Details</h3>
              <div className="d-list">
                <dl className="d-item">
                  <dt className="d-label">Name</dt>
                  <dd className="d-content">{apiKey?.name}</dd>
                </dl>
                <dl className="d-item">
                  <dt className="d-label">Created At</dt>
                  <dd className="d-content">
                    {apiKey?.created_at && format(apiKey?.created_at || '', 'PPpp')}
                  </dd>
                </dl>
                <dl className="d-item">
                  <dt className="d-label">Expires At</dt>
                  <dd className="d-content">
                    {apiKey?.expires_at
                      ? format(apiKey?.expires_at || '', 'PPpp')
                      : 'No expiration'}
                  </dd>
                </dl>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/api-keys')}>
                  Back
                </Button>
              </div>
            </>
          ) : (
            <Form method="POST">
              <input name="token" value={token || ''} type="hidden" />
              <input
                name="expires_at"
                value={calculateExpirationDate(expirationType)?.toISOString() || ''}
                type="hidden"
              />
              <div className="mb-5 flex flex-col space-y-1">
                <FormField label="Name" name="name" required />
                {errorFields?.name && (
                  <p className="text-xs text-red-500">{errorFields?.name}</p>
                )}
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex flex-col">
                  <Label htmlFor="expiration-type" className="px-1">
                    Expires At
                  </Label>
                  <Select
                    value={expirationType}
                    onValueChange={handleExpirationTypeChange}>
                    <SelectTrigger className="w-full rounded-md pl-3">
                      <SelectValue placeholder="Select expiration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">
                        7 days (
                        {format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'PP')})
                      </SelectItem>
                      <SelectItem value="30days">
                        30 days (
                        {format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'PP')})
                      </SelectItem>
                      <SelectItem value="60days">
                        60 days (
                        {format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'PP')})
                      </SelectItem>
                      <SelectItem value="90days">
                        90 days (
                        {format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'PP')})
                      </SelectItem>
                      {/* <SelectItem value="custom">Custom</SelectItem> */}
                      <SelectItem value="no-expiration">No expiration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* {expirationType === 'custom' && (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="custom-date" className="mt-3 px-1">
                    Select Custom Date
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="custom-date"
                        className="w-full justify-between rounded-md bg-transparent py-5 font-normal">
                        {date ? format(date, 'PPP') : 'Select date'}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date)
                          setOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )} */}
              </div>

              <div className="mt-10 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/api-keys')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={navigation.state === 'submitting'}>
                  {navigation.state === 'submitting' ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const { name, expires_at, token } = Object.fromEntries(formData)

  const validated = apiKeysSchema.safeParse({ name, expires_at })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  // Convert expires_at to end of day (23:59:59.999Z) or null for no expiration
  const expiresAtEndOfDay =
    expires_at && expires_at !== ''
      ? (() => {
          const expiresAtDate = new Date(expires_at.toString())
          return new Date(
            Date.UTC(
              expiresAtDate.getFullYear(),
              expiresAtDate.getMonth(),
              expiresAtDate.getDate(),
              23,
              59,
              59,
              999,
            ),
          ).toISOString()
        })()
      : null

  try {
    const response = await fetchApi(
      `${identiesApiUrl}/api-keys`,
      token.toString(),
      nodeEnv,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          expires_at: expiresAtEndOfDay,
        }),
      },
    )

    return { success: true, message: JSON.stringify(response) } //response?.full_key
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast('/api-keys/new', {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
