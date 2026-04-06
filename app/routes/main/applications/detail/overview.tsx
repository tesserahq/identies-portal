/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from '@/components/datetime'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader'
import { ResourceID, useApp } from 'tessera-ui'
import { useDeleteApplication, useApplication } from '@/resources/hooks/applications'
import { type ApplicationType, getApplicationLogoSrc } from '@/resources/queries/applications'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLoaderData, useNavigate, useParams } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/modules/shadcn/ui/avatar'

export function loader() {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv }
}

export default function ApplicationDetail() {
  const { identiesApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [applicationDelete, setApplicationDelete] = useState<ApplicationType>()

  const { data: application, isLoading } = useApplication(
    {
      apiUrl: identiesApiUrl!,
      token: token || '',
      nodeEnv: nodeEnv as any,
    },
    params.applicationID!,
    {
      enabled: !!token && !!params.applicationID,
    }
  )

  const deleteApplicationMutation = useDeleteApplication(
    {
      apiUrl: identiesApiUrl!,
      token: token!,
      nodeEnv: nodeEnv as any,
    },
    {
      onSuccess: () => {
        setApplicationDelete(undefined)
        deleteConfirmationRef.current?.close()
        navigate('/applications')
      },
    }
  )

  useEffect(() => {
    if (applicationDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteApplicationMutation.isPending,
      })
    }
  }, [deleteApplicationMutation.isPending, applicationDelete])

  if (isLoading || !token) {
    return <AppPreloader />
  }

  const openApplicationDeletion = (deleteThisApplication: ApplicationType): void => {
    setApplicationDelete(deleteThisApplication)
    deleteConfirmationRef.current?.open({
      title: 'Delete Application?',
      description: `You'll permanently lose the application "${deleteThisApplication.name}", this action cannot be undone.`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteApplicationMutation.mutate(deleteThisApplication.id)
      },
    })
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={application?.name || 'Unnamed Application'}
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
                onClick={() => navigate(`/applications/${application?.id}/edit`)}>
                <Pencil />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-white"
                onClick={() => application && openApplicationDeletion(application)}>
                <Trash2 />
                <span>Remove</span>
              </Button>
            </PopoverContent>
          </Popover>
        }>
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={getApplicationLogoSrc(application?.logo)} />
            <AvatarFallback>
              <img src="/images/default-user-avatar.jpg" alt="default-logo" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{application?.name || 'Unnamed'}</div>
            <div className="text-xs text-muted-foreground">{application?.url}</div>
          </div>
        </div>
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">ID</dt>
            <dd className="d-content">
              {application?.id ? <ResourceID value={application.id} /> : 'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Name</dt>
            <dd className="d-content">{application?.name || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">URL</dt>
            <dd className="d-content">
              <Link to={application?.url || ''} target="_blank" className="button-link">
                {application?.url}
              </Link>
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Description</dt>
            <dd className="d-content">{application?.description || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {application?.created_at && <DateTime date={application.created_at + 'z'} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              {application?.updated_at && <DateTime date={application.updated_at + 'z'} />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
