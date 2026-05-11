/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader/pre-loader'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { useAuth0 } from '@auth0/auth0-react'
import { AppWindow, FileLock, UserCog, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useNavigate, useParams, useSubmit } from 'react-router'
import { Layout, MainItemProps, TesseraProvider } from 'tessera-ui'

export function loader() {
  const identiesApiUrl = process.env.IDENTIES_API_URL

  return {
    identiesApiUrl,
  }
}

export default function PrivateLayout() {
  const { identiesApiUrl } = useLoaderData<typeof loader>()

  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [token, setToken] = useState<string>('')
  const handleApiError = useHandleApiError()
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

  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      setToken(token)
    } catch (error: any) {
      handleApiError!(error)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchToken()
    }
  }, [isLoading, isAuthenticated])

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

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <TesseraProvider identiesApiUrl={identiesApiUrl!} token={token}>
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
    </TesseraProvider>
  )
}
