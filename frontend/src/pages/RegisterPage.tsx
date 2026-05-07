import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { http } from '../app/api/http'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import { useAuth } from '../app/auth/AuthContext'

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/app', { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      await http.post('/v1/user/register/', {
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      })
      setMessage('Account created. Please check your email to verify your account, then sign in.')
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/60">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Create account</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Register and verify your email to sign in</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Create a password"
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
              Creating…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{' '}
        <Link className="font-medium text-slate-900 hover:underline dark:text-slate-50" to="/login">
          Sign in
        </Link>
      </div>
    </div>
  )
}

