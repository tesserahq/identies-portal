/**
 * Proxies application logo images to avoid cross-origin blocking.
 * The asset server (e.g. custos.mylinden.family) may send
 * Cross-Origin-Resource-Policy that prevents direct <img> usage from the portal.
 */
import type { LoaderFunctionArgs } from 'react-router'

export const ROUTE_PATH = '/resources/proxy-application-logo' as const

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const logoUrl = url.searchParams.get('url')

  if (!logoUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  if (!isValidHttpUrl(logoUrl)) {
    return new Response('Invalid url', { status: 400 })
  }

  try {
    const imageResponse = await fetch(logoUrl, {
      headers: {
        Accept: 'image/*',
      },
    })

    if (!imageResponse.ok) {
      return new Response('Upstream image not found', { status: 404 })
    }

    const contentType = imageResponse.headers.get('Content-Type') || 'image/png'
    const body = await imageResponse.arrayBuffer()

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new Response('Failed to fetch image', { status: 502 })
  }
}
