/**
 * Application Type
 */
export type ApplicationType = {
  id: string
  name: string
  url: string
  logo: string
  description: string
  created_at: string
  updated_at: string
}

/**
 * Application form data for API requests
 */
export type ApplicationFormData = {
  name: string
  url: string
  logo: string
  description: string
}
