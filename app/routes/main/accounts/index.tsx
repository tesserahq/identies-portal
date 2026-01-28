import { redirect } from 'react-router'

export function loader() {
  return redirect('/accounts/preferences')
}

export default function Index() {
  return <div></div>
}
