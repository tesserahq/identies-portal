/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pagination } from '@/components/data-table/data-pagination'
import { AppPreloader } from '@/components/loader'
import { useApp } from '@/context/AppContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Avatar, AvatarFallback, AvatarImage } from '@/modules/shadcn/ui/avatar'
import { Input } from '@/modules/shadcn/ui/input'
import { useUsers } from '@/resources/hooks/users'
import type { UserType } from '@/resources/queries/users'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Separator } from '@shadcn/ui/separator'
import { EllipsisVertical, Eye, Loader2, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate, useSearchParams } from 'react-router'
import { EmptyContent, DateTime } from 'tessera-ui/components'

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

  if ((isFetching || isLoading) && !searchQuery) {
    return <AppPreloader className="min-h-screen" />
  }

  const users = usersData?.items || []

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
      ) : !isLoading && users.length === 0 ? (
        <EmptyContent
          image="/images/empty-api-keys.png"
          title={searchQuery ? 'No users found' : 'No Users found'}
          description={
            searchQuery ? 'Try adjusting your search query' : 'There are no users in the system yet'
          }
        />
      ) : (
        <div className="space-y-3 w-full animate-slide-up">
          {users.map((user: UserType) => {
            const displayName = `${user.first_name} ${user.last_name}`.trim() || 'Unnamed'

            return (
              <Card key={user.id} className="mb-3 w-full shadow-card">
                <CardContent className="flex items-center gap-3 pt-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      <img src="/images/default-user-avatar.jpg" alt="default-user" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <Link
                        to={user.id}
                        className="mb-1 font-medium text-black hover:text-primary hover:underline
                          dark:text-primary-foreground">
                        {displayName}
                      </Link>
                      {user.service_account && (
                        <Badge variant="outline" className="border border-green-500 text-green-600">
                          <span className="text-xs">Service Account</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <span>{user.email}</span>
                      <Separator orientation="vertical" className="mx-2 h-2" />
                      <div>
                        Created <DateTime date={user.created_at} />
                      </div>
                    </div>
                  </div>
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
                        onClick={() => navigate(`/users/${user.id}`)}>
                        <Eye />
                        <span>View</span>
                      </Button>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )
          })}

          <Pagination
            meta={{
              page: usersData?.page || 1,
              pages: usersData?.pages || 1,
              size: usersData?.size || 1,
              total: usersData?.total || 1,
            }}
          />
        </div>
      )}
    </div>
  )
}
