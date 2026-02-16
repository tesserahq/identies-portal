/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Avatar, AvatarFallback, AvatarImage } from '@/modules/shadcn/ui/avatar'
import { Input } from '@/modules/shadcn/ui/input'
import { useUsers } from '@/resources/hooks/users'
import type { UserType } from '@/resources/queries/users'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { EllipsisVertical, Eye, EyeIcon, Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate, useSearchParams } from 'react-router'
import { EmptyContent, DateTime } from 'tessera-ui/components'
import type { ColumnDef } from '@tanstack/react-table'
import { useApp } from 'tessera-ui'

export function loader({ request }: LoaderFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const pagination = ensureCanonicalPagination(request, { defaultSize: 25, defaultPage: 1 })

  if (pagination instanceof Response) {
    return pagination
  }

  const url = new URL(request.url)
  const searchQuery = url.searchParams.get('q') || ''

  return { identiesApiUrl, nodeEnv, pagination, searchQuery }
}

export default function Users() {
  const {
    identiesApiUrl,
    nodeEnv,
    pagination,
    searchQuery: initialSearchQuery,
  } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [searchParams, setSearchParams] = useSearchParams()
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300, { minLength: 3 })

  // Memoize config object to prevent unnecessary re-renders
  const queryConfig = {
    apiUrl: identiesApiUrl!,
    token: token || '',
    nodeEnv: nodeEnv as any,
  }
  const queryParams = {
    page: pagination.page,
    size: pagination.size,
    q: debouncedSearchQuery || undefined,
  }

  // React Query hooks - only query when search is empty or has 3+ characters
  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useUsers(queryConfig, queryParams, {
    enabled: !!token,
  })

  useEffect(() => {
    if (debouncedSearchQuery.length >= 3) {
      searchParams.set('q', debouncedSearchQuery)
      setSearchParams(searchParams)
    }

    if (debouncedSearchQuery === '') {
      searchParams.delete('q')
      setSearchParams(searchParams)
    }
  }, [debouncedSearchQuery])

  const users = usersData?.items || []

  const columns = useMemo<ColumnDef<UserType>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Name',
        size: 220,
        cell: ({ row }) => {
          const { id, first_name, last_name, service_account } = row.original
          const fullName = `${first_name || ''} ${last_name || ''}`.trim()
          return (
            <div className="flex items-center gap-2">
              <Link to={`/users/${id}`} className="button-link">
                <div className="max-w-[200px] truncate">{fullName || '-'}</div>
              </Link>
              {service_account && (
                <Badge variant="outline" className="border border-green-500 text-green-600">
                  <span className="text-xs">service-account</span>
                </Badge>
              )}
            </div>
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
        id: 'actions',
        header: '',
        size: 20,
        cell: ({ row }) => {
          const role = row.original
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  aria-label="Open actions"
                  tabIndex={0}>
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/users/${role.id}`)}>
                  <EyeIcon size={18} />
                  <span>Overview</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    []
  )

  if ((isFetching || isLoading) && !searchQuery) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="flex w-full flex-col items-center page-content">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">Users</h1>
      </div>

      {/* Search Input */}
      <div className="mb-5 w-full">
        <div className="relative bg-card">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isFetching && searchQuery ? (
        <div className="flex items-center justify-center gap-2 w-full h-20">
          <Loader2 className="animate size-4 animate-spin text-muted-foreground" />
          <span className="text-base text-muted-foreground animate animate-pulse">
            Searching...
          </span>
        </div>
      ) : (
        <div className="space-y-3 w-full animate-slide-up">
          <DataTable
            columns={columns}
            data={users}
            fixed={false}
            isLoading={isLoading || (isFetching && !searchQuery)}
            meta={{
              page: usersData?.page || 1,
              pages: usersData?.pages || 1,
              size: usersData?.size || 1,
              total: usersData?.total || 1,
            }}
            empty={
              <EmptyContent
                image="/images/empty-api-keys.png"
                title={searchQuery ? 'No users found' : 'No Users found'}
                description={
                  searchQuery
                    ? 'Try adjusting your search query'
                    : 'There are no users in the system yet'
                }
              />
            }
          />
        </div>
      )}
    </div>
  )
}
