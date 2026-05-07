type NavigateFn = (to: string) => void

let navigateFn: NavigateFn | null = null

export const setNavigator = (fn: NavigateFn | null) => {
  navigateFn = fn
}

export const navigateTo = (to: string) => {
  if (!navigateFn) return false
  navigateFn(to)
  return true
}
