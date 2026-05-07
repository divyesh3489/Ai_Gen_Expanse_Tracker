import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid min-h-dvh max-w-6xl items-stretch gap-0 px-4 py-6 lg:grid-cols-2 lg:py-10">
        {/* Left marketing panel */}
        <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 lg:block dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
          <div className="flex h-full flex-col p-10">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-slate-900">
                <img src="/logo.png" alt="FinStackAI" className="h-full w-full object-cover" />
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">FinStackAI</div>
            </div>

            <div className="mt-10">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Smart Finance,
                <br />
                Simplified
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                Track your expenses, get AI-powered insights, and take control of your financial future.
              </p>
            </div>

            <div className="mt-10 flex-1">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/20 dark:shadow-none">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />
                  <div className="absolute -bottom-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
                </div>

                <div className="relative p-5 dark:bg-black">
                  <div className="pointer-events-none absolute inset-5 rounded-2xl bg-gradient-to-br from-sky-100/70 via-white/40 to-indigo-100/70 blur-2xl dark:from-sky-500/10 dark:via-slate-950/0 dark:to-indigo-500/10" />
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md shadow-slate-900/10 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:shadow-none">
                    <img
                      src="/auth-hero-light.png"
                      alt="FinStackAI preview"
                      className="h-[22rem] w-full object-cover dark:hidden"
                    />
                    <img
                      src="/auth-hero-dark.png"
                      alt="FinStackAI preview"
                      className="hidden h-[22rem] w-full  object-cover dark:block"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex items-center justify-center lg:pl-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-slate-900">
                <img src="/logo.png" alt="FinStackAI" className="h-full w-full object-cover" />
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">FinStackAI</div>
            </div>
            <Outlet />
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Smart finance, simplified
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

