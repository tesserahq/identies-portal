import { IMenuItemProps, SidebarPanel } from '@/components/sidebar'
import { Key, User } from 'lucide-react'
import { Outlet } from 'react-router'

export default function AccountsLayout() {
  const accountsMenuItems: IMenuItemProps[] = [
    {
      title: 'Preferences',
      path: '/accounts/preferences',
      icon: <User size={18} />,
    },
    {
      title: 'API Keys',
      path: '/accounts/api-keys',
      icon: <Key size={18} />,
    },
  ]

  return (
    <div className="pt-[60px] is-sidebar-open">
      <div className="sidebar print:hidden">
        <SidebarPanel menuItems={accountsMenuItems} />
      </div>
      <Outlet />
    </div>
  )
}
