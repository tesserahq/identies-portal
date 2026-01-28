import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn/ui/tooltip'
import { cn } from '@shadcn/lib/utils'
import { Link, useLocation } from 'react-router'
import { ISidebarPanelProps } from './types'
import { Home } from 'lucide-react'
import { Separator } from '@/modules/shadcn/ui/separator'

export function SidebarPanelMin({ menuItems, type }: ISidebarPanelProps) {
  const { pathname } = useLocation()

  const isMenuActive = (menuPath: string) => {
    return pathname === menuPath || pathname.startsWith(menuPath + '/')
  }

  return (
    <div className="sidebar-panel-min">
      <div className="dark:bg-sidebar-background flex h-full flex-col items-center bg-white">
        {/* Sidebar Panel Min Body */}
        <div className="flex h-[calc(100%-4.5rem)] grow flex-col">
          <div className="is-scrollbar-hidden">
            <ul className={cn('sidebar-nav mt-2 space-y-1')}>
              {type === 'accounts' && (
                <li className="overflow-hidden rounded">
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/users">
                          <Home className="size-4 group-hover:text-primary text-muted-foreground" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Home</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Separator />
                </li>
              )}
              {menuItems.map((item) => (
                <div key={item.title}>
                  <li className="overflow-hidden rounded">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={cn('', isMenuActive(item.path) && 'active')}>
                            {item.icon}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.title}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>

                  {item.divider && (
                    <hr className="my-2 border-t border-slate-200 dark:border-slate-700" />
                  )}
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
