const STORAGE_KEY = 'portfolio_admin_auth'

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function setLoggedIn() {
  localStorage.setItem(STORAGE_KEY, 'true')
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}
