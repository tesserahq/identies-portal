import { usersQueryKeys } from '@/resources/hooks/users'
import { useLoaderData } from 'react-router'
import { ClientNewContent } from '@/components/client-content'
import { ResourceClientUrlEnum } from '@/resources/queries/clients'

export function loader({ params }: { params: { userID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.userID }
}

export default function UserClientNew() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()

  return (
    <ClientNewContent
      apiUrl={apiUrl!}
      nodeEnv={nodeEnv}
      queryKey={usersQueryKeys}
      resourceID={id}
      resourceTypeEnum={ResourceClientUrlEnum.USER}
    />
  )
}
