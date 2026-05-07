import clsx from 'clsx'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
      ) : null}
      <input
        className={clsx(
          'h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition placeholder:text-slate-400',
          'border-slate-200 text-slate-900 focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20',
          'dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-300/20',
          error && 'border-rose-300 focus:ring-rose-400/20 dark:border-rose-500/60 dark:focus:ring-rose-400/20',
          className,
        )}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  )
}

