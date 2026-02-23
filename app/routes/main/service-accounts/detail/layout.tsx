import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { FileText, Key } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function DetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const { pathname } = useLocation()

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    token: token || '',
    apiUrl: apiUrl || '',
    nodeEnv,
  })

  const serviceAccountID = params.serviceAccountID

  // Nested Items for the service account
  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/service-accounts/${serviceAccountID}/overview`,
      icon: FileText as unknown as DetailItemsProps['icon'],
    },
    {
      title: 'API Keys',
      path: `/service-accounts/${serviceAccountID}/api-keys`,
      icon: Key as unknown as DetailItemsProps['icon'],
    },
  ]

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length == 0 || !token || !serviceAccountID}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
