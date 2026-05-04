'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'portfolio_admin_auth'

// Hook — pakai di halaman admin
export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      router.replace('/admin/login')
    }
  }, [router])
}

// Fungsi logout — panggil di tombol logout admin
export function logout(router: ReturnType<typeof useRouter>) {
  localStorage.removeItem(STORAGE_KEY)
  router.replace('/admin/login')
}