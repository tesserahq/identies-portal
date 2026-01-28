/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import { fetchUsers, getUser } from '@/resources/queries/users/user.queries'
import { UserType } from '@/resources/queries/users'
import { useQuery } from '@tanstack/react-query'

/**
 * Custom error class for query errors
 */
class QueryError extends Error {
  code?: string
  details?: unknown

  constructor(message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'QueryError'
    this.code = code
    this.details = details
  }
}

/**
 * Users query keys for React Query Caching
 */
export const usersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...usersQueryKeys.lists(), config, params] as const,
  details: () => [...usersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching paginated users
 * @config - User query configuration
 * @params - User query parameters
 * @options - User query options
 */
export function useUsers(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: usersQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchUsers(config, params)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for fetching user detail by ID
 * @config - User query configuration
 * @userId - User ID
 * @options - User query options
 */
export function useUserById(
  config: IQueryConfig,
  userId: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: usersQueryKeys.detail(userId),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getUser(config, userId)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(userId),
  })
}
