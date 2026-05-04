'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn, logout as authLogout} from './Auth'
// import { isLoggedIn } from './auth'
// import { isLoggedIn, logout as authLogout } from '@/'

export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/admin/login')
    }
  }, [router])
}

export function useLogout() {
  const router = useRouter()

  return () => {
    authLogout()
    router.replace('/admin/login')
  }
}
