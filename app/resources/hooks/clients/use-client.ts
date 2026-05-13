/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  ClientFormData,
  ClientType,
  createClient,
  deleteCliente,
  fetchClient,
  fetchClients,
  ResourceClientUrlEnum,
  updateClient,
} from '@/resources/queries/clients'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersQueryKeys } from '../users'
import { serviceAccountQueryKeys } from '../service-accounts'

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
 * Hook for fetching resource
 */
export function useClients(
  config: IQueryConfig,
  params: IQueryParams,
  resourceClientEnum: ResourceClientUrlEnum,
  resourceID: string,
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: queryKey.clientsList(resourceID, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchClients(config, resourceClientEnum, resourceID)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for fetching resource detail
 */
export function useClient(
  config: IQueryConfig,
  resourceID: string,
  clientID: string,
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: queryKey.client(resourceID, clientID),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await fetchClient(config, clientID)
      } catch (error: any) {
        throw new QueryError(error.message)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && Boolean(clientID),
  })
}

/**
 * Hook for creating resource
 */
export function useCreateClient(
  config: IQueryConfig,
  resourceClientEnum: ResourceClientUrlEnum,
  resourceID: string,
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys,
  options?: {
    onSuccess?: (data: ClientType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ClientFormData): Promise<ClientType> => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await createClient(config, resourceClientEnum, resourceID, data)
    },
    onSuccess: (data) => {
      // Invalidate and refetch resource lists
      queryClient.invalidateQueries({ queryKey: queryKey.clients(resourceID) })

      toast.success('Client created successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to create Client', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for updating resource
 */
export function useRevokeClient(
  config: IQueryConfig,
  resourceID: string,
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys,
  options?: {
    onSuccess?: (data: ClientType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ClientType) => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await updateClient(config, data.id)
    },
    onSuccess: (data, clientData) => {
      // Update specific item cache
      queryClient.invalidateQueries({ queryKey: queryKey.client(resourceID, clientData.id) })

      toast.success('Client revoked successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.(data)
    },
    onError: (error: QueryError) => {
      toast.error('Failed to revoke client', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook for deleting resource
 */
export function useDeleteClient(
  config: IQueryConfig,
  resourceID: string,
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ClientType) => {
      if (!config.token) {
        throw new QueryError('Token is required', 'TOKEN_REQUIRED')
      }

      return await deleteCliente(config, data.id)
    },
    onSuccess: (_, data) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKey.client(resourceID, data.id) })

      queryClient.invalidateQueries({ queryKey: queryKey.clients(resourceID) })

      toast.success('Client deleted successfully!', {
        duration: 3000,
      })

      options?.onSuccess?.()
    },
    onError: (error: QueryError) => {
      toast.error('Failed to delete Client', {
        description: error?.message || 'Please try again.',
      })

      options?.onError?.(error)
    },
  })
}
