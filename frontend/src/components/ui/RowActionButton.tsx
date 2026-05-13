import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant: 'edit' | 'delete'
  icon: LucideIcon
}

export function RowActionButton({ variant, icon: Icon, className, type = 'button', title, ...props }: Props) {
  const defaultTitle = variant === 'edit' ? 'Edit' : 'Delete'

  return (
    <button
      type={type}
      title={title ?? defaultTitle}
      className={clsx(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-0',
        'transition-[background-color,color,transform] duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2 focus:ring-offset-slate-50',
        'dark:focus:ring-slate-300/30 dark:focus:ring-offset-slate-950',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'enabled:opacity-90 enabled:group-hover:opacity-100',
        variant === 'edit' &&
          clsx(
            'bg-indigo-500/15 text-indigo-600',
            'hover:bg-indigo-500/25 hover:text-indigo-500 hover:scale-105',
            'dark:bg-indigo-400/12 dark:text-indigo-400',
            'dark:hover:bg-indigo-400/22 dark:hover:text-indigo-300',
            'disabled:hover:scale-100',
          ),
        variant === 'delete' &&
          clsx(
            'bg-[rgba(239,68,68,0.15)] text-[#EF4444]',
            'hover:bg-[rgba(239,68,68,0.25)] hover:text-red-400 hover:scale-105',
            'dark:bg-[rgba(239,68,68,0.15)]',
            'dark:hover:bg-[rgba(239,68,68,0.28)] dark:hover:text-red-300',
            'disabled:hover:scale-100',
          ),
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  )
}
