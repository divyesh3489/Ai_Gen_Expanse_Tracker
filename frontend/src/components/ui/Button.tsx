import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition',
        'focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-slate-300/30 dark:focus:ring-offset-slate-950',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-base',
        variant === 'primary' &&
          'bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:shadow-none',
        variant === 'secondary' &&
          'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-50 dark:hover:bg-slate-900/60',
        variant === 'ghost' &&
          'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/40',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-500',
        className,
      )}
      {...props}
    />
  )
}

