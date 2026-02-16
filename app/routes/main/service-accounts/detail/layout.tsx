import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from 'tessera-ui'
import { Button } from '@/modules/shadcn/ui/button'
import { useApiKey } from '@/resources/hooks/api-keys'
import { useServiceAccount, useServiceAccountApiKeys } from '@/resources/hooks/service-accounts'
import { FileText, Key } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { BreadcrumbItemData, DetailItemsProps, Layout } from 'tessera-ui'

export function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id }
}

export default function DetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItemData[]>([])

  // Nested Items for the service account
  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/service-accounts/${params.id}/overview`,
      icon: FileText,
    },
    {
      title: 'API Keys',
      path: `/service-accounts/${params.id}/api-keys`,
      icon: Key,
    },
  ]
  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  // Generate resource data (service account) to get name/title from resource
  const {
    data: serviceAccount,
    isLoading,
    error,
  } = useServiceAccount(config, params.id as string, {
    enabled: !!token,
  })

  const { data: apiKey } = useApiKey(config, params.apiKeyId as string, {
    enabled: !!token && !!params.apiKeyId,
  })

  // Generate breadcrumb based on the pathname and service account name
  const generatingBreadcrumb = async () => {
    const breadcrumbItems = []

    const pathParts = pathname.split('/').filter(Boolean)

    const displayName =
      `${serviceAccount?.first_name} ${serviceAccount?.last_name}`.trim() ||
      serviceAccount?.email ||
      'Unnamed'

    for (let index = 0; index < pathParts.length; index++) {
      const part = pathParts[index]

      breadcrumbItems.push({
        // If the part is the same as the role id, use the role name, otherwise use the part
        label:
          part === params?.id
            ? displayName
            : part === params?.apiKeyId
              ? apiKey?.name || part // display api key name, if not display apiKeyId
              : part.replace('-', ' '),

        // Generate the link based on the path parts
        link: `/${pathParts.slice(0, index + 1).join('/')}`,
      })
    }

    setBreadcrumb(breadcrumbItems)
  }

  useEffect(() => {
    if (serviceAccount) {
      generatingBreadcrumb()
    }
  }, [serviceAccount, pathname])

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error || !serviceAccount) {
    return (
      <EmptyContent
        title="Service Account Not Found"
        image="/images/empty-service-accounts.png"
        description={`We can't find service account with ID ${params.id} ${(error as Error)?.message}`}>
        <Button onClick={() => navigate('/service-accounts')}>Back to Service Accounts</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail menuItems={menuItems} breadcrumb={breadcrumb}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
