/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createApiKey,
  deleteApiKey,
  fetchApiKeyDetail,
  fetchApiKeys,
  revokeApiKey,
  updateApiKey,
} from '@/resources/queries/api-keys/api-key.queries'
import { ApiKeyFormData, ApiKeyType } from '@/resources/queries/api-keys/api-key.type'
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
 * API Key query keys for React Query Caching
 */
export const apiKeyQueryKeys = {
  all: ['api-keys'] as const,
  lists: () => [...apiKeyQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...apiKeyQueryKeys.lists(), config, params] as const,
  details: () => [...apiKeyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiKeyQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching paginated API keys
 * @config - API key query configuration
 * @params - API key query parameters
 * @options - API key query options
 */
export function useApiKeys(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: apiKeyQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchApiKeys(config, params)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for fetching API key detail
 * @apiKeyId - API key ID
 * @config - API key query configuration
 * @options - API key query options
 */
export function useApiKey(
  config: IQueryConfig,
  apiKeyId: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: apiKeyQueryKeys.detail(apiKeyId),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchApiKeyDetail(config, apiKeyId)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(apiKeyId),
  })
}

/**
 * Hook for creating API key
 */
export function useCreateApiKey(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: ApiKeyType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useMutation({
    mutationFn: async (data: ApiKeyFormData): Promise<ApiKeyType> => {
      return await createApiKey(config, data)
    },
    onSuccess: (data) => {
      // Invalidate and refetch API keys lists
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() })

      toast.success('API key created successfully!')

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to create API key', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for updating API key
 */
export function useUpdateApiKey(
  config: IQueryConfig,
  apiKeyId: string,
  options?: {
    onSuccess?: (data: ApiKeyType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: Partial<ApiKeyFormData>): Promise<ApiKeyType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await updateApiKey(config, apiKeyId, updateData)
    },
    onSuccess: (data) => {
      // Update specific item cache
      queryClient.setQueryData(apiKeyQueryKeys.detail(apiKeyId), data)

      // Invalidate and refetch API keys lists
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() })

      toast.success('API key updated successfully!')

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to update API key', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for revoking API key
 */
export function useRevokeApiKey(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: ApiKeyType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (apiKeyId: string): Promise<ApiKeyType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await revokeApiKey(config, apiKeyId)
    },
    onSuccess: (data, apiKeyId) => {
      // Update specific item cache
      queryClient.setQueryData(apiKeyQueryKeys.detail(apiKeyId), data)

      // Invalidate and refetch API keys lists
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() })

      toast.success('API key revoked successfully!')

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to revoke API key', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for deleting API key
 */
export function useDeleteApiKey(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (apiKeyId: string): Promise<void> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await deleteApiKey(config, apiKeyId)
    },
    onSuccess: (_, apiKeyId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: apiKeyQueryKeys.detail(apiKeyId) })

      // Invalidate and refetch API keys lists
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() })

      toast.success('API key deleted successfully!')

      options?.onSuccess?.()
    },
    onError: (error: QueryError) => {
      toast.error('Failed to delete API key', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}
