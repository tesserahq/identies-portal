/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createUserApiKey,
  fetchUserApiKeys,
  fetchUsers,
  getUser,
} from '@/resources/queries/users/user.queries'
import { ApiKeyFormData, ApiKeyType } from '@/resources/queries/api-keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
  apiKeys: () => [...usersQueryKeys.all, 'api-keys'] as const,
  apiKeysList: (userId: string) => [...usersQueryKeys.apiKeys(), userId] as const,
  apiKey: (id: string) => [...usersQueryKeys.apiKeys(), id] as const,
  clients: (userId: string) => [...usersQueryKeys.all, 'clients', userId] as const,
  clientsList: (userId: string, params: IQueryParams) =>
    [...usersQueryKeys.clients(userId), params] as const,
  client: (userId: string, id: string) =>
    [...usersQueryKeys.clients(userId), 'detail', id] as const,
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

/**
 * USERS API KEYS
 */

export function useUserApiKeys(
  config: IQueryConfig,
  userId: string,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: [...usersQueryKeys.apiKeysList(userId), params],
    queryFn: async () => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await fetchUserApiKeys(userId, config, params)
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(userId),
  })
}

export function useCreateUserApiKey(
  config: IQueryConfig,
  userId: string,
  options?: {
    onSuccess?: (data: ApiKeyType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ApiKeyFormData): Promise<ApiKeyType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await createUserApiKey(config, userId, data)
    },
    onSuccess: (data) => {
      // Invalidate and refetch user API keys list
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.apiKeysList(userId),
      })

      toast.success('User api-key created successfully!', {
        duration: 3000,
      })
      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to create user api-key', {
        description: error?.message || 'Please try again.',
      })
      options?.onError?.(error)
    },
  })
}
