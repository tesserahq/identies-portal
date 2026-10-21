/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/ui/avatar'
import { Card, CardContent } from '@shadcn/ui/card'
import { AvatarPreloader } from '@/components/loader/avatar-preloader'
import { userProviders } from '@/constants/user-providers'
import { cn } from '@shadcn/lib/utils'
import { Mail, PenTool } from 'lucide-react'
import { FetcherWithComponents } from 'react-router'
import { UserType } from '@/resources/queries/users'

interface ProfileHeaderProps {
  user: UserType
  avatarFetcher: FetcherWithComponents<any>
  loaded: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onAvatarLoad: () => void
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ProfileHeader = ({
  user,
  avatarFetcher,
  loaded,
  fileInputRef,
  onAvatarLoad,
  onAvatarChange,
}: ProfileHeaderProps) => {
  const avatarSrc = user?.avatar_url || '/images/default-user-avatar.jpg'
  const userProvider = userProviders.find((provider) => provider.name === user?.provider)

  return (
    <Card className="m-5 mb-4 w-full border lg:max-w-5xl">
      <CardContent className="flex flex-col items-center gap-8 p-8 md:flex-row md:items-start">
        {/* Avatar */}
        <div className="group relative inline-block">
          <Avatar className={cn('h-32 w-32', !avatarSrc && 'ring-border')}>
            {avatarFetcher.state !== 'idle' || !loaded ? (
              <AvatarPreloader />
            ) : (
              <>
                <label
                  className={cn(
                    'group relative shrink-0 cursor-pointer transition-all duration-500',
                    loaded ? 'opacity-100' : 'opacity-0'
                  )}>
                  <AvatarImage
                    src={avatarSrc}
                    onLoad={onAvatarLoad}
                    className={`z-0 h-32 w-32 rounded-full border-4 object-cover shadow-lg
                      transition-all duration-500 group-hover:border-primary
                      ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <AvatarFallback className="relative">
                    <img
                      src="/images/default-user-avatar.jpg"
                      alt="default-avatar"
                      className="h-32 w-32"
                    />
                  </AvatarFallback>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="avatar_img"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarChange}
                  />
                </label>
              </>
            )}
          </Avatar>
          {avatarFetcher.state === 'idle' && loaded && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 z-20 flex items-center rounded-full border-2
                border-border bg-card px-2 py-2 shadow-lg transition-all duration-300">
              <div className="flex items-center transition-all duration-300">
                <PenTool className="h-4 w-4 shrink-0 scale-y-[-1] text-primary" />
                <span
                  className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium
                    text-primary transition-all duration-300 group-hover:max-w-[100px]">
                  {' '}
                  Change Photo
                </span>
              </div>
            </button>
          )}
        </div>
        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="mb-2 text-3xl font-bold">
            {user?.first_name} {user?.last_name}
          </h1>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Mail size={20} />
              <span>{user?.email}</span>
            </div>
            {user?.provider && (
              <div className="flex items-center gap-2">
                <img src={userProvider?.icon} alt="provider" className="h-5 w-5 rounded-[4px]" />
                <span>Connected via {userProvider?.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
