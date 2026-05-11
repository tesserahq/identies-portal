import { redirect } from 'react-router'

export async function loader({ params }: { params: { applicationID: string } }) {
  return redirect(`/applications/${params.applicationID}/overview`)
}

export default function ApplicationDetailIndex() {
  return <></>
}
