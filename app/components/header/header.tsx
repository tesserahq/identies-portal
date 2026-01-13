import { useRequestInfo } from '@/hooks/useRequestInfo'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { Avatar, AvatarImage } from '@shadcn/ui/avatar'
import { Button } from '@shadcn/ui/button'
import { Separator } from '@shadcn/ui/separator'
import { PanelLeft } from 'lucide-react'
import { Link, useSubmit } from 'react-router'
import AppMenus, { IAppMenusProps } from '../app-menus/app-menus'
import { ProfileMenu } from '../profile-menu/profile-menu'

interface IHeaderProps {
  appHostUrls: IAppMenusProps
  action?: React.ReactNode
  withSidebar?: boolean
  isExpanded?: boolean
  setIsExpanded?: (isExpanded: boolean) => void
}

export default function Header({
  isExpanded,
  setIsExpanded,
  action,
  withSidebar,
  appHostUrls,
}: IHeaderProps) {
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const onSetTheme = (value: string) => {
    submit(
      { theme: value },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      }
    )
  }

  return (
    <>
      <nav className="header animate-slide-down print:hidden">
        <div className="header-container relative flex w-full print:hidden">
          <div className="flex w-full items-center justify-between space-x-5">
            {/* Left content */}
            <div className="flex items-center gap-2">
              <Link to="/" className="mr-2">
                <div className="flex items-center gap-2 lg:ml-0">
                  <Avatar className="avatar-hover">
                    <AvatarImage src="/images/logo.png" />
                  </Avatar>
                  <span className="text-base font-bold">{SITE_CONFIG.siteTitle}</span>
                </div>
              </Link>
              {withSidebar && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsExpanded!(!isExpanded)}
                  className="h-8 w-8">
                  <PanelLeft />
                </Button>
              )}

              {action && (
                <Separator
                  orientation="vertical"
                  className="mr-1.5 h-3 bg-slate-400 dark:bg-slate-500"
                />
              )}
              {action}
            </div>

            {/* Right content */}
            <div className="-mr-1 flex items-center space-x-5">
              {/* Apps Menu */}
              <AppMenus appHostUrls={appHostUrls} />

              <ProfileMenu
                selectedTheme={requestInfo.userPrefs.theme || 'system'}
                onSetTheme={(theme) => onSetTheme(theme)}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
