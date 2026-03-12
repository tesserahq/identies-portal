import { fetchApi } from '@/libraries/fetch'
import { ApplicationFormData, ApplicationType } from './application.type'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'

/**
 * List all applications with pagination.
 */
export async function fetchApplications(config: IQueryConfig, params: IQueryParams) {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const response = await fetchApi(`${apiUrl}/applications/`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return response as IPaging<ApplicationType>
}

/**
 * Get an application by ID.
 */
export async function fetchApplicationDetail(config: IQueryConfig, applicationId: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/applications/${applicationId}`, token, nodeEnv)

  return response as ApplicationType
}

/**
 * Create a new application.
 */
export async function createApplication(config: IQueryConfig, data: ApplicationFormData) {
  const { apiUrl, token, nodeEnv } = config

  const payload = {
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
  }

  const response = await fetchApi(`${apiUrl}/applications/`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response as ApplicationType
}

/**
 * Update an application.
 */
export async function updateApplication(
  config: IQueryConfig,
  applicationId: string,
  updateData: Partial<ApplicationFormData>
) {
  const { apiUrl, token, nodeEnv } = config

  const payload: Partial<ApplicationFormData> = {}

  if (updateData.name !== undefined) payload.name = updateData.name
  if (updateData.url !== undefined) payload.url = updateData.url
  if (updateData.logo !== undefined) payload.logo = updateData.logo
  if (updateData.description !== undefined) payload.description = updateData.description

  const response = await fetchApi(`${apiUrl}/applications/${applicationId}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response as ApplicationType
}

/**
 * Delete an application.
 */
export async function deleteApplication(config: IQueryConfig, applicationId: string) {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(`${apiUrl}/applications/${applicationId}`, token, nodeEnv, {
    method: 'DELETE',
  })

  return response
}
