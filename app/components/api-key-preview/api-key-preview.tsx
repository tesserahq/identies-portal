import { Alert, AlertDescription, AlertTitle } from '@/modules/shadcn/ui/alert'
import { Button } from '@/modules/shadcn/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shadcn/ui/tooltip'
import { Check, CheckCircle2Icon, Copy } from 'lucide-react'
import { ApiKeyType } from '@/resources/queries/api-keys'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { DateTime } from 'tessera-ui/components'
import { Card, CardContent } from '@/modules/shadcn/ui/card'

interface Props {
  apiKey: ApiKeyType
  backTo: string
}

export function ApiKeyPreview({ apiKey, backTo }: Props) {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const navigate = useNavigate()

  return (
    <Card className="animate-slide-up mx-auto w-full max-w-screen-md">
      <CardContent className="pt-6">
        <Alert variant="success" className="mb-5">
          <CheckCircle2Icon size={18} className="dark:text-green-100" />
          <AlertTitle>
            Make sure to copy your personal key now. You won&apos;t be able to see it again!
          </AlertTitle>
          <AlertDescription>
            <div className="flex items-center gap-2">
              <div
                className="mt-2 flex items-center justify-between rounded-lg bg-green-100 px-3 py-2
                  text-sm dark:bg-green-600">
                <span className="font-mono font-medium dark:text-foreground">
                  {apiKey?.full_key}
                </span>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-5 w-5 dark:bg-transparent dark:text-foreground"
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
              {apiKey?.created_at && <DateTime date={apiKey?.created_at} tooltipSide="top" />}
            </dd>
          </dl>
          <dl className="d-item">
            <dt className="d-label">Expires At</dt>
            <dd className="d-content">
              {apiKey?.expires_at ? (
                <DateTime date={apiKey?.expires_at} tooltipSide="top" />
              ) : (
                'No expiration'
              )}
            </dd>
          </dl>
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(backTo)}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
