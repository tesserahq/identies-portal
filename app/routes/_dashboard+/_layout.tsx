/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import Header from '@/components/misc/Header'
import SidebarPanel, { IMenuItemProps } from '@/components/misc/Sidebar/SidebarPanel'
import SidebarPanelMin from '@/components/misc/Sidebar/SidebarPanelMin'
import '@/styles/customs/sidebar.css'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react'
import { CoreUIProvider } from 'core-ui'
import { Key, User } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL

  return { apiUrl }
}

export default function Layout() {
  const { apiUrl } = useLoaderData<typeof loader>()
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
    <CoreUIProvider
      token={token}
      identiesApiUrl={apiUrl!}
      isAuthenticated={isAuthenticated}
      callbacktUnauthorized={() => navigate('/', { replace: true })}>
      <div
        ref={containerRef}
        className={cn('has-min-sidebar is-header-blur', isExpanded && 'is-sidebar-open')}>
        <div id="root" className="min-h-100vh flex grow">
          <div className="sidebar print:hidden">
            <SidebarPanel
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              menuItems={menuItems}
            />
            <SidebarPanelMin
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              menuItems={menuItems}
            />
          </div>

          <Header withSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

          <main className="main-content w-full">
            <div className="max-width-screen h-full">
              <Outlet key={location.pathname} />
            </div>
          </main>
        </div>
      </div>
    </CoreUIProvider>
  )
}
