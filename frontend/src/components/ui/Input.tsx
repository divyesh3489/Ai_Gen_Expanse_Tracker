import clsx from 'clsx'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-slate-700">{label}</div> : null}
      <input
        className={clsx(
          'h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition',
          'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20',
          error && 'border-rose-300 focus:ring-rose-400/20',
          className,
        )}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  )
}

