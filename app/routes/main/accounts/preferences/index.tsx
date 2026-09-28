/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@shadcn/ui/card'
import { MAX_AVATAR_FILE_SIZE } from '@/constants/file'
import { useTheme } from 'tessera-ui/react-router'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { handleFetcherData } from '@/utils/helpers/fetcher.helper'
import { ActionFunctionArgs } from 'react-router'
import { useActionData, useFetcher, useSubmit } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { TAsset } from '@/resources/types/asset'
import { UserFormData, userToFormValues } from '@/resources/queries/users'
import { ProfileInformation, Appearance, ProfileHeader } from '@/components/preferences'
import { useApp } from 'tessera-ui'

export default function Index() {
  const submit = useSubmit()
  const avatarFetcher = useFetcher()
  const userFetcher = useFetcher()
  const actionData = useActionData<typeof action>()
  const systemTheme = useTheme()
  const { user, token, isLoadingIdenties, updateUser } = useApp()
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [formData, setFormData] = useState({ first_name: '', last_name: '' })
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [loaded, setLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLoadingState = userFetcher.state === 'submitting' || avatarFetcher.state === 'submitting'

  const handleAvatarLoad = () => {
    setTimeout(() => setLoaded(true), 100)
  }

  useEffect(() => {
    // Update web theme when system theme changes and user has system preference
    if (selectedTheme === 'system' && user?.theme_preference === 'system') {
      const actualTheme = systemTheme
      submit(
        { theme: actualTheme },
        {
          method: 'POST',
          action: THEME_PATH,
          navigate: false,
          fetcherKey: 'theme-fetcher',
        }
      )
    }
  }, [systemTheme, selectedTheme, user?.theme_preference])

  useEffect(() => {
    setFormData({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    })
    setLoaded(false)
    if (user?.theme_preference) {
      setSelectedTheme(user.theme_preference as 'light' | 'dark' | 'system')
      // onSetTheme(user?.theme_preference)
    }
  }, [user])

  useEffect(() => {
    if (avatarFetcher.data) {
      handleFetcherData(avatarFetcher.data, (response) => {
        void updateUser({ avatar_asset_id: response })
      })
    }
  }, [avatarFetcher.data, updateUser])

  useEffect(() => {
    if (userFetcher.data) {
      handleFetcherData(userFetcher.data, (response) => {
        // Prefer using the tessera-ui context updater to keep header/profile in sync.
        void updateUser(response)
      })
    }
  }, [userFetcher.data, updateUser])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded) setLoaded(true) // stop preloader
    }, 1000)
    return () => clearTimeout(timeout)
  }, [loaded])

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

  const handleUserSubmit = async (user: UserFormData) => {
    try {
      await updateUser({ first_name: user.first_name, last_name: user.last_name })
    } catch (error: any) {
      toast.error(error?.detail || error?.message || 'Failed to update user')
    }
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(theme)
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      }
    )
    try {
      await updateUser({ theme_preference: theme })
    } catch (error: any) {
      toast.error(error?.detail || error?.message || 'Failed to update theme')
    }
  }

  // Early return after hooks are called
  if (isLoadingIdenties || !token || !user) {
    return <AppPreloader />
  }

  // The lint error indicates userToFormValues expects a UserType, not a User.
  // Plus, the 'email' field must not be undefined.
  // We defensively normalize user.email to "" if missing.
  const safeUser = { ...user, email: user.email ?? '' }
  const defaultValues = userToFormValues(safeUser as any)

  return (
    <div className="flex flex-col items-center">
      <ProfileHeader
        user={{
          ...safeUser,
          theme_preference: safeUser.theme_preference as 'light' | 'dark' | 'system' | undefined,
        }}
        avatarFetcher={avatarFetcher}
        loaded={loaded}
        fileInputRef={fileInputRef}
        onAvatarLoad={handleAvatarLoad}
        onAvatarChange={handleAvatarChange}
      />

      <ProfileInformation defaultValues={defaultValues} onSubmit={handleUserSubmit} />

      <Appearance selectedTheme={selectedTheme} onThemeChange={handleThemeChange} />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const vaultaApiUrl = process.env.VAULTA_API_URL
  const formData = await request.formData()
  const { _method, token } = Object.fromEntries(formData)

  try {
    switch (_method) {
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
            { status: 413 }
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
            { status: 400 }
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

        return Response.json(
          {
            toast: {
              type: 'success',
              title: 'Success',
              description: 'Successfully uploaded avatar',
            },
            response: assetData.asset_id,
          },
          { status: 200 }
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
          { status: 400 }
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
      { status: convertError.status }
    )
  }
}
