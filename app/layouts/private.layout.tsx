import { useRequestInfo } from 'tessera-ui/react-router'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { AppWindow, FileLock, UserCog, Users } from 'lucide-react'
import { Outlet, useNavigate, useParams, useSubmit } from 'react-router'
import { Layout, MainItemProps } from 'tessera-ui'

export default function PrivateLayout() {
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const navigate = useNavigate()
  const params = useParams()
  const shouldCollapseSidebar = Boolean(
    params['accountID'] ||
    params['userID'] ||
    params['serviceAccountID'] ||
    params['applicationID'] ||
    params['accessRuleID']
  )

  const onSetTheme = (theme: string) => {
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      }
    )
  }

  // NOTE: Keep identies-portal menuItems as-is (per request).
  const menuItems: MainItemProps[] = [
    {
      title: 'Users',
      path: '/users',
      icon: Users,
    },
    {
      title: 'Service Accounts',
      path: '/service-accounts',
      icon: UserCog,
    },
    {
      title: 'Applications',
      path: '/applications',
      icon: AppWindow,
    },
    {
      title: 'Access Rules',
      path: '/access-rules',
      icon: FileLock,
    },
  ]

  return (
    <Layout.Main menuItems={menuItems} collapseSidebar={shouldCollapseSidebar}>
      <Layout.Header
        title={SITE_CONFIG.siteTitle}
        actionLogout={() => navigate('/logout')}
        actionProfile={() => {}}
        onSetTheme={(theme) => onSetTheme(theme)}
        selectedTheme={requestInfo.userPrefs.theme || 'system'}
      />
      <Outlet />
    </Layout.Main>
  )
}
