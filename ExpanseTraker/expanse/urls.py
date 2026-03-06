from django.urls import include, path

from . import views

urlpatterns = [
    path("categories/", views.CategoryView.as_view(), name="categories"),
    path(
        "categories/<int:pk>/",
        views.CategoryDetailView.as_view(),
        name="category_detail",
    ),
    path("expanses/", views.ExpanseView.as_view(), name="expanses"),
    path(
        "expanses/<int:pk>/", views.ExpanseDetailView.as_view(), name="expanse_detail"
    ),
    path("incomes/", views.IncomeView.as_view(), name="incomes"),
    path("incomes/<int:pk>/", views.IncomeDetailView.as_view(), name="income_detail"),
]
