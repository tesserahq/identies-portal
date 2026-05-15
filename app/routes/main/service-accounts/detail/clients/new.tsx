import { useLoaderData } from 'react-router'
import { ClientNewContent } from '@/components/client-content'
import { ResourceClientUrlEnum } from '@/resources/queries/clients'
import { serviceAccountQueryKeys } from '@/resources/hooks/service-accounts'

export function loader({ params }: { params: { serviceAccountID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.serviceAccountID }
}

export default function ServiceAccountClientNew() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()

  return (
    <ClientNewContent
      apiUrl={apiUrl!}
      nodeEnv={nodeEnv}
      queryKey={serviceAccountQueryKeys}
      resourceID={id}
      resourceTypeEnum={ResourceClientUrlEnum.SERVICE_ACCOUNT}
    />
  )
}
