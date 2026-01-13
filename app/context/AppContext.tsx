/* eslint-disable @typescript-eslint/no-explicit-any */
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router'
import React, { useEffect, useState } from 'react'
import { UserType } from '@/resources/queries/user'

export interface IContextProps {
  user: UserType | null
  token: string | null
  isLoading: boolean
  setUser: (user: UserType) => void
}

const AppContext = React.createContext<IContextProps>({
  token: null,
  user: null,
  isLoading: true,
  setUser: () => null,
})

interface IProviderProps {
  children: React.ReactNode
  identiesApiUrl: string
  nodeEnv: NodeENVType
}

export function AppProvider({ children, identiesApiUrl, nodeEnv }: IProviderProps) {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  const [user, setUser] = useState<UserType | null>(null)
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const handleApiError = useHandleApiError()
  const [loadingAuth0, setLoadingAuth0] = useState<boolean>(true)

  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      const user = await fetchApi(`${identiesApiUrl}/user`, token, nodeEnv)

      setUser(user)
      setToken(token)
    } catch (error: any) {
      handleApiError!(error?.message || 'Error when get token')
    } finally {
      setLoadingAuth0(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/', { replace: true })
      return
    } else if (isAuthenticated) {
      fetchToken()
    }
  }, [isLoading])

  const contextPayload = React.useMemo(
    () => ({
      token: token,
      user: user || null,
      isLoading: loadingAuth0,
      setUser: (user: UserType) => setUser(user),
    }),
    [user, token, loadingAuth0]
  )

  return <AppContext.Provider value={contextPayload}>{children}</AppContext.Provider>
}

export const useApp = (): IContextProps => {
  const context = React.useContext(AppContext)

  if (!context) {
    throw new Error('useCoreUI must be used within an IdentiesProvider')
  }

  return context
}
