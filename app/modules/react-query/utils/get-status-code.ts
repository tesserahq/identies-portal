export const getStatusCode = (error: Error): number | undefined => {
  const e = error as Error & {
    status?: number
    code?: string | number
    response?: { status?: number }
    details?: { status?: number; code?: string | number; response?: { status?: number } }
  }

  const extractFrom = (obj: typeof e | typeof e.details) => {
    if (typeof obj?.status === 'number') return obj.status
    if (typeof obj?.response?.status === 'number') return obj.response.status
    if (obj?.code === 403 || obj?.code === '403') return 403
  }

  return (
    extractFrom(e) ??
    extractFrom(e.details) ??
    (() => {
      try {
        const json = e.message.slice(e.message.indexOf('{'))
        return (JSON.parse(json) as { status?: number }).status
      } catch {
        return undefined
      }
    })()
  )
}
