/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from '@/components/datetime'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader'
import { useApp } from '@/context/AppContext'
import { useDeleteServiceAccount, useServiceAccount } from '@/resources/hooks/service-accounts'
import type { ServiceAccountType } from '@/resources/queries/service-accounts'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { useQueryClient } from '@tanstack/react-query'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'

export function loader() {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv }
}

export default function ServiceAccountDetail() {
  const { identiesApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [serviceAccountDelete, setServiceAccountDelete] = useState<ServiceAccountType>()

  // React Query hooks
  const { data: serviceAccount, isLoading } = useServiceAccount(
    {
      apiUrl: identiesApiUrl!,
      token: token || '',
      nodeEnv: nodeEnv as any,
    },
    params.id!,
    {
      enabled: !!token && !!params.id,
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
        navigate('/service-accounts')
      },
    }
  )

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

  const displayName =
    `${serviceAccount?.first_name} ${serviceAccount?.last_name}`.trim() ||
    serviceAccount?.email ||
    'Unnamed'

  const openServiceAccountDeletion = (deleteThisServiceAccount: ServiceAccountType): void => {
    setServiceAccountDelete(deleteThisServiceAccount)
    deleteConfirmationRef.current?.open({
      title: 'Delete Service Account?',
      description: `You'll permanently lose the service account "${deleteThisServiceAccount.email || deleteThisServiceAccount.username}"`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteServiceAccountMutation.mutate(deleteThisServiceAccount.id)
      },
    })
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={displayName}
        actions={
          <div className="flex-1 gap-3 flex justify-between items-center">
            <div className="space-x-2">
              {serviceAccount?.verified && (
                <Badge variant="outline" className="border border-green-500 text-green-600">
                  Verified
                </Badge>
              )}
              {serviceAccount?.service_account && (
                <Badge variant="outline" className="border border-blue-500 text-blue-600">
                  Service Account
                </Badge>
              )}
            </div>
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
                  onClick={() => navigate(`/service-accounts/${serviceAccount?.id}/edit`)}>
                  <Pencil />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start hover:bg-destructive hover:text-white"
                  onClick={() => serviceAccount && openServiceAccountDeletion(serviceAccount)}>
                  <Trash2 />
                  <span>Remove</span>
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        }>
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">Email</dt>
            <dd className="d-content">{serviceAccount!.email}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Username</dt>
            <dd className="d-content">{serviceAccount!.username}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">First Name</dt>
            <dd className="d-content">{serviceAccount?.first_name || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Last Name</dt>
            <dd className="d-content">{serviceAccount?.last_name || 'N/A'}</dd>
          </div>
          {serviceAccount?.provider && (
            <div className="d-item">
              <dt className="d-label">Provider</dt>
              <dd className="d-content">{serviceAccount.provider}</dd>
            </div>
          )}
          {serviceAccount?.external_id && (
            <div className="d-item">
              <dt className="d-label">External ID</dt>
              <dd className="d-content">{serviceAccount.external_id}</dd>
            </div>
          )}
          <div className="d-item">
            <dt className="d-label">Theme Preference</dt>
            <dd className="d-content capitalize">{serviceAccount?.theme_preference || 'System'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Verified</dt>
            <dd className="d-content">{serviceAccount?.verified ? 'Yes' : 'No'}</dd>
          </div>
          {serviceAccount?.verified_at && (
            <div className="d-item">
              <dt className="d-label">Verified At</dt>
              <dd className="d-content">
                <DateTime date={serviceAccount.verified_at + 'z'} />
              </dd>
            </div>
          )}
          {serviceAccount?.confirmed_at && (
            <div className="d-item">
              <dt className="d-label">Confirmed At</dt>
              <dd className="d-content">
                <DateTime date={serviceAccount.confirmed_at + 'z'} />
              </dd>
            </div>
          )}
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {serviceAccount?.created_at && <DateTime date={serviceAccount.created_at + 'z'} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              {serviceAccount?.updated_at && <DateTime date={serviceAccount.updated_at + 'z'} />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
