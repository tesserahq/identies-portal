import { UserType } from './user.type'
import { UserFormValue } from './user.schema'

/**
 * Convert user API data to form values
 */
export function userToFormValues(user: UserType): UserFormValue {
  return {
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    username: user.username || '',
    avatar_url: user.avatar_url || '',
    avatar_asset_id: user.avatar_asset_id || '',
    provider: user.provider || '',
    confirmed_at: user.confirmed_at || '',
    verified: user.verified ?? true,
    verified_at: user.verified_at || '',
    theme_preference: user.theme_preference || 'light',
  }
}

/**
 * Convert form values to user API data
 */
export function formValuesToUserData(
  formValues: UserFormValue
): Omit<UserType, 'id' | 'created_at' | 'updated_at' | 'confirmed_at' | 'verified_at'> {
  return {
    email: formValues.email,
    username: formValues.username || '',
    avatar_url: formValues.avatar_url || '',
    avatar_asset_id: formValues.avatar_asset_id || '',
    first_name: formValues.first_name,
    last_name: formValues.last_name,
    provider: formValues.provider || '',
    verified: formValues.verified ?? true,
    theme_preference: formValues.theme_preference || 'light',
  }
}
