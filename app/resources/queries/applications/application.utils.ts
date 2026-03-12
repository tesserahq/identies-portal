import { ApplicationType } from './application.type'
import { ApplicationFormValue } from './application.schema'

const PROXY_LOGO_PATH = '/resources/proxy-application-logo'

/**
 * Returns a URL suitable for use in <img src> for the application logo.
 * Proxies external asset URLs through our app to avoid cross-origin blocking
 * (e.g. ERR_BLOCKED_BY_RESPONSE.NotSameOrigin from asset servers).
 */
export function getApplicationLogoSrc(logo: string | undefined): string | undefined {
  if (!logo?.trim()) return undefined
  if (!logo.startsWith('http://') && !logo.startsWith('https://')) {
    return logo
  }
  return `${PROXY_LOGO_PATH}?url=${encodeURIComponent(logo)}`
}

/**
 * Convert application API data to form values
 */
export function applicationToFormValues(application: ApplicationType): ApplicationFormValue {
  return {
    name: application.name || '',
    url: application.url || '',
    logo: application.logo || '',
    description: application.description || '',
  }
}

/**
 * Convert form values to application API data
 */
export function formValuesToApplicationData(
  formValues: ApplicationFormValue
): Omit<ApplicationType, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: formValues.name,
    url: formValues.url,
    logo: formValues.logo || '',
    description: formValues.description || '',
  }
}
