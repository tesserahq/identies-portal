import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { navigateTo } from '@/lib/navigation-bridge'

type HttpErrorShape = {
  status?: number
  response?: {
    status?: number
  }
  code?: string | number
  details?: unknown
  message?: string
}

const getStatusCode = (error: unknown): number | undefined => {
  const e = error as HttpErrorShape

  if (typeof e?.status === 'number') return e.status
  if (typeof e?.response?.status === 'number') return e.response.status

  if (e?.code === 403 || e?.code === '403') return 403

  const details = e?.details as
    | { status?: number; response?: { status?: number }; code?: string | number }
    | undefined
  if (typeof details?.status === 'number') return details.status
  if (typeof details?.response?.status === 'number') return details.response.status
  if (details?.code === 403 || details?.code === '403') return 403

  // Fallback for errors like: QueryError: {"status":403,"error":"Access denied"}
  if (typeof e?.message === 'string') {
    const jsonStart = e.message.indexOf('{')
    if (jsonStart !== -1) {
      try {
        const parsed = JSON.parse(e.message.slice(jsonStart)) as { status?: number }
        if (typeof parsed?.status === 'number') return parsed.status
      } catch {
        return undefined
      }
    }
  }

  return undefined
}

const is403 = (error: unknown) => {
  return getStatusCode(error) === 403
}

let isHandling403 = false

const handle403 = () => {
  if (isHandling403) return
  isHandling403 = true

  toast.error('Access Denied', {
    description: "You don't have permission to do this. Please contact your administrator.",
    duration: 5000,
  })

  // if (typeof window !== 'undefined' && window.location.pathname !== '/403') {
  //   const navigated = navigateTo('/403')
  //   if (!navigated) {
  //     window.location.assign('/403')
  //   }
  // }

  setTimeout(() => {
    isHandling403 = false
  }, 1000)
}

/**
 * React Query Client Configuration
 * Centralized configuration for all queries and mutations
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (is403(error)) handle403()
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (is403(error)) handle403()
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
