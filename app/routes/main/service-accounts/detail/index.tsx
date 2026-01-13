import { redirect } from 'react-router'

export async function loader({ params }: { params: { id: string } }) {
  return redirect(`/service-accounts/${params.id}/overview`)
}

export default function ServiceAccountDetailIndex() {
  return <></>
}
