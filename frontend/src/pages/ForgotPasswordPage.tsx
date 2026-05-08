import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import { requestPasswordReset } from '../features/user/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      const res = await requestPasswordReset(email)
      setMessage(res.message || 'If an account exists for this email, a reset link has been sent.')
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to send password reset link.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/60">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Forgot password</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Enter your email and we’ll send you a password reset link.
      </p>

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

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white dark:border-slate-400/40 dark:border-t-slate-900" />
              Sending…
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">
        Remembered it?{' '}
        <Link className="font-medium text-slate-900 hover:underline dark:text-slate-50" to="/login">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

