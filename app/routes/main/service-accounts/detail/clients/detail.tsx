import { LoaderFunctionArgs, useLoaderData } from 'react-router'
import { ClientDetailContent } from '@/components/client-content'
import { ResourceClientUrlEnum } from '@/resources/queries/clients'
import { serviceAccountQueryKeys } from '@/resources/hooks/service-accounts'

export function loader({ params }: LoaderFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, serviceAccountID: params.serviceAccountID, clientID: params.clientID }
}

export default function UserClientDetail() {
  const { apiUrl, nodeEnv, serviceAccountID, clientID } = useLoaderData<typeof loader>()

  return (
    <ClientDetailContent
      apiUrl={apiUrl!}
      nodeEnv={nodeEnv!}
      resourceClientEnum={ResourceClientUrlEnum.SERVICE_ACCOUNT}
      queryKey={serviceAccountQueryKeys}
      resourceID={serviceAccountID!}
      clientID={clientID!}
    />
  )
}
