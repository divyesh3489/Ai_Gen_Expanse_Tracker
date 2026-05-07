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
    </div>
  )
}

