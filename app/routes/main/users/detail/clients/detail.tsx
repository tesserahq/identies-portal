/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoaderFunctionArgs, useLoaderData } from 'react-router'
import { ClientDetailContent } from '@/components/client-content'
import { usersQueryKeys } from '@/resources/hooks/users'
import { ResourceClientUrlEnum } from '@/resources/queries/clients'

export function loader({ params }: LoaderFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, userID: params.userID, clientID: params.clientID }
}

export default function UserClientDetail() {
  const { apiUrl, nodeEnv, userID, clientID } = useLoaderData<typeof loader>()

  return (
    <ClientDetailContent
      apiUrl={apiUrl!}
      nodeEnv={nodeEnv!}
      resourceClientEnum={ResourceClientUrlEnum.USER}
      queryKey={usersQueryKeys}
      resourceID={userID!}
      clientID={clientID!}
    />
  )
}
