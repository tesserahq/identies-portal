import { redirect } from 'react-router'

export async function loader({ params }: { params: { serviceAccountID: string } }) {
  return redirect(`/service-accounts/${params.serviceAccountID}/overview`)
}

export default function ServiceAccountDetailIndex() {
  return <></>
}
