/* eslint-disable @typescript-eslint/no-explicit-any */
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { LoaderFunctionArgs, useLoaderData } from 'react-router'
import { ClientsListingContent } from '@/components/client-content'
import { usersQueryKeys } from '@/resources/hooks/users'
import { ResourceClientUrlEnum } from '@/resources/queries/clients'

export function loader({ request, params }: LoaderFunctionArgs) {
  const identiesApiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const pagination = ensureCanonicalPagination(request, { defaultSize: 25, defaultPage: 1 })

  if (pagination instanceof Response) {
    return pagination
  }

  return { identiesApiUrl, nodeEnv, pagination, id: params.userID }
}

export default function UserClientsListing() {
  const { identiesApiUrl, nodeEnv, pagination, id } = useLoaderData<typeof loader>()

  return (
    <ClientsListingContent
      identiesApiUrl={identiesApiUrl!}
      nodeEnv={nodeEnv!}
      pagination={pagination}
      queryKey={usersQueryKeys}
      resourceClientEnum={ResourceClientUrlEnum.USER}
      resourceID={id!}
    />
  )
}
