import { useUpdateUser } from './use-user'
import { UserQueryConfig, UserType } from '@/resources/queries/user/user.type'
import { useSubmit } from 'react-router'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { useTheme as useSystemTheme } from '@/hooks/useTheme'

/**
 * Hook for updating user theme preference
 * Updates both the API and the web theme cookie
 */
export function useUpdateTheme(
  config: UserQueryConfig,
  options?: {
    onSuccess?: (data: UserType) => void
    onError?: (error: Error) => void
  }
) {
  const submit = useSubmit()
  const systemTheme = useSystemTheme()

  const { mutateAsync: updateUser } = useUpdateUser(config, {
    onSuccess: (data) => {
      // Update web theme cookie
      // Use current system theme value (it's reactive)
      const actualTheme = data.theme_preference === 'system' ? systemTheme : data.theme_preference
      submit(
        { theme: actualTheme },
        {
          method: 'POST',
          action: THEME_PATH,
          navigate: false,
          fetcherKey: 'theme-fetcher',
        }
      )

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      options?.onError?.(error)
    },
  })

  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    await updateUser({
      theme_preference: theme,
    })
  }

  return { updateTheme }
}
