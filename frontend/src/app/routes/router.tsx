import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { RequireAdmin } from './RequireAdmin'
import { AuthLayout } from '../../layouts/AuthLayout'
import { AppLayout } from '../../layouts/AppLayout'
import { LoginPage } from '../../pages/LoginPage'
import { RegisterPage } from '../../pages/RegisterPage'
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../../pages/ResetPasswordPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { ExpensesPage } from '../../pages/ExpensesPage'
import { IncomesPage } from '../../pages/IncomesPage'
import { BudgetsPage } from '../../pages/BudgetsPage'
import { RecurringPage } from '../../pages/RecurringPage'
import { SettingsPage } from '../../pages/SettingsPage'
import { CategoryPreferencesPage } from '../../pages/CategoryPreferencesPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { NotFoundPage } from '../../pages/NotFoundPage'
import { Spinner } from '../../components/ui/Spinner'

const CategoriesPage = lazy(() =>
  import('../../pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
)

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/app" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: 'categories',
                element: (
                  <Suspense
                    fallback={
                      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Spinner /> Loading…
                      </div>
                    }
                  >
                    <CategoriesPage />
                  </Suspense>
                ),
              },
            ],
          },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'incomes', element: <IncomesPage /> },
          { path: 'budgets', element: <BudgetsPage /> },
          { path: 'recurring', element: <RecurringPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'settings/category-preferences', element: <CategoryPreferencesPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

