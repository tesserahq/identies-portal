import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader'
import RevokeConfirmation, {
  type RevokeConfirmationHandle,
} from '@/components/revoke-confirmation/revoke-confirmation'
import { NewButton, ResourceID, useApp } from 'tessera-ui'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { EllipsisVertical, Eye, ShieldX, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { DateTime } from 'tessera-ui'
import { useClients, useDeleteClient, useRevokeClient } from '@/resources/hooks/clients'
import { ClientType, ResourceClientUrlEnum } from '@/resources/queries/clients'
import { NodeENVType } from '@/libraries/fetch'
import { serviceAccountQueryKeys } from '@/resources/hooks/service-accounts'
import { usersQueryKeys } from '@/resources/hooks/users'
import { DataTable } from '../data-table'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/modules/shadcn/lib/utils'

interface Props {
  identiesApiUrl: string
  nodeEnv: NodeENVType
  pagination: {
    size: number
    page: number
  }
  resourceClientEnum: ResourceClientUrlEnum
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys
  resourceID: string
}

export function ClientsListingContent({
  identiesApiUrl,
  nodeEnv,
  pagination,
  resourceClientEnum,
  queryKey,
  resourceID,
}: Props) {
  const { token } = useApp()
  const navigate = useNavigate()

  const revokeConfirmationRef = useRef<RevokeConfirmationHandle>(null)
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [clientRevoke, setClientRevoke] = useState<ClientType>()
  const [clientDelete, setClientDelete] = useState<ClientType>()

  const config = {
    apiUrl: identiesApiUrl,
    token: token!,
    nodeEnv: nodeEnv,
  }

  const params = {
    page: pagination.page,
    size: pagination.size,
  }

  // React Query hooks
  const { data, isLoading, isFetching, error, refetch } = useClients(
    config,
    params,
    resourceClientEnum,
    resourceID!,
    queryKey,
    {
      enabled: !!token && !!resourceID,
    }
  )

  const revokeClientMutation = useRevokeClient(config, resourceID!, queryKey, {
    onSuccess: () => {
      setClientRevoke(undefined)
      refetch()
      revokeConfirmationRef.current?.close()
    },
  })

  const deleteApiKeyMutation = useDeleteClient(config, resourceID!, queryKey, {
    onSuccess: () => {
      setClientDelete(undefined)
      refetch()
      deleteConfirmationRef.current?.close()
    },
  })

  // Update RevokeConfirmation loading state
  useEffect(() => {
    if (clientRevoke && revokeConfirmationRef.current) {
      revokeConfirmationRef.current.updateConfig({
        isLoading: revokeClientMutation.isPending,
      })
    }
  }, [revokeClientMutation.isPending, clientRevoke])

  // Update DeleteConfirmation loading state
  useEffect(() => {
    if (clientDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteApiKeyMutation.isPending,
      })
    }
  }, [deleteApiKeyMutation.isPending, clientDelete])

  const columns = useMemo<ColumnDef<ClientType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const { id, name } = row.original
          return (
            <Link to={`${resourceClientEnum}/${resourceID}/clients/${id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={name}>
                {name}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'client_id',
        header: 'Client ID',
        size: 180,
        cell: ({ row }) => {
          const clientId = row.getValue('client_id') as string
          return <ResourceID value={clientId} />
        },
      },
      {
        accessorKey: 'owner_id',
        header: 'Owner ID',
        size: 180,
        cell: ({ row }) => {
          const ownerId = row.getValue('owner_id') as string
          return <ResourceID value={ownerId} />
        },
      },
      {
        accessorKey: 'revoked',
        header: 'Status',
        size: 50,
        cell: ({ row }) => {
          const revoked = row.getValue('revoked') as boolean
          return (
            <Badge
              variant="outline"
              className={cn(
                'border border-orange-500 text-orange-500',
                !revoked && 'border-primary text-primary'
              )}>
              {revoked ? 'Revoked' : 'Active'}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 180,
        cell: ({ row }) => {
          const id = row.getValue('id') as string
          return <ResourceID value={id} />
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 150,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'popover',
        header: '',
        size: 100,
        cell: ({ row }) => {
          const data = row.original
          return (
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
                  onClick={() =>
                    navigate(`${resourceClientEnum}/${resourceID}/clients/${data.id}`)
                  }>
                  <Eye />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  disabled={data.revoked || revokeClientMutation.isPending}
                  onClick={() => openClientRevoke(data)}>
                  <ShieldX />
                  <span>
                    {revokeClientMutation.isPending
                      ? 'Revoking...'
                      : data.revoked
                        ? 'Revoked'
                        : 'Revoke'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start hover:bg-destructive
                    hover:text-destructive-foreground"
                  onClick={() => openClientDeletion(data)}>
                  <Trash2 />
                  <span>Remove</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [resourceClientEnum, resourceID]
  )

  const openClientRevoke = (data: ClientType): void => {
    setClientRevoke(data)
    revokeConfirmationRef.current?.open({
      title: 'Revoke client?',
      description: `Are you sure you want to revoke "${data.name}" client? This action cannot be undone.`,
      onRevoke: () => {
        revokeConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        revokeClientMutation.mutate(data)
      },
    })
  }

  const openClientDeletion = (data: ClientType): void => {
    setClientDelete(data)
    deleteConfirmationRef.current?.open({
      title: 'Delete client?',
      description: `You'll permanently lose your "${data.name}" data. Are you certain ?`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteApiKeyMutation.mutate(data)
      },
    })
  }

  if (isLoading || isFetching || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error || !data) {
    return (
      <EmptyContent
        image="/images/empty-service-accounts.png"
        title="Oops, Looks like there is problem on serving the data"
        description={error?.message}
      />
    )
  }

  if (data?.total === 0) {
    return (
      <EmptyContent
        image="/images/empty-api-keys.png"
        title="Looks like there is no clients found"
        description="Click the button below to start adding client">
        <Button variant="black" onClick={() => navigate(`new`)}>
          Start Creating
        </Button>
      </EmptyContent>
    )
  }

  const meta = data
    ? {
        page: data.page,
        pages: data.pages,
        size: data.size,
        total: data.total,
      }
    : undefined

  return (
    <div className="h-full page-content">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">Clients</h1>
        <NewButton label="New Client" onClick={() => navigate(`new`)} disabled={isLoading} />
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />
      <RevokeConfirmation ref={revokeConfirmationRef} />
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
