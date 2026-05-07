import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="p-6 text-center">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">404</div>
        <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">Page not found</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          The page you’re looking for doesn’t exist.
        </div>
        <div className="mt-4">
          <Link to="/app">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

