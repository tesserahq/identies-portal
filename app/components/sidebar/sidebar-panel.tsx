import { cn } from '@shadcn/lib/utils'
import { Link, useLocation } from 'react-router'
import { ISidebarPanelProps } from './types'
import { ArrowLeftIcon } from 'lucide-react'
import { Separator } from '@/modules/shadcn/ui/separator'
import '@/styles/sidebar.css'

export function SidebarPanel({ menuItems }: ISidebarPanelProps) {
  const { pathname } = useLocation()

  const isMenuActive = (menuPath: string) => {
    return pathname === menuPath || pathname.startsWith(menuPath + '/')
  }

  return (
    <div
      className="sidebar-panel bg-peat-50 dark:bg-sidebar-background flex h-full grow flex-col
        justify-between bg-white">
      <div className="flex w-full flex-col">
        {/* Sidebar Panel Body */}
        <div className="sidebar-body">
          <div className="is-scrollbar-hidden grow overflow-y-auto">
            <Link to="/users" className="px-4 py-3 flex items-center gap-2 group">
              <ArrowLeftIcon className="size-4 group-hover:text-primary text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                Back to home
              </span>
            </Link>
            <Separator />
            <div className="px-5 pt-4 pb-1 block text-xs uppercase text-muted-foreground">
              <h2>Account Settings</h2>
            </div>
            <ul className="sidebar-nav mt-2">
              {menuItems.map((item) => (
                <div key={item.path}>
                  <li
                    className={cn(
                      `flex items-center justify-between border border-transparent overflow-hidden
                      rounded-lg `,
                      isMenuActive(item.path) && 'bg-accent hover:bg-accent border-primary'
                    )}>
                    <Link to={item.path} className={cn('w-full', isMenuActive(item.path) && '')}>
                      {item.icon}
                      {item.title}
                    </Link>
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
