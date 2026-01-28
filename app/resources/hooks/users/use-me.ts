/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig } from '@/resources/queries'
import { UserFormData, UserType } from '@/resources/queries/users'
import { fetchMe, updateMe } from '@/resources/queries/users/user.queries'
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
 * User query keys for React Query Caching
 */
export const userQueryKeys = {
  all: ['user'] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: () => [...userQueryKeys.details()] as const,
}

/**
 * Hook for fetching user
 * @config - User query configuration
 * @options - User query options
 */
export function useUser(
  config: IQueryConfig,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: userQueryKeys.detail(),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchMe(config)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for updating user
 */
export function useUpdateUser(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: UserType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: Partial<UserFormData>): Promise<UserType> => {
      // Check token in mutation function instead of during hook initialization
      // This allows the hook to be called even when token is not yet available
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }
      return await updateMe(config, updateData)
    },
    onSuccess: (data: UserType) => {
      // Update user cache
      queryClient.setQueryData(userQueryKeys.detail(), data)

      toast.success('User updated successfully!')

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to update user', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}
