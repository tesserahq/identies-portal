import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { File, FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function AccessRuleDetailLayout() {
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

  const accessRuleID = params.accessRuleID

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/access-rules/${accessRuleID}/overview`,
      icon: File as unknown as DetailItemsProps['icon'],
    },
  ]

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length == 0 || !token || !accessRuleID}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
