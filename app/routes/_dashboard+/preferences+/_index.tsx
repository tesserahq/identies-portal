/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import AvatarPreloader from '@/components/misc/AvatarPreloader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MAX_AVATAR_FILE_SIZE } from '@/constants/file'
import { userProviders } from '@/constants/user-providers'
import { useTheme } from '@/hooks/useTheme'
import { fetchApi } from '@/libraries/fetch'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources+/update-theme'
import { ROUTE_PATH as USER_UPDATE_PATH } from '@/routes/resources+/update-user'
import { userSchema } from '@/schemas/user'
import type { TAsset } from '@/types/asset'
import { handleFetcherData } from '@/utils/fetcher.data'
import { cn } from '@/utils/misc'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useFetcher, useSubmit } from '@remix-run/react'
import { Mail, PenTool } from 'lucide-react'
import { useCoreUI, FormField } from 'core-ui'
import { DarkSkeleton, LightSkeleton, SystemSkeleton } from 'public/images/skeleton'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function Index() {
  const submit = useSubmit()
  const avatarFetcher = useFetcher()
  const userFetcher = useFetcher()
  const actionData = useActionData<typeof action>()
  const themeFetcher = useFetcher({ key: 'put_user' })
  const systemTheme = useTheme()
  const { user, token, loadingRequest, updateUser } = useCoreUI()
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [formData, setFormData] = useState({ first_name: '', last_name: '' })
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [loaded, setLoaded] = useState(false)
  const avatarSrc = user?.avatar_url || '/images/default-user-avatar.jpg'
  const isDirty =
    formData.first_name !== (user?.first_name ?? '') ||
    formData.last_name !== (user?.last_name ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLoadingState =
    userFetcher.state === 'submitting' ||
    avatarFetcher.state === 'submitting' ||
    themeFetcher.state === 'submitting'

  const handleAvatarLoad = () => {
    setTimeout(() => setLoaded(true), 100)
  }

  const onSetTheme = (value: 'light' | 'dark' | 'system') => {
    setSelectedTheme(value)
    const actualTheme = value === 'system' ? systemTheme : value
    submit(
      { theme: actualTheme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      },
    )
    themeFetcher.submit(
      { theme: value, token },
      {
        method: 'PUT',
        action: USER_UPDATE_PATH,
      },
    )
  }

  const userProvider = userProviders.find((provider) => provider.name === user?.provider)

  useEffect(() => {
    if (selectedTheme === 'system') {
      const actualTheme = systemTheme
      submit(
        { theme: actualTheme },
        {
          method: 'POST',
          action: THEME_PATH,
          navigate: false,
          fetcherKey: 'theme-fetcher',
        },
      )
    }
  }, [systemTheme])

  useEffect(() => {
    setFormData({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    })
    setLoaded(false)
    if (user?.theme_preference) {
      setSelectedTheme(user.theme_preference as 'light' | 'dark' | 'system')
    }
  }, [user])

  useEffect(() => {
    if (themeFetcher.data) {
      handleFetcherData(themeFetcher.data, (response: 'light' | 'dark' | 'system') => {
        if (user) {
          updateUser({
            ...user,
            theme_preference: response,
          })
        }
      })
    }
  }, [themeFetcher.data])

  useEffect(() => {
    if (avatarFetcher.data) {
      handleFetcherData(avatarFetcher.data, (response) => {
        updateUser(response)
      })
    }
  }, [avatarFetcher.data])

  useEffect(() => {
    if (userFetcher.data) {
      handleFetcherData(userFetcher.data, (response) => {
        updateUser(response)
      })
    }
  }, [userFetcher.data])

  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors)
    }
    if (actionData?.toast) {
      toast.error(actionData.toast.description, {
        duration: 10000,
      })
    }
  }, [actionData])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded) setLoaded(true) // stop preloader
    }, 1000)
    return () => clearTimeout(timeout)
  }, [loaded])

  const handleFieldChange = (name: string) => (value: string) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value }
      const field = userSchema.safeParse(updatedData)
      if (!field.success) {
        setErrors(field.error.flatten().fieldErrors)
      } else {
        setErrors({})
      }
      return updatedData
    })
  }

  const handleReset = () => {
    setFormData({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    })
    setErrors({})
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_AVATAR_FILE_SIZE) {
      toast.error('File size must be less than 1MB', {
        duration: 5000,
      })
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file', {
        duration: 5000,
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    const form = new FormData()
    form.set('token', token || '')
    form.set('_method', 'upload_avatar')
    form.set('user_id', user?.id?.toString() || '')
    form.set('full_name', `${user?.first_name} ${user?.last_name}`)
    form.set('avatar_img', file)

    avatarFetcher.submit(form, {
      method: 'POST',
      encType: 'multipart/form-data',
    })
  }

  const handleUserFormSubmit = () => {
    const form = new FormData()
    form.set('token', token || '')
    form.set('_method', 'put_user')
    form.set('first_name', formData?.first_name ?? '')
    form.set('last_name', formData?.last_name ?? '')

    userFetcher.submit(form, {
      method: 'PUT',
    })
  }

  if (loadingRequest) {
    return <AppPreloader />
  }

  return (
    <div className="flex animate-slide-up flex-col items-center px-[2%]">
      <Card className="m-5 mb-4 w-full animate-slide-up border lg:max-w-5xl">
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
                      'group relative flex-shrink-0 cursor-pointer transition-all duration-500',
                      loaded ? 'opacity-100' : 'opacity-0',
                    )}>
                    <AvatarImage
                      src={avatarSrc}
                      onLoad={handleAvatarLoad}
                      className={`z-0 h-32 w-32 rounded-full border-4 object-cover shadow-lg transition-all duration-500 group-hover:border-primary ${loaded ? 'opacity-100' : 'opacity-0'}`}
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
                      onChange={handleAvatarChange}
                    />
                  </label>
                </>
              )}
            </Avatar>
            {avatarFetcher.state === 'idle' && loaded && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 z-20 flex items-center rounded-full border-2 border-border bg-white px-2 py-2 shadow-lg transition-all duration-300 dark:bg-card">
                <div className="flex items-center transition-all duration-300">
                  <PenTool className="h-4 w-4 flex-shrink-0 scale-y-[-1] text-primary" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium text-primary transition-all duration-300 group-hover:max-w-[100px]">
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
                  <img
                    src={userProvider?.icon}
                    alt="provider"
                    className="h-5 w-5 rounded-[4px]"
                  />
                  <span>Connected via {userProvider?.label}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="m-5 mb-4 w-full animate-slide-up border lg:max-w-5xl">
        <CardHeader className="border-b p-5 pl-12">
          <CardTitle className="text-base font-medium">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full space-y-6 p-4 md:p-8">
            <div className="flex items-center gap-3">
              <FormField
                label="First Name"
                name="first_name"
                className="w-full"
                value={formData.first_name}
                onChange={handleFieldChange('first_name')}
                error={errors?.first_name?.[0]}
              />
            </div>
            <div className="flex items-center gap-3">
              <FormField
                label="Last Name"
                name="last_name"
                className="w-full"
                value={formData.last_name}
                onChange={handleFieldChange('last_name')}
                error={errors?.last_name?.[0]}
              />
            </div>
            <div className="flex items-center gap-3">
              <FormField
                label="Email"
                name="email"
                className="w-full"
                defaultValue={user?.email}
                disabled
                error={errors?.email?.[0]}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t pr-12 pt-4">
          <div className="flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoadingState || !isDirty}
              onClick={() => handleReset()}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleUserFormSubmit}
              disabled={
                isLoadingState ||
                Boolean(errors && Object.keys(errors).length) ||
                !isDirty
              }>
              {isLoadingState ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Card className="m-5 mb-4 w-full animate-slide-up border lg:max-w-5xl">
        <CardHeader className="border-b p-5 pl-12">
          <CardTitle className="text-base font-medium">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full space-y-6 p-4 md:p-8">
            <div className="flex items-center gap-3">
              <span className="mb-0 w-1/3">Theme mode</span>
              <span className="flex-1">Linden will use your selected theme</span>
            </div>
            <div className="flex gap-3">
              <span className="mb-0 w-1/3">
                Choose how Linden looks to you. Select a single theme, or sync with your
                system.
              </span>
              <div className="grid grid-cols-3 grid-rows-1 gap-4">
                <button
                  onClick={() => onSetTheme('light')}
                  className={`group flex w-48 flex-col gap-2 rounded-md border bg-gray-400/30 p-3 shadow-card hover:border-foreground/50 ${selectedTheme === 'light' ? 'border-foreground/50' : 'border-gray-500/30'}`}>
                  <LightSkeleton />
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full border group-hover:border-foreground/50 ${selectedTheme === 'light' ? 'border-foreground/50' : 'border-gray-500/30'} flex items-center justify-center`}>
                      <div
                        className={`h-2 w-2 rounded-full ${selectedTheme === 'light' ? 'bg-foreground' : ''}`}
                      />
                    </div>
                    <span>Light</span>
                  </div>
                </button>
                <button
                  onClick={() => onSetTheme('dark')}
                  className={`group flex w-48 flex-col gap-2 rounded-md border bg-gray-400/30 p-3 shadow-card hover:border-foreground/50 ${selectedTheme === 'dark' ? 'border-foreground/50' : 'border-gray-500/30'}`}>
                  <DarkSkeleton />
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full border group-hover:border-foreground/50 ${selectedTheme === 'dark' ? 'border-foreground/50' : 'border-gray-500/30'} flex items-center justify-center`}>
                      <div
                        className={`h-2 w-2 rounded-full ${selectedTheme === 'dark' ? 'bg-foreground' : ''}`}
                      />
                    </div>
                    <span>Dark</span>
                  </div>
                </button>
                <button
                  onClick={() => onSetTheme('system')}
                  className={`group flex w-48 flex-col gap-2 rounded-md border bg-gray-400/30 p-3 shadow-card hover:border-foreground/50 ${selectedTheme === 'system' ? 'border-foreground/50' : 'border-gray-500/30'}`}>
                  <SystemSkeleton />
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full border group-hover:border-foreground/50 ${selectedTheme === 'system' ? 'border-foreground/50' : 'border-gray-500/30'} flex items-center justify-center`}>
                      <div
                        className={`h-2 w-2 rounded-full ${selectedTheme === 'system' ? 'bg-foreground' : ''}`}
                      />
                    </div>
                    <span>System</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const vaultaApiUrl = process.env.VAULTA_API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { _method, token } = Object.fromEntries(formData)

  try {
    switch (_method) {
      case 'put_user': {
        const first_name = formData.get('first_name')
        const last_name = formData.get('last_name')

        const validated = userSchema.safeParse({ first_name, last_name })
        if (!validated.success) {
          return Response.json(
            {
              toast: {
                type: 'error',
                title: 'error',
                description: 'please fill the form accordingly',
              },
              errors: validated.error.flatten().fieldErrors,
            },
            { status: 400 },
          )
        }
        const response = await fetchApi(`${apiUrl}/user`, token.toString(), nodeEnv, {
          method: 'PUT',
          body: JSON.stringify({
            first_name,
            last_name,
          }),
        })
        return Response.json(
          {
            toast: {
              type: 'success',
              title: 'Success',
              description: 'Successfully update user data',
            },
            response,
          },
          { status: 200 },
        )
      }
      case 'upload_avatar': {
        const full_name = formData.get('full_name')
        const user_id = formData.get('user_id')
        const avatar_img = formData.get('avatar_img') as File

        const maxFileSize = 1 * 1024 * 1024
        if (avatar_img.size > maxFileSize) {
          return Response.json(
            {
              toast: {
                type: 'error',
                title: 'File too large',
                description: 'Avatar image must be less than 1MB.',
              },
            },
            { status: 413 },
          )
        }

        // Validate file type
        if (!avatar_img.type.startsWith('image/')) {
          return Response.json(
            {
              toast: {
                type: 'error',
                title: 'Invalid file type',
                description: 'Please upload a valid image file.',
              },
            },
            { status: 400 },
          )
        }

        const uploadPayload = new FormData()
        uploadPayload.set('name', full_name?.toString() || '')
        const labels = { user_id: user_id }
        uploadPayload.set('labels', JSON.stringify(labels))
        uploadPayload.set('file', avatar_img)

        const assetResponse = await fetch(`${vaultaApiUrl}/assets`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadPayload,
        })

        const assetData: TAsset = await assetResponse.json()

        const userResponse = await fetchApi(`${apiUrl}/user`, token.toString(), nodeEnv, {
          method: 'PUT',
          body: JSON.stringify({
            avatar_asset_id: assetData.asset_id,
          }),
        })

        return Response.json(
          {
            toast: {
              type: 'success',
              title: 'Success',
              description: 'Successfully update user data',
            },
            response: userResponse,
          },
          { status: 200 },
        )
      }
      default: {
        return Response.json(
          {
            toast: {
              type: 'error',
              title: 'Bad Request',
              description: 'Invalid method or form submission',
            },
          },
          { status: 400 },
        )
      }
    }
  } catch (error: any) {
    const convertError = {
      status: 500,
      error: error?.message || 'Unknown error',
    }
    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'Server Error',
          description: convertError.error,
        },
      },
      { status: convertError.status },
    )
  }
}
