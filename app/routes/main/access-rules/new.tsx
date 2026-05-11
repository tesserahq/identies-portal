/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApp } from 'tessera-ui'
import { useLoaderData, useNavigate } from 'react-router'
import { AccessRuleForm } from '@/components/crud-form/access-rule-form'
import { useCreateAccessRule } from '@/resources/hooks/access-rules'
import {
  AccessRuleFormData,
  AccessRuleType,
  defaultAccessRuleFormValues,
} from '@/resources/queries/access-rules'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function AccessRuleNew() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const { mutateAsync: createAccessrule } = useCreateAccessRule(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv as any },
    {
      onSuccess: (data: AccessRuleType) => {
        navigate(`/access-rules/${data.id}`)
      },
    }
  )

  const handleSubmit = async (data: AccessRuleFormData): Promise<void> => {
    await createAccessrule(data)
  }

  return <AccessRuleForm onSubmit={handleSubmit} defaultValues={defaultAccessRuleFormValues} />
}
