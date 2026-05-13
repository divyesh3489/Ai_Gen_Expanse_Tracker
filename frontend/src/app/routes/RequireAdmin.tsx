import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Spinner } from '../../components/ui/Spinner'

/** Staff-only shell (Django `IsAdminUser` uses `is_staff`). Redirects to dashboard when forbidden. */
export function RequireAdmin() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Spinner /> Loading…
      </div>
    )
  }

  if (!user?.is_staff) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
