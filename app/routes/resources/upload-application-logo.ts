/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActionFunctionArgs } from 'react-router'
import { MAX_FILE_SIZE } from '@/constants/file'
import { TAsset } from '@/resources/types/asset'

export const ROUTE_PATH = '/resources/upload-application-logo' as const

export async function action({ request }: ActionFunctionArgs) {
  const vaultaApiUrl = process.env.VAULTA_API_URL
  const formData = await request.formData()
  const { token, name } = Object.fromEntries(formData)

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

  const logoImg = formData.get('logo_img') as File | null

  if (!logoImg) {
    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'No file',
          description: 'Please upload a logo image.',
        },
      },
      { status: 400 }
    )
  }

  if (logoImg.size > MAX_FILE_SIZE) {
    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'File too large',
          description: 'Logo image must be less than 1MB.',
        },
      },
      { status: 413 }
    )
  }

  if (!logoImg.type.startsWith('image/')) {
    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'Invalid file type',
          description: 'Please upload a valid image file.',
        },
      },
      { status: 400 }
    )
  }

  try {
    const uploadPayload = new FormData()
    uploadPayload.set('name', name?.toString() || 'application-logo')
    uploadPayload.set('file', logoImg)

    const assetResponse = await fetch(`${vaultaApiUrl}/assets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadPayload,
    })

    const assetData: TAsset = await assetResponse.json()

    return Response.json(
      {
        toast: {
          type: 'success',
          title: 'Success',
          description: 'Successfully uploaded logo',
        },
        response: assetData.url,
      },
      { status: 200 }
    )
  } catch (error: any) {
    return Response.json(
      {
        toast: {
          type: 'error',
          title: 'Server Error',
          description: error?.message || 'Failed to upload logo',
        },
      },
      { status: 500 }
    )
  }
}
