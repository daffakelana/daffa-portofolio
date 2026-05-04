'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/lib/AuthGuard'

// ============================================================
// KREDENSIAL — ganti sesuai kebutuhan
// ============================================================
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'
const STORAGE_KEY = 'portfolio_admin_auth'

// ============================================================
// AUTH HELPERS
// ============================================================

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

// ============================================================
// LOGIN PAGE
// ============================================================

export default function LoginPage() {

  useAuthGuard()  

  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Kalau sudah login, redirect ke admin
    if (isLoggedIn()) {
      router.replace('/admin')
      return
    }
    const t = setTimeout(() => setLoaded(true), 50)
    return () => clearTimeout(t)
  }, [router])

  const handleSubmit = () => {
    setError('')

    if (!username || !password) {
      setError('Username dan password wajib diisi.')
      return
    }

    setLoading(true)

    // Simulasi delay supaya tidak instant
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem(STORAGE_KEY, 'true')
        router.push('/admin')
      } else {
        setError('Username atau password salah.')
        setLoading(false)
      }
    }, 600)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-6">
      {/* Background subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-3xl" />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm transition-all duration-700 ${
          loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        {/* Logo / title */}
        <div
          className={`mb-8 transition-all delay-100 duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Masuk untuk mengelola portfolio
          </p>
        </div>

        {/* Form */}
        <div
          className={`space-y-3 transition-all delay-150 duration-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder="admin"
              autoComplete="username"
              className={`w-full rounded-xl border bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all ${
                error
                  ? 'border-red-800 focus:border-red-600'
                  : 'border-gray-800 focus:border-gray-600'
              }`}
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full rounded-xl border bg-gray-900 px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 outline-none transition-all ${
                  error
                    ? 'border-red-800 focus:border-red-600'
                    : 'border-gray-800 focus:border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-white py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Masuk...
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
