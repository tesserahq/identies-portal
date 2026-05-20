import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { useApp } from 'tessera-ui'
import { useUserById } from '@/resources/hooks/users/use-user'
import { useLoaderData } from 'react-router'
import { DateTime, ResourceID } from 'tessera-ui/components'
import { Badge } from '@/modules/shadcn/ui/badge'
import { getUserProviderIcon } from '@/utils/helpers/user-provider.helper'

export async function loader({ params }: { params: { userID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.userID }
}

export default function UserOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: user, isLoading } = useUserById(config, id)

  const providerImgSrc = getUserProviderIcon(user?.provider)

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent title={user?.email || ''}>
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">ID</dt>
            <dd className="d-content">{user?.id ? <ResourceID value={user.id} /> : 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">External ID</dt>
            <dd className="d-content">
              {user?.external_id ? <ResourceID value={user.external_id} /> : 'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Email</dt>
            <dd className="d-content">{user?.email || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Name</dt>
            <dd className="d-content">
              {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Provider</dt>
            <dd className="d-content">
              {user?.provider ? (
                providerImgSrc ? (
                  <img src={providerImgSrc} alt={user?.provider} className="h-7 w-7" />
                ) : (
                  <span className="truncate">{user?.provider}</span>
                )
              ) : (
                <span>N/A</span>
              )}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Status</dt>
            <dd className="d-content">
              {user?.verified ? (
                <Badge variant="outline" className="border border-green-500 text-green-600">
                  <span className="text-xs">Verified</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="border border-red-500 text-red-600">
                  <span className="text-xs">Unverified</span>
                </Badge>
              )}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Confirmed At</dt>
            <dd className="d-content">
              {user?.confirmed_at ? <DateTime date={user?.confirmed_at} /> : 'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {user?.created_at ? <DateTime date={user?.created_at} /> : 'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              {user?.updated_at ? <DateTime date={user?.updated_at} /> : 'N/A'}
            </dd>
          </div>
        </div>
      </DetailContent>
    </div>
  )
}
