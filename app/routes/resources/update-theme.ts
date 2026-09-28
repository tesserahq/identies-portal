import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { parseThemeFormData, setTheme } from 'tessera-ui/server'

export const ROUTE_PATH = '/resources/update-theme' as const

export async function action({ request }: ActionFunctionArgs) {
  const { theme, redirectTo } = parseThemeFormData(await request.formData())

  const responseInit = {
    headers: { 'Set-Cookie': setTheme(theme) },
  }

  if (redirectTo) {
    return redirect(safeRedirect(redirectTo), responseInit)
  } else {
    return new Response(null, responseInit)
  }
}
