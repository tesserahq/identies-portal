import { ApiKeyType } from '@/resources/queries/api-keys/api-key.type'
import { ApplicationType } from '@/resources/queries/applications/application.type'
import { ServiceAccountType } from '@/resources/queries/service-accounts/service-account.type'
import { UserType } from '@/resources/queries/users/user.type'
import { BreadcrumbItemData } from 'tessera-ui/layouts'

export type BreadcrumbResourceData = UserType | ServiceAccountType | ApiKeyType | ApplicationType

export function generateBreadcrumbs({
  pathname,
  params,
  resourceData,
}: {
  pathname: string
  params: Record<string, string | undefined>
  resourceData: Record<
    string,
    {
      data?: BreadcrumbResourceData
      isLoading: boolean
      error?: Error | null
    }
  >
}): BreadcrumbItemData[] {
  const parts = pathname.split('/').filter(Boolean)

  return parts.map((part, index) => {
    const matched = Object.entries(params).find(([, value]) => value === part)
    let label = formatPathPart(part)

    if (matched) {
      const [paramKey] = matched
      const resource = resourceData[paramKey]

      if (resource?.isLoading) {
        label = 'Loading…'
      } else if (resource?.error) {
        label = 'Unknown'
      } else {
        label = getResourceName(resource?.data) || label
      }
    }

    return {
      label,
      link: '/' + parts.slice(0, index + 1).join('/'),
    }
  })
}

export function formatPathPart(part: string): string {
  return part
    .replace(/-/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getResourceName(resource: BreadcrumbResourceData | undefined): string {
  if (!resource) return ''

  if ('name' in resource && typeof resource.name === 'string') {
    return resource.name.trim()
  }

  if ('first_name' in resource || 'last_name' in resource) {
    const first = typeof resource.first_name === 'string' ? resource.first_name : ''
    const last = typeof resource.last_name === 'string' ? resource.last_name : ''
    const fullName = `${first} ${last}`.trim()
    if (fullName) return fullName
  }

  if ('email' in resource && typeof resource.email === 'string') {
    return resource.email.trim()
  }

  return ''
}
