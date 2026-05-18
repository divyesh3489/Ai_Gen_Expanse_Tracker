from django.urls import include, path

from . import views

urlpatterns = [
    path("categories/", views.CategoryView.as_view(), name="categories"),
    path(
        "categories/<int:pk>/",
        views.CategoryDetailView.as_view(),
        name="category_detail",
    ),
    path("user-category-preferences/", views.UserCategoryPreferenceView.as_view(), name="user_category_preferences"),
    path("user-category-preferences/<int:pk>/", views.DetailUserCategoryPreferenceView.as_view(), name="user_category_preference_detail"),
    path("expanses/", views.ExpanseView.as_view(), name="expanses"),
    path(
        "expanses/<int:pk>/", views.ExpanseDetailView.as_view(), name="expanse_detail"
    ),
    path("incomes/", views.IncomeView.as_view(), name="incomes"),
    path("incomes/<int:pk>/", views.IncomeDetailView.as_view(), name="income_detail"),
    path("recurring/", views.RecurringView.as_view(), name="recurring"),    
    path("recurring/<int:pk>/", views.RecurringDetailView.as_view(), name="recurring_detail"),
    path("budgets/", views.BudgetView.as_view(), name="budgets"),
    path("budgets/summary/", views.BudgetSummaryView.as_view(), name="budget_summary"),
    path("budgets/<int:pk>/", views.BudgetDetailView.as_view(), name="budget_detail"),
    path("reports/summary/", views.DashboardSummaryView.as_view(), name="report_summary"),
    path("reports/dashboard/finance-trend/", views.FinanceTrendView.as_view(), name="report_finance_trend"),
    path("reports/dashboard/years/", views.GetYearsViews.as_view(), name="report_years"),
    path("reports/dashboard/category-breakdown/", views.CategoryBreakdownView.as_view(), name="report_category_breakdown"),
    path("reports/dashboard/recent-transactions/", views.GetRecentTransactionsView.as_view(), name="report_recent_transactions"),
]
    
