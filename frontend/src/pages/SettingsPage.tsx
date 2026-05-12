import { Link } from 'react-router-dom'
import { Palette } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useTheme } from '../app/theme/ThemeContext'
import clsx from 'clsx'

export function SettingsPage() {
  const { preference, setPreference, resolvedTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-slate-900 dark:text-slate-50">Settings</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Customize how FinStackAI looks on this device.
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Theme</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Choose light, dark, or follow your device settings. Current: <span className="font-medium">{resolvedTheme}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(['system', 'light', 'dark'] as const).map((opt) => (
            <Button
              key={opt}
              type="button"
              variant={preference === opt ? 'primary' : 'secondary'}
              className={clsx('capitalize', preference === opt && 'shadow-none')}
              onClick={() => setPreference(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <Link
          to="/app/settings/category-preferences"
          className="group flex items-start justify-between gap-4 rounded-xl outline-none ring-slate-400/30 focus-visible:ring-2"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/60">
              <Palette className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 group-hover:underline dark:text-slate-50">
                Category colors
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Set your own color for each expense category across charts and lists.
              </div>
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100">
            Open →
          </span>
        </Link>
      </Card>
    </div>
  )
}

