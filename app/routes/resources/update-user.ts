import type { ActionFunctionArgs } from 'react-router'
import { fetchApi } from '@/libraries/fetch'

export const ROUTE_PATH = '/resources/update-user' as const

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const { token, theme } = Object.fromEntries(await request.formData())

  if (!token) {
    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'Unauthorized',
          description: 'Please login first',
        },
      },
      { status: 401 }
    )
  }

  try {
    const updatedUser = await fetchApi(`${apiUrl}/user`, token.toString(), nodeEnv, {
      method: 'PUT',
      body: JSON.stringify({ theme_preference: theme }),
    })

    return Response.json(
      {
        toast: {
          type: 'success',
          title: 'Success',
          description: 'Successfully update theme',
        },
        response: updatedUser.theme_preference,
      },
      { status: 200 }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const convertError = {
      status: 500,
      error: err?.message || 'Unknown error',
    }

    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'Server Error',
          description: convertError.error,
        },
      },
      { status: convertError.status }
    )
  }
}
