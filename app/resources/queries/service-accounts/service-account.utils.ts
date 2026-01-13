import { ServiceAccountType } from './service-account.type'
import { ServiceAccountFormValue } from './service-account.schema'

/**
 * Convert service account API data to form values
 */
export function serviceAccountToFormValues(
  serviceAccount: ServiceAccountType
): ServiceAccountFormValue {
  return {
    email: serviceAccount.email || '',
    username: serviceAccount.username || '',
    avatar_url: serviceAccount.avatar_url || '',
    avatar_asset_id: serviceAccount.avatar_asset_id || '',
    first_name: serviceAccount.first_name || '',
    last_name: serviceAccount.last_name || '',
    provider: serviceAccount.provider || '',
    verified: serviceAccount.verified ?? false,
    theme_preference: serviceAccount.theme_preference || 'system',
    external_id: serviceAccount.external_id || '',
    service_account: serviceAccount.service_account ?? true,
  }
}

/**
 * Convert form values to service account API data
 */
export function formValuesToServiceAccountData(
  formValues: ServiceAccountFormValue
): Omit<ServiceAccountType, 'id' | 'created_at' | 'updated_at' | 'confirmed_at' | 'verified_at'> {
  return {
    email: formValues.email,
    username: formValues.username || '',
    avatar_url: formValues.avatar_url || '',
    avatar_asset_id: formValues.avatar_asset_id || '',
    first_name: formValues.first_name,
    last_name: formValues.last_name,
    provider: formValues.provider || '',
    verified: formValues.verified ?? false,
    theme_preference: formValues.theme_preference || 'system',
    external_id: formValues.external_id || '',
    service_account: formValues.service_account ?? true,
  }
}
