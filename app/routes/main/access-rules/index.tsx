/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pagination } from '@/components/data-table/data-pagination'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader'
import CreateButton from '@/components/new-button/new-button'
import { DateTime, ResourceID, useApp } from 'tessera-ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/modules/shadcn/ui/avatar'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Separator } from '@shadcn/ui/separator'
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router'
import { useAccessRules, useDeleteAccessRule } from '@/resources/hooks/access-rules'
import { AccessRuleType } from '@/resources/queries/access-rules'

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

  const {
    data: applicationsData,
    isLoading,
    error,
  } = useAccessRules(
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

  const deleteApplicationMutation = useDeleteAccessRule(
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

  const applications = applicationsData?.items || []

  useEffect(() => {
    if (resourceToDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteApplicationMutation.isPending,
      })
    }
  }, [deleteApplicationMutation.isPending, resourceToDelete])

  if (isLoading || !token) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-api-keys.png"
        title="Failed to get applications"
        description={error.message}
      />
    )
  }

  const openApplicationDeletion = (data: AccessRuleType): void => {
    setResourceToDelete(data)
    deleteConfirmationRef.current?.open({
      title: 'Delete Access Rule?',
      description: `Are you sure you want to permanently delete this ${data.kind}? This action cannot be undone.`,

      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteApplicationMutation.mutate(data.id)
      },
    })
  }

  return (
    <div className="flex w-full flex-col items-center page-content">
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="page-title">Applications</h1>
        {applications.length > 0 && (
          <CreateButton label="New Application" onClick={() => navigate('new')} />
        )}
      </div>
      {applications.length === 0 ? (
        <EmptyContent
          image="/images/empty-api-keys.png"
          title="No Applications found"
          description="Click the button below to start creating Applications">
          <Button variant="black" onClick={() => navigate('new')}>
            Start Now
          </Button>
        </EmptyContent>
      ) : (
        <div className="space-y-3 w-full">
          {applications.map((application: AccessRuleType) => {
            return (
              <Card key={application.id} className="mb-3 w-full shadow-card">
                <CardContent className="flex items-center gap-3 pt-4">
                  <Avatar>
                    <AvatarImage src={getApplicationLogoSrc(application.logo)} />
                    <AvatarFallback>
                      <img src="/images/default-user-avatar.jpg" alt="default-logo" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <Link
                        to={application.id}
                        className="mb-1 font-medium text-black hover:text-primary hover:underline
                          dark:text-primary-foreground">
                        {application.name || 'Unnamed'}
                      </Link>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Link to={application.url} target="_blank" className="button-link">
                        {application.url}
                      </Link>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <div>
                        Created <DateTime date={application.created_at} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ResourceID value={application.id} />
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
                          onClick={() => navigate(`/applications/${application.id}`)}>
                          <Eye />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start"
                          onClick={() => navigate(`/applications/${application.id}/edit`)}>
                          <Pencil />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start hover:bg-destructive
                            hover:text-white"
                          onClick={() => openApplicationDeletion(application)}>
                          <Trash2 />
                          <span>Remove</span>
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Pagination
            meta={{
              page: applicationsData?.page || 1,
              pages: applicationsData?.pages || 1,
              size: applicationsData?.size || 1,
              total: applicationsData?.total || 1,
            }}
          />
        </div>
      )}

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
