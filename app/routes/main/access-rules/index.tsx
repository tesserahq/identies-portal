/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pagination } from '@/components/data-table/data-pagination'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader'
import CreateButton from '@/components/new-button/new-button'
import { DateTime, ResourceID, useApp } from 'tessera-ui'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Separator } from '@shadcn/ui/separator'
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router'
import { useAccessRules, useDeleteAccessRule } from '@/resources/hooks/access-rules'
import { AccessRuleType } from '@/resources/queries/access-rules'
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

export default function AccessRules() {
  const { identiesApiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [resourceToDelete, setResourceToDelete] = useState<AccessRuleType>()

  const { data, isLoading, isFetching, error } = useAccessRules(
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

  const deleteAccessRule = useDeleteAccessRule(
    {
      apiUrl: identiesApiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    {
      onSuccess: () => {
        setResourceToDelete(undefined)
        deleteConfirmationRef.current?.close()
      },
    }
  )

  const accessRules = data?.items || []

  useEffect(() => {
    if (resourceToDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteAccessRule.isPending,
      })
    }
  }, [deleteAccessRule.isPending, resourceToDelete])

  const openAccessRuleDelete = (data: AccessRuleType): void => {
    setResourceToDelete(data)
    deleteConfirmationRef.current?.open({
      title: 'Delete Access Rule?',
      description: `Are you sure you want to permanently delete this ${data.kind} access rules? This action cannot be undone.`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteAccessRule.mutate(data.id)
      },
    })
  }

  const columns = useMemo<ColumnDef<AccessRuleType>[]>(
    () => [
      {
        accessorKey: 'kind',
        header: 'Kind',
        size: 100,
      },
      {
        accessorKey: 'value',
        header: 'Value',
        size: 250,
        cell: ({ row }) => {
          const { id, value } = row.original
          return (
            <Link to={`/access-rules/${id}`} className="button-link">
              <div className="max-w-[250px] truncate">{value || '-'}</div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'note',
        header: 'Note',
        size: 240,
        cell: ({ row }) => {
          const { note } = row.original
          return <div className="max-w-[220px] truncate">{note || '-'}</div>
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
          const rule = row.original
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
                  onClick={() => navigate(`/access-rules/${rule.id}`)}>
                  <Eye />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => navigate(`/access-rules/${rule.id}/edit`)}>
                  <Pencil />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start hover:bg-destructive hover:text-white"
                  onClick={() => openAccessRuleDelete(rule)}>
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
    page: data?.page || 1,
    pages: data?.pages || 1,
    size: data?.size || 1,
    total: data?.total || 1,
  }

  if (isFetching || isLoading || !token) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-api-keys.png"
        title="Failed to get access rules"
        description={error.message}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-center page-content">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">Access Rules</h1>
        {accessRules.length > 0 && (
          <CreateButton label="New Access Rule" onClick={() => navigate('new')} />
        )}
      </div>
      <div className="space-y-3 w-full animate-slide-up">
        <DataTable
          columns={columns}
          data={data?.items || []}
          fixed={false}
          isLoading={isLoading || isFetching}
          meta={meta}
          empty={
            <EmptyContent
              image="/images/empty-api-keys.png"
              title={'No Access Rule found'}
              description={'There are no users in the system yet'}
            />
          }
        />
      </div>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
