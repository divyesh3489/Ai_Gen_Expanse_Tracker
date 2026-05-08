import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../app/auth/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import { http } from '../app/api/http'

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') ?? '/app'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/app', { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setNeedsVerification(false)
    setResendMessage(null)
    try {
      await login({ email, password })
      navigate(next, { replace: true })
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Login failed. Check credentials and verification.')
      setError(msg)

      const status = isAxiosError(err) ? err.response?.status : undefined
      const maybeNotVerified =
        status === 403 &&
        typeof msg === 'string' &&
        /not verified|verify your account|verify/i.test(msg)
      setNeedsVerification(!!maybeNotVerified)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onResendVerification() {
    if (!email.trim()) {
      setError('Enter your email above, then resend verification.')
      return
    }
    setIsResending(true)
    setResendMessage(null)
    setError(null)
    try {
      const res = await http.post<{ message?: string }>('/v1/user/resend-verification/', { email })
      setResendMessage(res.data?.message || 'Verification email resent. Please check your inbox.')
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to resend verification email.'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/60">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Welcome back!</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to continue</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
        <div className="-mt-1 text-right">
          <Link className="text-sm font-medium text-slate-900 hover:underline dark:text-slate-50" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        {resendMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/25 dark:text-emerald-200">
            {resendMessage}
          </div>
        ) : null}

        {needsVerification ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-950/25">
            <div className="text-sm font-medium text-amber-900 dark:text-amber-200">Email not verified</div>
            <div className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
              Please verify your email to sign in. If you didn’t receive it, resend the verification email.
            </div>
            <Button
              className="mt-3 w-full"
              type="button"
              variant="secondary"
              onClick={onResendVerification}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 border-slate-400/40 border-t-slate-700" />
                  Resending…
                </>
              ) : (
                'Resend verification email'
              )}
            </Button>
          </div>
        ) : null}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white dark:border-slate-400/40 dark:border-t-slate-900" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">
        New here?{' '}
        <Link className="font-medium text-slate-900 hover:underline dark:text-slate-50" to="/register">
          Create an account
        </Link>
      </div>
    </div>
  )
}

