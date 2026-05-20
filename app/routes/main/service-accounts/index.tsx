/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from '@/components/datetime'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader'
import CreateButton from '@/components/new-button/new-button'
import { ResourceID, useApp } from 'tessera-ui'
import { useDeleteServiceAccount, useServiceAccounts } from '@/resources/hooks/service-accounts'
import type { ServiceAccountType } from '@/resources/queries/service-accounts'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'

export function loader({ request }: LoaderFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const pagination = ensureCanonicalPagination(request, { defaultSize: 25, defaultPage: 1 })

  if (pagination instanceof Response) {
    return pagination
  }

  return { identiesApiUrl, nodeEnv, pagination }
}

export default function ServiceAccounts() {
  const { identiesApiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [serviceAccountDelete, setServiceAccountDelete] = useState<ServiceAccountType>()

  // React Query hooks
  const {
    data: serviceAccountsData,
    isLoading,
    error,
  } = useServiceAccounts(
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

  const deleteServiceAccountMutation = useDeleteServiceAccount(
    {
      apiUrl: identiesApiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    {
      onSuccess: () => {
        setServiceAccountDelete(undefined)
        deleteConfirmationRef.current?.close()
      },
    }
  )

  const serviceAccounts = serviceAccountsData?.items || []

  // Update DeleteConfirmation loading state
  useEffect(() => {
    if (serviceAccountDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteServiceAccountMutation.isPending,
      })
    }
  }, [deleteServiceAccountMutation.isPending, serviceAccountDelete])

  const openServiceAccountDeletion = (deleteThisServiceAccount: ServiceAccountType): void => {
    const displayName =
      `${deleteThisServiceAccount.first_name} ${deleteThisServiceAccount.last_name}`.trim() ||
      'Unnamed'

    setServiceAccountDelete(deleteThisServiceAccount)
    deleteConfirmationRef.current?.open({
      title: 'Delete Service Account?',
      description: `You'll permanently lose the service account "${displayName}", this action cannot be undone.`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteServiceAccountMutation.mutate(deleteThisServiceAccount.id)
      },
    })
  }

  const columns = useMemo<ColumnDef<ServiceAccountType>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Name',
        size: 220,
        cell: ({ row }) => {
          const { id, first_name, last_name } = row.original
          const fullName = `${first_name || ''} ${last_name || ''}`.trim()
          return (
            <Link to={`/service-accounts/${id}`} className="button-link">
              <div className="max-w-[200px] truncate">{fullName || '-'}</div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
        cell: ({ row }) => {
          const { email } = row.original
          return <div className="max-w-[200px] truncate">{email || '-'}</div>
        },
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        size: 140,
        cell: ({ row }) => {
          const { provider } = row.original
          return <div className="max-w-[140px] truncate">{provider || '-'}</div>
        },
      },
      {
        accessorKey: 'verified',
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const verified = row.getValue('verified') as boolean
          return verified ? (
            <Badge variant="outline" className="border border-green-500 text-green-600">
              <span className="text-xs">Verified</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="border border-red-500 text-red-600">
              <span className="text-xs">Unverified</span>
            </Badge>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 160,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 160,
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        cell: ({ row }) => {
          const id = row.getValue('id') as string
          return <ResourceID value={id} />
        },
      },
      {
        id: 'actions',
        header: '',
        size: 20,
        cell: ({ row }) => {
          const account = row.original
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
                  onClick={() => navigate(`/service-accounts/${account.id}`)}>
                  <Eye />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => navigate(`/service-accounts/${account.id}/edit`)}>
                  <Pencil />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start hover:bg-destructive hover:text-white"
                  onClick={() => openServiceAccountDeletion(account)}>
                  <Trash2 />
                  <span>Remove</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    []
  )

  const meta = {
    page: serviceAccountsData?.page || 1,
    pages: serviceAccountsData?.pages || 1,
    size: serviceAccountsData?.size || 1,
    total: serviceAccountsData?.total || 1,
  }

  if (isLoading || !token) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-service-accounts.png"
        title="Failed to get service accounts"
        description={error.message}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-center page-content">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">Service Accounts</h1>
        {serviceAccounts.length > 0 && (
          <CreateButton label="New Service Account" onClick={() => navigate('new')} />
        )}
      </div>
      <div className="space-y-3 w-full animate-slide-up">
        <DataTable
          columns={columns}
          data={serviceAccountsData?.items || []}
          fixed={false}
          isLoading={isLoading}
          meta={meta}
          empty={
            <EmptyContent
              image="/images/empty-api-keys.png"
              title={'No Service Account found'}
              description={'There are no account in the system yet'}
            />
          }
        />
      </div>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
