import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { FileText, Key, MonitorCheck } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function AccountLayout() {
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

  const userID = params.userID

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/users/${params.userID}/overview`,
      icon: FileText,
    },
    {
      title: 'API Keys',
      path: `/users/${params.userID}/api-keys`,
      icon: Key,
    },
    {
      title: 'Clients',
      path: `/users/${params.userID}/clients`,
      icon: MonitorCheck,
    },
  ]

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length == 0 || !token || !userID}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
