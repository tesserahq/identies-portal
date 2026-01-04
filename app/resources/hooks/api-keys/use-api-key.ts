import {
  fetchApiKeys,
  fetchApiKeyDetail,
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from '@/resources/queries/api-keys/api-key.queries'
import {
  ApiKeyQueryConfig,
  ApiKeyQueryParams,
  ApiKeyType,
  ApiKeyFormData,
} from '@/resources/queries/api-keys/api-key.type'
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
  list: (config: ApiKeyQueryConfig, params: ApiKeyQueryParams) =>
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
  config: ApiKeyQueryConfig,
  params: ApiKeyQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useQuery({
    queryKey: apiKeyQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        return await fetchApiKeys(config, params)
      } catch (error) {
        throw new QueryError('Failed to fetch API keys', 'FETCH_ERROR', error)
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
export function useApiKeyDetail(
  config: ApiKeyQueryConfig,
  apiKeyId: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useQuery({
    queryKey: apiKeyQueryKeys.detail(apiKeyId),
    queryFn: async () => {
      try {
        return await fetchApiKeyDetail(apiKeyId, config)
      } catch (error) {
        throw new QueryError('Failed to fetch API key detail', 'FETCH_ERROR', error)
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
  config: ApiKeyQueryConfig,
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
  config: ApiKeyQueryConfig,
  apiKeyId: string,
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
    mutationFn: async (updateData: Partial<ApiKeyFormData>): Promise<ApiKeyType> => {
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
 * Hook for deleting API key
 */
export function useDeleteApiKey(
  config: ApiKeyQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useMutation({
    mutationFn: async (apiKeyId: string): Promise<void> => {
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
