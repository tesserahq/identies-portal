/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from '@/components/datetime'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from '@/components/delete-confirmation/delete-confirmation'
import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader'
import { ResourceID, useApp } from 'tessera-ui'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import { AccessRuleType } from '@/resources/queries/access-rules'
import { useAccessRule, useDeleteAccessRule } from '@/resources/hooks/access-rules'

export function loader({ params }: { params: { accessRuleID: string } }) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { identiesApiUrl, nodeEnv, id: params.accessRuleID }
}

export default function AccessRuleDetail() {
  const { identiesApiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [accessDelete, setAccessDelete] = useState<AccessRuleType>()

  const config = {
    apiUrl: identiesApiUrl!,
    token: token || '',
    nodeEnv: nodeEnv as any,
  }

  const { data, isLoading } = useAccessRule(config, id!, {
    enabled: !!token && !!id,
  })

  const deleteAccessRule = useDeleteAccessRule(config, {
    onSuccess: () => {
      setAccessDelete(undefined)
      deleteConfirmationRef.current?.close()
      navigate('/access-rules')
    },
  })

  useEffect(() => {
    if (accessDelete && deleteConfirmationRef.current) {
      deleteConfirmationRef.current.updateConfig({
        isLoading: deleteAccessRule.isPending,
      })
    }
  }, [deleteAccessRule.isPending, accessDelete])

  if (isLoading || !token) {
    return <AppPreloader />
  }

  const openAccessRuleDelete = (data: AccessRuleType): void => {
    setAccessDelete(data)
    deleteConfirmationRef.current?.open({
      title: 'Delete Access Rule?',
      description: `Are you sure you want to permanently delete this ${data.kind}? This action cannot be undone.`,
      onDelete: () => {
        deleteConfirmationRef.current?.updateConfig({
          isLoading: true,
        })
        deleteAccessRule.mutate(data.id)
      },
    })
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={data?.kind || 'Unnamed'}
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
                onClick={() => navigate(`/access-rules/${data?.id}/edit`)}>
                <Pencil />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-white"
                onClick={() => data && openAccessRuleDelete(data)}>
                <Trash2 />
                <span>Remove</span>
              </Button>
            </PopoverContent>
          </Popover>
        }>
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">ID</dt>
            <dd className="d-content">{data?.id ? <ResourceID value={data.id} /> : 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Kind</dt>
            <dd className="d-content">{data?.kind || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Value</dt>
            <dd className="d-content">{data?.value || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Note</dt>
            <dd className="d-content">{data?.note || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {data?.created_at && <DateTime date={data.created_at + 'z'} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              {data?.updated_at && <DateTime date={data.updated_at + 'z'} />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
