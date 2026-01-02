/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import Header from '@/components/header/header'
import { SidebarPanel, SidebarPanelMin } from '@/components/sidebar'
import { IMenuItemProps } from '@/components/sidebar/types'
import '@/styles/sidebar.css'
import { useAuth0 } from '@auth0/auth0-react'
import { cn } from '@shadcn/lib/utils'
import { Key, User } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLoaderData, useNavigate } from 'react-router'
import { toast } from 'sonner'

export function loader() {
  const hostUrl = process.env.HOST_URL
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  // App host URL
  const quoreHostUrl = process.env.QUORE_HOST_URL
  const custosHostUrl = process.env.CUSTOS_HOST_URL
  const vaultaHostUrl = process.env.VAULTA_HOST_URL
  const looplyHostUrl = process.env.LOOPLY_HOST_URL

  return { hostUrl, apiUrl, nodeEnv, quoreHostUrl, custosHostUrl, vaultaHostUrl, looplyHostUrl }
}

export default function Layout() {
  const { hostUrl, apiUrl, nodeEnv, quoreHostUrl, custosHostUrl, vaultaHostUrl, looplyHostUrl } =
    useLoaderData<typeof loader>()
  const [isExpanded, setIsExpanded] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0()
  const [token, setToken] = useState<string>('')

  const menuItems: IMenuItemProps[] = [
    {
      title: 'Preferences',
      path: '/preferences',
      icon: <User size={18} />,
    },
    {
      title: 'API Keys',
      path: '/api-keys',
      icon: <Key size={18} />,
    },
  ]

  const onResize = useCallback(() => {
    if (containerRef.current) {
      if (containerRef.current.offsetWidth <= 1280) {
        setIsExpanded(false)
      }
    }
  }, [])

  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      setToken(token)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  useEffect(() => {
    if (!isLoading) {
      fetchToken()
    }
  }, [isLoading])

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div
      ref={containerRef}
      className={cn('has-min-sidebar is-header-blur', isExpanded && 'is-sidebar-open')}>
      <div id="root" className="min-h-100vh flex grow">
        <div className="sidebar print:hidden">
          <SidebarPanel menuItems={menuItems} />
          <SidebarPanelMin menuItems={menuItems} />
        </div>

        <Header
          withSidebar
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          appHostUrls={{
            quoreHostUrl: quoreHostUrl!,
            custosHostUrl: custosHostUrl!,
            vaultaHostUrl: vaultaHostUrl!,
            looplyHostUrl: looplyHostUrl!,
          }}
        />

        <main className="main-content w-full">
          <div className="max-width-screen h-full">
            <Outlet key={location.pathname} />
          </div>
        </main>
      </div>
    </div>
  )
}
