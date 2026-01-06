import { ApiKeyType } from './api-key.type'
import { ApiKeyFormValue } from './api-key.schema'

/**
 * Convert API key API data to form values
 */
export function apiKeyToFormValues(apiKey: ApiKeyType): ApiKeyFormValue {
  return {
    name: apiKey.name || '',
    expires_at: apiKey.expires_at || '',
  }
}

/**
 * Convert form values to API key API data
 */
export function formValuesToApiKeyData(
  formValues: ApiKeyFormValue
): Omit<ApiKeyType, 'id' | 'key_id' | 'created_at' | 'last_used_at' | 'revoked' | 'user_id'> {
  return {
    name: formValues.name,
    expires_at: formValues.expires_at || '',
  }
}
