import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            Expanse Tracker • DRF + JWT + Celery
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900">
            Track expenses, incomes and budgets — cleanly.
          </h1>
          <p className="mt-3 text-slate-600">
            A modern UI for your API with secure JWT auth, fast lists, and mobile-first layout.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm shadow-slate-900/5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Expenses</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">₹ 12,540</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Incomes</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">₹ 22,000</div>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Budgets</div>
                <div className="mt-1 text-sm text-slate-700">
                  See budget vs spent summaries at a glance.
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-500">
            Tip: run everything in Docker and the UI proxies API requests automatically.
          </div>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

