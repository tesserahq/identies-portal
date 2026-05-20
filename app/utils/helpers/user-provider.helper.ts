export function getUserProviderIcon(provider: string | undefined): string {
  if (!provider) return ''
  const icons: Record<string, string> = {
    'google-oauth2': '/images/google.png',
    auth0: '/images/auth0.png',
  }

  return icons[provider] ?? ''
}
