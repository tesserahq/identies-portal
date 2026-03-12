/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  fetchApplications,
  fetchApplicationDetail,
  createApplication,
  updateApplication,
  deleteApplication,
} from '@/resources/queries/applications/application.queries'
import {
  ApplicationFormData,
  ApplicationType,
} from '@/resources/queries/applications/application.type'
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
export const applicationQueryKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...applicationQueryKeys.lists(), config, params] as const,
  details: () => [...applicationQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching paginated applications
 */
export function useApplications(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: applicationQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchApplications(config, params)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for fetching application detail
 */
export function useApplication(
  config: IQueryConfig,
  applicationId: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: applicationQueryKeys.detail(applicationId),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchApplicationDetail(config, applicationId)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(applicationId),
  })
}

/**
 * Hook for creating application
 */
export function useCreateApplication(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: ApplicationType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ApplicationFormData): Promise<ApplicationType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await createApplication(config, data)
    },
    onSuccess: (data) => {
      // Invalidate and refetch application lists
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.lists() })

      toast.success('Application created successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to create application', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for updating application
 */
export function useUpdateApplication(
  config: IQueryConfig,
  applicationId: string,
  options?: {
    onSuccess?: (data: ApplicationType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: Partial<ApplicationFormData>): Promise<ApplicationType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await updateApplication(config, applicationId, updateData)
    },
    onSuccess: (data) => {
      // Update specific item cache
      queryClient.setQueryData(applicationQueryKeys.detail(applicationId), data)

      // Invalidate and refetch application lists
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.lists() })

      toast.success('Application updated successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to update application', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for deleting application
 */
export function useDeleteApplication(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (applicationId: string): Promise<void> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await deleteApplication(config, applicationId)
    },
    onSuccess: (_, applicationId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: applicationQueryKeys.detail(applicationId) })

      // Invalidate and refetch application lists
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.lists() })

      toast.success('Application deleted successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.()
    },
    onError: (error: QueryError) => {
      toast.error('Failed to delete application', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}
