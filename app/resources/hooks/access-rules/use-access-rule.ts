/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  AccessRuleFormData,
  AccessRuleType,
  createAccessRule,
  deleteAccessRule,
  fetchAccessRuleDetail,
  fetchAccessRules,
  updateAccessRule,
} from '@/resources/queries/access-rules'
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
 * Application query keys for React Query Caching
 */
export const accessRuleQueryKeys = {
  all: ['access-rule'] as const,
  lists: () => [...accessRuleQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...accessRuleQueryKeys.lists(), config, params] as const,
  details: () => [...accessRuleQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...accessRuleQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching paginated resource
 */
export function useAccessRules(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: accessRuleQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchAccessRules(config, params)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for fetching resource detail
 */
export function useAccessRule(
  config: IQueryConfig,
  accessRuleID: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: accessRuleQueryKeys.detail(accessRuleID),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchAccessRuleDetail(config, accessRuleID)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(accessRuleID),
  })
}

/**
 * Hook for creating resource
 */
export function useCreateAccessRule(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: AccessRuleType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AccessRuleFormData): Promise<AccessRuleType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await createAccessRule(config, data)
    },
    onSuccess: (data) => {
      // Invalidate and refetch resource lists
      queryClient.invalidateQueries({ queryKey: accessRuleQueryKeys.lists() })

      toast.success('Access rule created successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to create Access rule', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for updating resource
 */
export function useUpdateAccessRule(
  config: IQueryConfig,
  accessRuleID: string,
  options?: {
    onSuccess?: (data: AccessRuleType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: Partial<AccessRuleFormData>): Promise<AccessRuleType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await updateAccessRule(config, accessRuleID, updateData)
    },
    onSuccess: (data) => {
      // Update specific item cache
      queryClient.setQueryData(accessRuleQueryKeys.detail(accessRuleID), data)

      queryClient.invalidateQueries({ queryKey: accessRuleQueryKeys.lists() })

      toast.success('Access rule updated successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to update Access rule', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for deleting resource
 */
export function useDeleteAccessRule(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accessRuleID: string): Promise<void> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await deleteAccessRule(config, accessRuleID)
    },
    onSuccess: (_, accessRuleID) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: accessRuleQueryKeys.detail(accessRuleID) })

      queryClient.invalidateQueries({ queryKey: accessRuleQueryKeys.lists() })

      toast.success('Access rule deleted successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.()
    },
    onError: (error: QueryError) => {
      toast.error('Failed to delete Access rule', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}
