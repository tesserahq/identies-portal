import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getStatusCode } from '../utils/get-status-code'

const handle403 = (error: Error) => {
  if (getStatusCode(error) !== 403) return
  toast.error('Access Denied', {
    description: "You don't have permission to do this. Please contact your administrator.",
    duration: 10000,
  })

  // if (typeof window !== 'undefined' && window.location.pathname !== '/403') {
  //   const navigated = navigateTo('/403')
  //   if (!navigated) {
  //     window.location.assign('/403')
  //   }
  // }
}

/**
 * React Query Client Configuration
 * Centralized configuration for all queries and mutations
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handle403(error)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handle403(error)
    },
  }),
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 1000 * 60 * 5,

      // Time before inactive queries are garbage collected (30 minutes)
      gcTime: 1000 * 60 * 30,

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when reconnecting
      refetchOnMount: true, // Refetch on component mount

      // Retry configuration
      retry: 1, // Retry failed queries once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
    },
  },
})
