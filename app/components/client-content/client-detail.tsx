import { DateTime, ResourceID } from 'tessera-ui'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import { DetailContent } from '@/components/detail-content'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader'
import RevokeConfirmation, {
  type RevokeConfirmationHandle,
} from '@/components/revoke-confirmation/revoke-confirmation'
import { useApp } from 'tessera-ui'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Check, CheckCircle2Icon, Copy, EllipsisVertical, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { NodeENVType } from '@/libraries/fetch'
import { serviceAccountQueryKeys } from '@/resources/hooks/service-accounts'
import { usersQueryKeys } from '@/resources/hooks/users'
import { useClient, useDeleteClient, useRevokeClient } from '@/resources/hooks/clients'
import { ClientType, ResourceClientUrlEnum } from '@/resources/queries/clients'
import { cn } from '@/modules/shadcn/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/modules/shadcn/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shadcn/ui/tooltip'

interface Props {
  apiUrl: string
  nodeEnv: NodeENVType
  resourceClientEnum: ResourceClientUrlEnum
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys
  resourceID: string
  clientID: string
  clientData?: ClientType
}

export function ClientDetailContent({
  apiUrl,
  nodeEnv,
  resourceClientEnum,
  queryKey,
  resourceID,
  clientID,
  clientData,
}: Props) {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const { token } = useApp()
  const navigate = useNavigate()
  const revokeConfirmationRef = useRef<RevokeConfirmationHandle>(null)
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [clientRevoke, setClientRevoke] = useState<ClientType>()
  const [clientDelete, setClientDelete] = useState<ClientType>()

  const config = { apiUrl, nodeEnv, token: token! }

  const {
    data: clientGetData,
    isLoading,
    error,
    refetch,
  } = useClient(config, resourceID, clientID, queryKey, {
    enabled: !!token && !!clientID && !clientData,
  })

  const revokeClientMutation = useRevokeClient(config, resourceID, queryKey, {
    onSuccess: () => {
      setClientRevoke(undefined)
      refetch()
      revokeConfirmationRef.current?.close()
    },
  })

  const deleteClientMutation = useDeleteClient(config, resourceID, queryKey, {
    onSuccess: () => {
      setClientDelete(undefined)
      deleteConfirmationRef.current?.close()
      navigate(`${resourceClientEnum}/${resourceID}/clients`)
    },
  })

  useEffect(() => {
    if (clientRevoke && revokeConfirmationRef.current) {
      revokeConfirmationRef.current.updateConfig({
        isLoading: revokeClientMutation.isPending,
      })
    }
  }, [revokeClientMutation.isPending, clientRevoke])

  useEffect(() => {
    if (clientDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteClientMutation.isPending,
      })
    }
  }, [deleteClientMutation.isPending, clientDelete])

  if (!clientData && (isLoading || !token)) {
    return <AppPreloader className="min-h-screen" />
  }

  if (!clientData && error) {
    return (
      <EmptyContent
        title="Oops, Looks like there is problem on serving the data"
        image="/images/empty-api-keys.png"
        description={error.message}>
        <Button onClick={() => navigate(`${resourceClientEnum}/${resourceID}`)}>
          Back to Clients
        </Button>
      </EmptyContent>
    )
  }

  const openClientRevoke = (data: ClientType): void => {
    setClientRevoke(data)
    revokeConfirmationRef.current?.open({
      title: 'Revoke client?',
      description: `Are you sure you want to revoke "${data.name}" client? This action cannot be undone.`,
      onRevoke: () => {
        revokeConfirmationRef.current?.updateConfig({ isLoading: true })
        revokeClientMutation.mutate(data)
      },
    })
  }

  const openClientDeletion = (data: ClientType): void => {
    setClientDelete(data)
    deleteConfirmationRef.current?.open({
      title: 'Delete client?',
      description: `You'll permanently lose your "${data.name}" data. Are you certain?`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({ isLoading: true })
        deleteClientMutation.mutate(data)
      },
    })
  }

  const client = clientData ?? clientGetData

  return (
    <div className="space-y-5">
      <DetailContent
        title={client?.name || ''}
        actions={
          clientData ? (
            <></>
          ) : (
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
                  disabled={!!client?.revoked || revokeClientMutation.isPending}
                  onClick={() => client && openClientRevoke(client)}>
                  <ShieldX />
                  <span>
                    {revokeClientMutation.isPending
                      ? 'Revoking...'
                      : client?.revoked
                        ? 'Revoked'
                        : 'Revoke'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start hover:bg-destructive
                    hover:text-destructive-foreground"
                  onClick={() => client && openClientDeletion(client)}>
                  <Trash2 />
                  <span>Remove</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        }>
        {clientData && (
          <Alert variant="success" className="mb-5">
            <CheckCircle2Icon size={18} className="dark:text-green-100" />
            <AlertTitle>
              Make sure to copy the client secret now. You won&apos;t be able to see it again!
            </AlertTitle>
            <AlertDescription>
              <div className="flex items-center gap-2">
                <div
                  className="mt-2 flex items-center justify-between rounded-lg bg-green-100 px-3
                    py-2 text-sm dark:bg-green-600">
                  <span className="font-mono font-medium dark:text-foreground">
                    {clientData?.client_secret}
                  </span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-5 w-5 dark:bg-transparent dark:text-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(clientData?.client_secret || '')
                            setIsCopied(true)

                            setTimeout(() => setIsCopied(false), 2000)
                          }}>
                          {isCopied ? <Check /> : <Copy />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="font-sans">Copy Client Key</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">Name</dt>
            <dd className="d-content font-mono text-sm">{client?.name || '-'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">ID</dt>
            <dd className="d-content font-mono text-sm">
              {client?.id ? <ResourceID value={client?.id} /> : '-'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Client ID</dt>
            <dd className="d-content font-mono text-sm">
              {client?.client_id ? <ResourceID value={client?.client_id} /> : '-'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Owner ID</dt>
            <dd className="d-content font-mono text-sm">
              {client?.owner_id ? <ResourceID value={client?.owner_id} /> : '-'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Revoke Status</dt>
            <dd className="d-content">
              <Badge
                variant="outline"
                className={cn(
                  'border border-orange-500 text-orange-500',
                  !client?.revoked && 'border-primary text-primary'
                )}>
                {client?.revoked ? 'Revoked' : 'Active'}
              </Badge>
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created By ID</dt>
            <dd className="d-content font-mono text-sm">
              {client?.created_by_id ? <ResourceID value={client?.created_by_id} /> : '-'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {client?.created_at && <DateTime date={client.created_at} />}
            </dd>
          </div>
        </div>
        {clientData && (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`${resourceClientEnum}/${resourceID}/clients`)}>
              Back
            </Button>
          </div>
        )}
      </DetailContent>
      <RevokeConfirmation ref={revokeConfirmationRef} />
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
