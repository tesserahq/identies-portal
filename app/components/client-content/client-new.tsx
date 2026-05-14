import { useApp } from 'tessera-ui'
import { useNavigate } from 'react-router'
import { NodeENVType } from '@/libraries/fetch'
import { useCreateClient } from '@/resources/hooks/clients'
import { ClientForm } from '../crud-form/client-form'
import {
  ClientFormData,
  ClientType,
  defaultClientFormValues,
  ResourceClientUrlEnum,
} from '@/resources/queries/clients'
import { usersQueryKeys } from '@/resources/hooks/users'
import { serviceAccountQueryKeys } from '@/resources/hooks/service-accounts'
import { useState } from 'react'
import { ClientDetailContent } from './client-detail'

interface Props {
  apiUrl: string
  nodeEnv: NodeENVType
  resourceTypeEnum: ResourceClientUrlEnum
  resourceID: string
  queryKey: typeof usersQueryKeys | typeof serviceAccountQueryKeys
}
export function ClientNewContent({
  apiUrl,
  nodeEnv,
  queryKey,
  resourceTypeEnum,
  resourceID,
}: Props) {
  const { token } = useApp()
  const navigate = useNavigate()

  const [client, setClient] = useState<ClientType>()

  const config = {
    apiUrl,
    token: token!,
    nodeEnv,
  }

  // API key create mutation
  const { mutateAsync: createClient } = useCreateClient(
    config,
    resourceTypeEnum,
    resourceID,
    queryKey,
    {
      onSuccess: setClient,
    }
  )

  const handleSubmit = async (data: ClientFormData): Promise<void> => {
    await createClient(data)
  }

  const onCancel = () => navigate(-1)

  return client ? (
    <ClientDetailContent
      apiUrl={apiUrl!}
      nodeEnv={nodeEnv!}
      resourceClientEnum={resourceTypeEnum}
      queryKey={serviceAccountQueryKeys}
      resourceID={resourceID!}
      clientID={client.id!}
      clientData={client}
    />
  ) : (
    <ClientForm
      onCancel={onCancel}
      defaultValues={defaultClientFormValues}
      onSubmit={handleSubmit}
    />
  )
}
