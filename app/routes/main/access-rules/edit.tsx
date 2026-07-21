import { AppPreloader } from '@/components/loader'
import { useApp } from 'tessera-ui'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import {
  useAccessRule,
  useAccessRuleKinds,
  useUpdateAccessRule,
} from '@/resources/hooks/access-rules'
import {
  AccessRuleFormData,
  accessRuleToFormValues,
  AccessRuleType,
} from '@/resources/queries/access-rules'
import { AccessRuleForm } from '@/components/crud-form/access-rule-form'
import { NodeENVType } from '@/libraries/fetch'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ApplicationEdit() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const params = useParams()
  const config = {
    apiUrl: apiUrl!,
    token: token!,
    nodeEnv: nodeEnv as NodeENVType,
  }

  const { data: application, isLoading } = useAccessRule(config, params.accessRuleID!, {
    enabled: !!token && !!params.accessRuleID,
  })

  const { mutateAsync: updateApplication } = useUpdateAccessRule(config, params.accessRuleID!, {
    onSuccess: (data: AccessRuleType) => {
      navigate(`/access-rules/${data.id}`)
    },
  })

  const { data } = useAccessRuleKinds(config, { page: 1, size: 100 })

  const handleSubmit = async (data: AccessRuleFormData): Promise<void> => {
    await updateApplication(data)
  }

  if (isLoading || !application) {
    return <AppPreloader />
  }

  return (
    <AccessRuleForm
      onSubmit={handleSubmit}
      defaultValues={accessRuleToFormValues(application)}
      accessRuleKinds={data?.items ?? []}
      isEdit={true}
    />
  )
}
