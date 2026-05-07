import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { AuthLayout } from '../../layouts/AuthLayout'
import { AppLayout } from '../../layouts/AppLayout'
import { LoginPage } from '../../pages/LoginPage'
import { RegisterPage } from '../../pages/RegisterPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { CategoriesPage } from '../../pages/CategoriesPage'
import { ExpensesPage } from '../../pages/ExpensesPage'
import { IncomesPage } from '../../pages/IncomesPage'
import { BudgetsPage } from '../../pages/BudgetsPage'
import { RecurringPage } from '../../pages/RecurringPage'
import { NotFoundPage } from '../../pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/app" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
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
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'incomes', element: <IncomesPage /> },
          { path: 'budgets', element: <BudgetsPage /> },
          { path: 'recurring', element: <RecurringPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

