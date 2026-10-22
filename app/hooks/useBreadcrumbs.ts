/* eslint-disable @typescript-eslint/no-explicit-any */
import { type QueryKey, useQueries } from '@tanstack/react-query'
import { NodeENVType } from '@/libraries/fetch'
import { BreadcrumbItemData } from 'tessera-ui'
import { IQueryConfig } from '@/resources/queries'
import { getUser } from '@/resources/queries/users/user.queries'
import { fetchApiKeyDetail } from '@/resources/queries/api-keys'
import { fetchApplicationDetail } from '@/resources/queries/applications'
import { fetchServiceAccountDetail } from '@/resources/queries/service-accounts'
import { fetchClient } from '@/resources/queries/clients'
import { usersQueryKeys } from '@/resources/hooks/users'
import { apiKeyQueryKeys } from '@/resources/hooks/api-keys'
import { applicationQueryKeys } from '@/resources/hooks/applications'
import { serviceAccountQueryKeys } from '@/resources/hooks/service-accounts'
import { generateBreadcrumbs } from '@/utils/helpers/breadcumb.helper'

/**
 * Resource state per breadcrumb
 */
export type BreadcrumbResourceState<T = any> = {
  data?: T
  isLoading: boolean
  error?: Error | null
}

/**
 * Breadcrumb hook config
 */
interface BreadcrumbConfigType {
  pathname: string
  params: Record<string, string | undefined>
  token: string
  apiUrl: string
  nodeEnv: NodeENVType
}

/**
 * Internal query config
 */
type BreadcrumbQueryConfig = {
  paramKey: string
  queryKey: QueryKey
  queryFn: () => Promise<any>
  enabled: boolean
  staleTime: number
}

type BreadcrumbFetcher = {
  queryKey: (id: string, params: BreadcrumbConfigType['params']) => QueryKey
  fetch: (config: IQueryConfig, id: string) => Promise<any>
}

/**
 * Fetcher registry (NO HOOKS)
 */
const breadcrumbFetchers: Record<string, BreadcrumbFetcher> = {
  userID: {
    queryKey: (id) => usersQueryKeys.detail(id),
    fetch: getUser,
  },
  apiKeyID: {
    queryKey: (id) => apiKeyQueryKeys.detail(id),
    fetch: fetchApiKeyDetail,
  },
  serviceAccountID: {
    queryKey: (id) => serviceAccountQueryKeys.detail(id),
    fetch: fetchServiceAccountDetail,
  },
  applicationID: {
    queryKey: (id) => applicationQueryKeys.detail(id),
    fetch: fetchApplicationDetail,
  },
  clientID: {
    queryKey: (id, params) => {
      if (params.userID) return usersQueryKeys.client(params.userID, id)
      if (params.serviceAccountID) return serviceAccountQueryKeys.client(params.serviceAccountID, id)
      return ['breadcrumb', 'clientID', id]
    },
    fetch: fetchClient,
  },
}

export default function useBreadcrumb(config: BreadcrumbConfigType): BreadcrumbItemData[] {
  const { pathname, params, apiUrl, nodeEnv, token } = config

  const pathParts = pathname.split('/').filter(Boolean)

  const queriesConfig = pathParts
    .map((part) => {
      const matched = Object.entries(params).find(([, value]) => value === part)

      if (!matched) return null

      const [paramKey] = matched
      const resolver = breadcrumbFetchers[paramKey]

      if (!resolver) return null

      return {
        paramKey,
        queryKey: resolver.queryKey(part, params),
        queryFn: () => resolver.fetch({ apiUrl, token, nodeEnv }, part),
        enabled: Boolean(token),
        staleTime: 5 * 60 * 1000,
      }
    })
    .filter((q): q is BreadcrumbQueryConfig => q !== null)

  const queryResults = useQueries({
    queries: queriesConfig.map(({ paramKey: _paramKey, ...query }) => query),
  })

  /**
   * Build resource map WITH loading state
   */
  const resourceData = queriesConfig.reduce<Record<string, BreadcrumbResourceState>>(
    (acc, queryConfig, index) => {
      const result = queryResults[index]

      acc[queryConfig.paramKey] = {
        data: result?.data,
        isLoading: result?.isFetching ?? false,
        error: result?.error as Error | null,
      }

      return acc
    },
    {}
  )

  return generateBreadcrumbs({
    pathname,
    params,
    resourceData,
  })
}
