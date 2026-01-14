import Header from '@/components/header/header'
import { AppPreloader } from '@/components/loader'
import { SidebarPanel, SidebarPanelMin } from '@/components/sidebar'
import { IMenuItemProps } from '@/components/sidebar/types'
import '@/styles/sidebar.css'
import { useAuth0 } from '@auth0/auth0-react'
import { cn } from '@shadcn/lib/utils'
import { Key, User, UserCog } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLoaderData } from 'react-router'

export function loader() {
  // App host URL
  const quoreHostUrl = process.env.QUORE_HOST_URL
  const custosHostUrl = process.env.CUSTOS_HOST_URL
  const vaultaHostUrl = process.env.VAULTA_HOST_URL
  const looplyHostUrl = process.env.LOOPLY_HOST_URL
  const orchaHostUrl = process.env.ORCHA_HOST_URL

  return {
    quoreHostUrl,
    custosHostUrl,
    vaultaHostUrl,
    looplyHostUrl,
    orchaHostUrl,
  }
}

export default function Layout() {
  const { quoreHostUrl, custosHostUrl, vaultaHostUrl, looplyHostUrl, orchaHostUrl } =
    useLoaderData<typeof loader>()
  const [isExpanded, setIsExpanded] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isLoading } = useAuth0()

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
    {
      title: 'Service Accounts',
      path: '/service-accounts',
      icon: <UserCog size={18} />,
    },
  ]

  const apps = useMemo(() => {
    return [
      {
        name: 'quore',
        link: `${quoreHostUrl}?autologin=true`,
      },
      {
        name: 'custos',
        link: `${custosHostUrl}?autologin=true`,
      },
      {
        name: 'vaulta',
        link: `${vaultaHostUrl}?autologin=true`,
      },
      {
        name: 'looply',
        link: `${looplyHostUrl}?autologin=true`,
      },
      {
        name: 'orcha',
        link: `${orchaHostUrl}?autologin=true`,
      },
    ]
  }, [vaultaHostUrl, custosHostUrl, looplyHostUrl, orchaHostUrl, quoreHostUrl])

  const onResize = useCallback(() => {
    if (containerRef.current) {
      if (containerRef.current.offsetWidth <= 1280) {
        setIsExpanded(false)
      }
    }
  }, [])

  useEffect(() => {
    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

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

        <Header withSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} apps={apps} />

        <main className="main-content w-full">
          <div className="max-width-screen h-full">
            <Outlet key={location.pathname} />
          </div>
        </main>
      </div>
    </div>
  )
}
