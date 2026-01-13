/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiKeyType } from '@/resources/queries/api-keys'
import { ApiKeyFormData } from '@/resources/queries/api-keys'
import {
  fetchServiceAccounts,
  fetchServiceAccountDetail,
  createServiceAccount,
  updateServiceAccount,
  deleteServiceAccount,
  createServiceAccountApiKey,
  fetchServiceAccountApiKeys,
} from '@/resources/queries/service-accounts/service-account.queries'
import {
  ServiceAccountQueryConfig,
  ServiceAccountQueryParams,
  ServiceAccountType,
  ServiceAccountFormData,
} from '@/resources/queries/service-accounts/service-account.type'
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
 * Service Account query keys for React Query Caching
 */
export const serviceAccountQueryKeys = {
  all: ['service-accounts'] as const,
  lists: () => [...serviceAccountQueryKeys.all, 'list'] as const,
  list: (config: ServiceAccountQueryConfig, params: ServiceAccountQueryParams) =>
    [...serviceAccountQueryKeys.lists(), config, params] as const,
  details: () => [...serviceAccountQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceAccountQueryKeys.details(), id] as const,
  apiKeys: () => [...serviceAccountQueryKeys.all, 'api-keys'] as const,
  apiKeysList: (serviceAccountId: string) =>
    [...serviceAccountQueryKeys.apiKeys(), serviceAccountId] as const,
  apiKey: (id: string) => [...serviceAccountQueryKeys.apiKeys(), id] as const,
}

/**
 * Hook for fetching paginated service accounts
 * @config - Service account query configuration
 * @params - Service account query parameters
 * @options - Service account query options
 */
export function useServiceAccounts(
  config: ServiceAccountQueryConfig,
  params: ServiceAccountQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: serviceAccountQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchServiceAccounts(config, params)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for fetching service account detail
 * @serviceAccountId - Service account ID
 * @config - Service account query configuration
 * @options - Service account query options
 */
export function useServiceAccount(
  config: ServiceAccountQueryConfig,
  serviceAccountId: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: serviceAccountQueryKeys.detail(serviceAccountId),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchServiceAccountDetail(serviceAccountId, config)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(serviceAccountId),
  })
}

/**
 * Hook for creating service account
 */
export function useCreateServiceAccount(
  config: ServiceAccountQueryConfig,
  options?: {
    onSuccess?: (data: ServiceAccountType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ServiceAccountFormData): Promise<ServiceAccountType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await createServiceAccount(config, data)
    },
    onSuccess: (data) => {
      // Invalidate and refetch service accounts lists
      queryClient.invalidateQueries({ queryKey: serviceAccountQueryKeys.lists() })

      toast.success('Service account created successfully!')

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to create service account', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for updating service account
 */
export function useUpdateServiceAccount(
  config: ServiceAccountQueryConfig,
  serviceAccountId: string,
  options?: {
    onSuccess?: (data: ServiceAccountType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updateData: Partial<ServiceAccountFormData>
    ): Promise<ServiceAccountType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await updateServiceAccount(config, serviceAccountId, updateData)
    },
    onSuccess: (data) => {
      // Update specific item cache
      queryClient.setQueryData(serviceAccountQueryKeys.detail(serviceAccountId), data)

      // Invalidate and refetch service accounts lists
      queryClient.invalidateQueries({ queryKey: serviceAccountQueryKeys.lists() })

      toast.success('Service account updated successfully!')

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to update service account', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for deleting service account
 */
export function useDeleteServiceAccount(
  config: ServiceAccountQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (serviceAccountId: string): Promise<void> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await deleteServiceAccount(config, serviceAccountId)
    },
    onSuccess: (_, serviceAccountId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: serviceAccountQueryKeys.detail(serviceAccountId) })

      // Invalidate and refetch service accounts lists
      queryClient.invalidateQueries({ queryKey: serviceAccountQueryKeys.lists() })

      toast.success('Service account deleted successfully!')

      options?.onSuccess?.()
    },
    onError: (error: QueryError) => {
      toast.error('Failed to delete service account', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * SERVICE ACCOUNT API KEYS
 */

export function useServiceAccountApiKeys(
  config: ServiceAccountQueryConfig,
  serviceAccountId: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: serviceAccountQueryKeys.apiKeysList(serviceAccountId),
    queryFn: async () => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await fetchServiceAccountApiKeys(serviceAccountId, config)
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(serviceAccountId),
  })
}

export function useCreateServiceAccountApiKey(
  config: ServiceAccountQueryConfig,
  serviceAccountId: string,
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

      return await createServiceAccountApiKey(config, serviceAccountId, data)
    },
    onSuccess: (data) => {
      // Invalidate and refetch service account API keys list
      queryClient.invalidateQueries({
        queryKey: serviceAccountQueryKeys.apiKeysList(serviceAccountId),
      })

      console.log('success create api key ', data)

      toast.success('Service account api-key created successfully!')
      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to create service account api-key', {
        description: error?.message || 'Please try again.',
      })
      options?.onError?.(error)
    },
  })
}
