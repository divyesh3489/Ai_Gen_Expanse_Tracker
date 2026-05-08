import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import { useAuth } from '../app/auth/AuthContext'
import { resetPassword } from '../features/user/api'

export function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const tokenError = token ? null : 'Missing token. Please open the reset link from your email.'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError(tokenError)
      return
    }
    if (!password.trim()) {
      setError('Enter a new password.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await resetPassword({ token, new_password: password })
      setMessage(res.message || 'Password reset successfully. You can now sign in.')
      if (isAuthenticated) {
        await logout()
      }
      setTimeout(() => navigate('/login', { replace: true }), 800)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to reset password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/60">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Reset password</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose a new password for your account.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter a new password"
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Re-enter password"
        />

        {tokenError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/25 dark:text-amber-200">
            {tokenError}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/25 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <Button className="w-full" type="submit" disabled={isSubmitting || !!tokenError}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white dark:border-slate-400/40 dark:border-t-slate-900" />
              Resetting…
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>

      <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">
        <Link className="font-medium text-slate-900 hover:underline dark:text-slate-50" to="/login">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

