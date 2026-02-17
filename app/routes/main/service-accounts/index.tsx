/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pagination } from '@/components/data-table/data-pagination'
import { DateTime } from '@/components/datetime'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader'
import CreateButton from '@/components/new-button/new-button'
import { useApp } from 'tessera-ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/modules/shadcn/ui/avatar'
import { useDeleteServiceAccount, useServiceAccounts } from '@/resources/hooks/service-accounts'
import type { ServiceAccountType } from '@/resources/queries/service-accounts'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Separator } from '@shadcn/ui/separator'
import { useQueryClient } from '@tanstack/react-query'
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router'

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
  const queryClient = useQueryClient()

  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [serviceAccountDelete, setServiceAccountDelete] = useState<ServiceAccountType>()

  // React Query hooks
  const { data: serviceAccountsData, isLoading } = useServiceAccounts(
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

  if (isLoading || !token) {
    return <AppPreloader />
  }

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

  return (
    <div className="flex w-full flex-col items-center page-content">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">Service Accounts</h1>
        {serviceAccounts.length > 0 && (
          <CreateButton label="New Service Account" onClick={() => navigate('new')} />
        )}
      </div>
      {serviceAccounts.length === 0 ? (
        <EmptyContent
          image="/images/empty-api-keys.png"
          title="No Service Accounts found"
          description="Click the button below to start creating Service Accounts">
          <Button variant="black" onClick={() => navigate('new')}>
            Start Now
          </Button>
        </EmptyContent>
      ) : (
        <div className="space-y-3 w-full">
          {serviceAccounts.map((serviceAccount: ServiceAccountType) => {
            const displayName =
              `${serviceAccount.first_name} ${serviceAccount.last_name}`.trim() || 'Unnamed'

            return (
              <Card key={serviceAccount.id} className="mb-3 w-full shadow-card">
                <CardContent className="flex items-center gap-3 pt-4">
                  <Avatar>
                    <AvatarImage src={serviceAccount.avatar_url} />
                    <AvatarFallback>
                      <img src="/images/default-user-avatar.jpg" alt="default-user" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <Link
                        to={serviceAccount.id}
                        className="mb-1 font-medium text-black hover:text-primary hover:underline
                          dark:text-primary-foreground">
                        {displayName}
                      </Link>
                      {serviceAccount.verified && (
                        <Badge variant="outline" className="border border-green-500 text-green-600">
                          <span className="text-xs">Verified</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <span>{serviceAccount.email}</span>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <div>
                        Created <DateTime date={serviceAccount.created_at + 'z'} />
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
                        onClick={() => navigate(`/service-accounts/${serviceAccount.id}`)}>
                        <Eye />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => navigate(`/service-accounts/${serviceAccount.id}/edit`)}>
                        <Pencil />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start hover:bg-destructive hover:text-white"
                        onClick={() => openServiceAccountDeletion(serviceAccount)}>
                        <Trash2 />
                        <span>Remove</span>
                      </Button>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )
          })}

          <Pagination
            meta={{
              page: serviceAccountsData?.page || 1,
              pages: serviceAccountsData?.pages || 1,
              size: serviceAccountsData?.size || 1,
              total: serviceAccountsData?.total || 1,
            }}
          />
        </div>
      )}

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
