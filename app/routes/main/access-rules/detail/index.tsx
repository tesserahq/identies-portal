import { redirect } from 'react-router'

export async function loader({ params }: { params: { accessRuleID: string } }) {
  return redirect(`/access-rules/${params.accessRuleID}/overview`)
}

export default function AccessRuleDetailIndex() {
  return <></>
}
