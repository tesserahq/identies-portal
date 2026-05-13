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
import { EllipsisVertical, Pencil, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { NodeENVType } from '@/libraries/fetch'
import { serviceAccountQueryKeys } from '@/resources/hooks/service-accounts'
import { usersQueryKeys } from '@/resources/hooks/users'
import { useClient, useDeleteClient, useRevokeClient } from '@/resources/hooks/clients'
import { ClientType, ResourceClientUrlEnum } from '@/resources/queries/clients'
import { cn } from '@/modules/shadcn/lib/utils'

interface Props {
  apiUrl: string
  nodeEnv: NodeENVType
  resourceClientEnum: ResourceClientUrlEnum
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys
  resourceID: string
  clientID: string
}

export function ClientDetailContent({
  apiUrl,
  nodeEnv,
  resourceClientEnum,
  queryKey,
  resourceID,
  clientID,
}: Props) {
  const { token } = useApp()
  const navigate = useNavigate()
  const revokeConfirmationRef = useRef<RevokeConfirmationHandle>(null)
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [clientRevoke, setClientRevoke] = useState<ClientType>()
  const [clientDelete, setClientDelete] = useState<ClientType>()

  const config = { apiUrl, nodeEnv, token: token! }

  const {
    data: client,
    isLoading,
    error,
    refetch,
  } = useClient(config, resourceID, clientID, queryKey, {
    enabled: !!token && !!clientID,
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

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error) {
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

  return (
    <div className="space-y-5">
      <DetailContent
        title={client?.name || ''}
        actions={
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
                className="flex w-full justify-start hover:bg-destructive hover:text-white"
                onClick={() => client && openClientDeletion(client)}>
                <Trash2 />
                <span>Remove</span>
              </Button>
            </PopoverContent>
          </Popover>
        }>
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
      </DetailContent>
      <RevokeConfirmation ref={revokeConfirmationRef} />
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
