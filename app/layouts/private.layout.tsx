import { AppPreloader } from '@/components/loader'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { useAuth0 } from '@auth0/auth0-react'
import { KeyRound, Settings, User, UserCog, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLoaderData, useLocation, useNavigate, useSubmit } from 'react-router'
import { Layout, MainItemProps, TesseraProvider } from 'tessera-ui'

export function loader() {
  const identiesApiUrl = process.env.IDENTIES_API_URL || process.env.API_URL
  // app host urls
  const quoreHostUrl = process.env.QUORE_HOST_URL
  const looplyHostUrl = process.env.LOOPLY_HOST_URL
  const vaultaHostUrl = process.env.VAULTA_HOST_URL
  const identiesHostUrl = process.env.IDENTIES_HOST_URL || process.env.HOST_URL
  const orchaHostUrl = process.env.ORCHA_HOST_URL
  const custosHostUrl = process.env.CUSTOS_HOST_URL
  const indexaHostUrl = process.env.INDEXA_HOST_URL
  const sendlyHostUrl = process.env.SENDLY_HOST_URL

  return {
    identiesApiUrl,
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    identiesHostUrl,
    orchaHostUrl,
    custosHostUrl,
    indexaHostUrl,
    sendlyHostUrl,
  }
}

export default function PrivateLayout() {
  const {
    identiesApiUrl,
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    custosHostUrl,
    identiesHostUrl,
    orchaHostUrl,
    indexaHostUrl,
    sendlyHostUrl,
  } = useLoaderData<typeof loader>()

  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [token, setToken] = useState<string>('')
  const handleApiError = useHandleApiError()
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const navigate = useNavigate()
  const pathName = useLocation()

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleApiError!(error)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchToken()
    }
  }, [isLoading, isAuthenticated])

  const isAccountPage = useMemo(() => {
    return pathName.pathname.includes('/accounts')
  }, [pathName])

  const appHostUrls = {
    quore: quoreHostUrl ?? '',
    looply: looplyHostUrl ?? '',
    vaulta: vaultaHostUrl ?? '',
    identies: identiesHostUrl ?? '',
    orcha: orchaHostUrl ?? '',
    custos: custosHostUrl ?? '',
    indexa: indexaHostUrl ?? '',
    sendly: sendlyHostUrl ?? '',
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
  ]

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <TesseraProvider identiesApiUrl={identiesApiUrl!} token={token}>
      <Layout.Header
        appHostUrls={appHostUrls}
        actionLogout={() => navigate('/logout')}
        actionProfile={() => navigate('/accounts')}
        defaultAvatar=""
        onSetTheme={(theme) => onSetTheme(theme)}
        selectedTheme={requestInfo.userPrefs.theme || 'system'}
        title={SITE_CONFIG.siteTitle}
      />
      {isAccountPage ? (
        <Outlet />
      ) : (
        <Layout.Main menuItems={menuItems}>
          <Outlet />
        </Layout.Main>
      )}
    </TesseraProvider>
  )
}
