from django.db.models import Q,Sum
from django.shortcuts import render
from django.core.cache import cache
from rest_framework import status

# Create your views here.
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import (
    BudgetCursorPagination,
    ExpanseCursorPagination,
    IncomeCursorPagination,
    RecurringCursorPagination,
    apply_cursor_pagination,
)

from .models import Budget, Expanse, Income, Category,Recurring,UserCategoryPreference
from .serializers import BudgetSerializer, CategorySerializer, ExpanseSerializer, IncomeSerializer, RecurringSerializer, UserCategoryPreferenceSerializer

from datetime import timedelta
import calendar
from django.utils import timezone
from . import utils as expanse_utils
from django.db.models.signals import post_save, post_delete


def _category_preferences_map(user):
    """{category_id: UserCategoryPreference} for list serializers (avoids N+1)."""
    return {
        p.category_id: p
        for p in UserCategoryPreference.objects.filter(user=user).select_related("category")
    }


def _resolve_category_color(category, prefs):
    if category is None:
        return None
    pref = prefs.get(category.id)
    if pref and pref.custom_color:
        return pref.custom_color
    return category.default_color


def _recent_transaction_row(obj, tx_type, prefs):
    category = obj.category
    category_name = category.name if category else ("Income" if tx_type == "income" else "Expense")
    label = (obj.note or "").strip() or category_name
    amount = float(obj.amount or 0)
    icon = category.icon if category else ("" if tx_type == "income" else "FaEllipsisH")

    return {
        "id": obj.id,
        "name": label,
        "category": category_name,
        "category_color": _resolve_category_color(category, prefs),
        "date": obj.date.isoformat(),
        "icon": icon,
        "amount": amount,
        "type": tx_type,
    }


class CategoryView(APIView):
    """
    List/create categories. Not paginated: full list is required for expense/income
    dropdowns and filters across the SPA.
    """
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def get(self, request):
        type_filter = request.query_params.get("type")
        if type_filter in ["expense", "income"]:
            categorys = Category.objects.filter(type=type_filter).order_by("name")
        else:
            categorys = Category.objects.all().order_by("type", "name")
        serializer = self.serializer_class(categorys, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailView(APIView):
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get(self, request, pk):
        category_instance = Category.objects.filter(id=pk).first()
        if not category_instance:
            return Response(
                {"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(category_instance, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        category_instance = Category.objects.filter(id=pk).first()
        if not category_instance:
            return Response(
                {"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND
            )
        category_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def put(self, request, pk):
        category_instance = Category.objects.filter(id=pk).first()
        if not category_instance:
            return Response(
                {"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(category_instance, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserCategoryPreferenceView(APIView):
    """
    Returns merged category catalog + preferences for the current user.
    Not paginated: the UI expects one combined array for icon/color resolution.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserCategoryPreferenceSerializer

    def get(self, request):
        default_categories = Category.objects.all().order_by("type", "name")
        preferences = UserCategoryPreference.objects.filter(user=request.user).select_related("category")
        pref_dict = {pref.category_id: pref for pref in preferences}
        results = []
        for cat in default_categories:
            pref = pref_dict.get(cat.id)
            results.append(
                {
                    "id": pref.id if pref else None,
                    "category": cat.id,
                    "category_name": cat.name,
                    "custom_color": pref.custom_color if pref else cat.default_color,
                    "default_color": cat.default_color,
                    "icon": cat.icon,
                }
            )
        return Response(results, status=status.HTTP_200_OK)
    
   
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DetailUserCategoryPreferenceView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserCategoryPreferenceSerializer

    def put(self, request, pk):
        pref_instance = UserCategoryPreference.objects.filter(user=request.user, id=pk).first()
        if not pref_instance:
            return Response(
                {"detail": "User category preference not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(pref_instance, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        pref_instance = UserCategoryPreference.objects.filter(user=request.user, id=pk).first()
        if not pref_instance:
            return Response(
                {"detail": "User category preference not found."}, status=status.HTTP_404_NOT_FOUND
            )
        pref_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ExpanseView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpanseSerializer

    def get(self, request):
        queryset = (
            Expanse.objects.filter(user=request.user)
            .select_related("category")
            .order_by("-date", "-created_at", "-id")
        )
        return apply_cursor_pagination(
            request,
            self,
            queryset,
            self.serializer_class,
            ExpanseCursorPagination,
            extra_serializer_context={"category_preferences": _category_preferences_map(request.user)},
        )

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpanseDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpanseSerializer

    def get(self, request, pk):
        expanse_instance = Expanse.objects.filter(user=request.user, id=pk).first()
        if not expanse_instance:
            return Response(
                {"detail": "Expanse not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(
            expanse_instance,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        expanse_instance = Expanse.objects.filter(user=request.user, id=pk).first()
        if not expanse_instance:
            return Response(
                {"detail": "Expanse not found."}, status=status.HTTP_404_NOT_FOUND
            )
        expanse_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, pk):
        expanse_instance = Expanse.objects.filter(user=request.user, id=pk).first()
        if not expanse_instance:
            return Response(
                {"detail": "Expanse not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(
            expanse_instance,
            data=request.data,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncomeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get(self, request):
        queryset = (
            Income.objects.filter(user=request.user)
            .select_related("category")
            .order_by("-date", "-created_at", "-id")
        )
        return apply_cursor_pagination(
            request,
            self,
            queryset,
            self.serializer_class,
            IncomeCursorPagination,
            extra_serializer_context={"category_preferences": _category_preferences_map(request.user)},
        )

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncomeDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get(self, request, pk):
        income_instance = Income.objects.filter(user=request.user, id=pk).first()
        if not income_instance:
            return Response(
                {"detail": "Income not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(
            income_instance,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        income_instance = Income.objects.filter(user=request.user, id=pk).first()
        if not income_instance:
            return Response(
                {"detail": "Income not found."}, status=status.HTTP_404_NOT_FOUND
            )
        income_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, pk):
        income_instance = Income.objects.filter(user=request.user, id=pk).first()
        if not income_instance:
            return Response(
                {"detail": "Income not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(
            income_instance,
            data=request.data,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecurringView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecurringSerializer

    def get(self, request):
        queryset = (
            Recurring.recurringObjects.filter(user=request.user)
            .select_related("category", "user")
            .order_by("-start_date", "-created_at", "-id")
        )
        return apply_cursor_pagination(
            request,
            self,
            queryset,
            self.serializer_class,
            RecurringCursorPagination,
            extra_serializer_context={"category_preferences": _category_preferences_map(request.user)},
        )

    def post(self, request):    
        serializer = self.serializer_class(
            data=request.data,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class RecurringDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecurringSerializer

    def get(self, request, pk):
        reccuring_instance = Recurring.recurringObjects.filter(user=request.user, id=pk).select_related('category').first()
        if not reccuring_instance:
            return Response(
                {"detail": "Recurring entry not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(
            reccuring_instance,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        reccuring_instance = Recurring.recurringObjects.filter(user=request.user, id=pk).first()
        if not reccuring_instance:
            return Response(
                {"detail": "Recurring entry not found."}, status=status.HTTP_404_NOT_FOUND
            )
        reccuring_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, pk):
        reccuring_instance = Recurring.recurringObjects.filter(user=request.user, id=pk).first()
        if not reccuring_instance:
            return Response(
                {"detail": "Recurring entry not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.serializer_class(
            reccuring_instance,
            data=request.data,
            context={
                "request": request,
                "category_preferences": _category_preferences_map(request.user),
            },
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class BudgetView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        budgets = Budget.objects.filter(user=user).select_related("category").order_by("category__name")
        serializer = BudgetSerializer(budgets, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BudgetSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BudgetDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        budget_instance = Budget.objects.filter(user=user, id=pk).select_related("category").first()
        if not budget_instance:
            return Response(
                {"detail": "Budget not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = BudgetSerializer(budget_instance, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        user = request.user
        budget_instance = Budget.objects.filter(user=user, id=pk).select_related("category").first()
        if not budget_instance:
            return Response(
                {"detail": "Budget not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = BudgetSerializer(budget_instance, data=request.data, context={"request": request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        user = request.user
        budget_instance = Budget.objects.filter(user=user, id=pk).first()
        if not budget_instance:
            return Response(
                {"detail": "Budget not found."}, status=status.HTTP_404_NOT_FOUND
            )
        budget_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class BudgetSummaryView(APIView):
    """
    Aggregated spend vs budget for a date window. Not paginated: one row per budget in range.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")

        if not from_date or not to_date:
            return Response(
                {"detail": "Query params 'from' and 'to' are required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            from_date = expanse_utils.convert_date_to_datetime(from_date)
            to_date = expanse_utils.convert_date_to_datetime(to_date)
        except Exception:
            return Response(
                {"detail": "Query params 'from' and 'to' must be in the format YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if from_date > to_date:
            return Response(
                {"detail": "Query param 'from' must be before 'to'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        budget_catch_key = f"budget_summary_{request.user.id}_{from_date}_{to_date}"
        cached = cache.get(budget_catch_key)
        if cached is not None:
            return Response(cached, status=status.HTTP_200_OK)

        budget_qs = Budget.objects.filter(user=request.user).select_related("category").order_by("category__name")
        response_data = []

        for budget in budget_qs:
            if budget.category is None:
                total_spend = (
                    Expanse.objects.filter(
                        user=request.user,
                        date__gte=from_date,
                        date__lte=to_date,
                    ).aggregate(total=Sum("amount"))["total"]
                    or 0
                )
            else:
                total_spend = (
                    Expanse.objects.filter(
                        user=request.user,
                        category=budget.category,
                        date__gte=from_date,
                        date__lte=to_date,
                    ).aggregate(total=Sum("amount"))["total"]
                    or 0
                )
            budget_amount = float(budget.amount)
            spent = float(total_spend)
            percent_used = (spent / budget_amount) * 100 if budget_amount else 0
            remaining_amount = budget_amount - spent
            response_data.append(
                {
                    "id": budget.id,
                    "category": budget.category_id,
                    "category_name": budget.category.name if budget.category else None,
                    "budget_amount": budget_amount,
                    "spent_amount": spent,
                    "remaining_amount": round(remaining_amount, 2),
                    "progress_percent": round(percent_used, 2),
                    "is_over_budget": spent > budget_amount,
                }
            )
        cache.set(budget_catch_key, response_data, timeout=300)
        return Response(response_data, status=status.HTTP_200_OK)

class DashboardSummaryView(APIView):
    """
    Aggregated spend vs income for a date window. Not paginated: one row per category + overall.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")

        if not from_date or not to_date:
            return Response(
                {"detail": "Query params 'from' and 'to' are required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            from_date = expanse_utils.convert_date_to_datetime(from_date)
            to_date = expanse_utils.convert_date_to_datetime(to_date)
        except Exception:
            return Response(
                {"detail": "Query params 'from' and 'to' must be in the format YYYY-MM-DD."},   
                status=status.HTTP_400_BAD_REQUEST,
            )
        if from_date > to_date:
            return Response(
                {"detail": "Query param 'from' must be before 'to'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        total_last_month_spend = None
        total_last_month_income = None
        total_last_month_net = None
        last_month_spend_change_percent = None
        last_month_income_change_percent = None
        last_month_net_change_percent = None
        last_month_saving_rate = None

        today = timezone.now().date()
        _, last_day_cur = calendar.monthrange(today.year, today.month)
        current_month_start = today.replace(day=1)
        current_month_end = today.replace(day=last_day_cur)
        is_current_calendar_month = from_date == current_month_start and to_date == current_month_end

        if is_current_calendar_month:
            last_month_start, last_month_end = expanse_utils.get_last_month_start_and_end_date(from_date)
            total_last_month_spend = Expanse.objects.filter(
                user=request.user, date__gte=last_month_start, date__lte=last_month_end
            ).aggregate(total=Sum("amount"))["total"] or 0
            total_last_month_income = Income.objects.filter(
                user=request.user, date__gte=last_month_start, date__lte=last_month_end
            ).aggregate(total=Sum("amount"))["total"] or 0
            total_last_month_net = total_last_month_income - total_last_month_spend

        total_monthly_spend = Expanse.objects.filter(user=request.user, date__gte=from_date, date__lte=to_date).aggregate(total=Sum("amount"))["total"] or 0
        total_monthly_income = Income.objects.filter(user=request.user, date__gte=from_date, date__lte=to_date).aggregate(total=Sum("amount"))["total"] or 0
        total_monthly_net = total_monthly_income - total_monthly_spend
        saving_rate = ((total_monthly_net / total_monthly_income) * 100) if total_monthly_income and total_monthly_income != 0 else 0

        if is_current_calendar_month:
            last_month_spend_change_percent = (
                ((total_monthly_spend - total_last_month_spend) / total_last_month_spend) * 100
                if total_last_month_spend
                else (0.0 if total_monthly_spend == 0 else 100.0)
            )
            last_month_income_change_percent = (
                ((total_monthly_income - total_last_month_income) / total_last_month_income) * 100
                if total_last_month_income
                else (0.0 if total_monthly_income == 0 else 100.0)
            )
            if total_last_month_net != 0:
                last_month_net_change_percent = (
                    (total_monthly_net - total_last_month_net) / abs(total_last_month_net)
                ) * 100
            else:
                last_month_net_change_percent = 0.0 if total_monthly_net == 0 else 100.0
            if total_last_month_income and total_last_month_income != 0:    
                last_month_saving_rate = ((total_last_month_net / total_last_month_income) * 100)
            else:
                last_month_saving_rate = None
        return Response(
            {
                "total_monthly_spend": round(total_monthly_spend, 2),
                "total_monthly_income": round(total_monthly_income, 2),
                "total_last_month_spend": round(total_last_month_spend, 2) if total_last_month_spend is not None else None,
                "total_last_month_income": round(total_last_month_income, 2) if total_last_month_income is not None else None,
                "last_month_spend_change_percent": round(last_month_spend_change_percent, 2) if last_month_spend_change_percent is not None else None,
                "last_month_income_change_percent": round(last_month_income_change_percent, 2) if last_month_income_change_percent is not None else None,
                "net_monthly": round(total_monthly_net, 2),
                "net_last_month": round(total_last_month_net, 2) if total_last_month_net is not None else None,
                "last_month_net_change_percent": round(last_month_net_change_percent, 2) if last_month_net_change_percent is not None else None,
                "saving_rate_percent": round(saving_rate, 2) if saving_rate is not None else None,
                "last_month_saving_rate_percent": round(last_month_saving_rate, 2) if last_month_saving_rate is not None else None,
            },
            status=status.HTTP_200_OK,
        )

class FinanceTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year", timezone.now().year)

        try:
            year = int(year)
        except ValueError:
            return Response(
                {"detail": "Query param 'year' must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        monthly_data = []
        start_month = 1 
        end_month = 12 if year < timezone.now().year  else timezone.now().month
        for month in range(start_month, end_month + 1):
            start_date = timezone.datetime(year, month, 1).date()
            if month == 12:
                end_date = timezone.datetime(year + 1, 1, 1).date() - timedelta(days=1)
            else:
                end_date = timezone.datetime(year, month + 1, 1).date() - timedelta(days=1)
            
            month_name = start_date.strftime("%B")
            total_monthly_spend = Expanse.objects.filter(user=request.user, date__gte=start_date, date__lte=end_date).aggregate(total=Sum("amount"))["total"] or 0
            total_monthly_income = Income.objects.filter(user=request.user, date__gte=start_date, date__lte=end_date).aggregate(total=Sum("amount"))["total"] or 0
            net_monthly = total_monthly_income - total_monthly_spend

            monthly_data.append(
                {
                    "month": month_name,
                    "total_spend": total_monthly_spend,
                    "total_income": total_monthly_income,
                    "net": net_monthly,
                }
            )
        
        return Response(monthly_data, status=status.HTTP_200_OK)


class CategoryBreakdownView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")
        if not from_date or not to_date:
            return Response(
                {"detail": "Query params 'from' and 'to' are required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            from_date = expanse_utils.convert_date_to_datetime(from_date)
            to_date = expanse_utils.convert_date_to_datetime(to_date)
        except Exception:
            return Response(
                {"detail": "Query params 'from' and 'to' must be in the format YYYY-MM-DD."},   
                status=status.HTTP_400_BAD_REQUEST,
            )
        if from_date > to_date:
            return Response(
                {"detail": "Query param 'from' must be before 'to'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        category_breakdown = Expanse.objects.filter(user=request.user, date__gte=from_date, date__lte=to_date).select_related("category").values("category__name").annotate(total=Sum("amount"))
        total_amount = Expanse.objects.filter(user=request.user, date__gte=from_date, date__lte=to_date).aggregate(total=Sum("amount"))["total"] or 0
        for item in category_breakdown:
            item["percentage"] = round((item["total"] / total_amount) * 100, 2)
        category_breakdown = sorted(category_breakdown, key=lambda x: x["percentage"], reverse=True)
        return Response(category_breakdown, status=status.HTTP_200_OK)


            
class GetYearsViews(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        years = Expanse.objects.filter(user=user).values_list("date__year", flat=True).distinct().order_by("-date__year")
        if not years:
            return Response([timezone.now().year], status=status.HTTP_200_OK)
        return Response(list(years), status=status.HTTP_200_OK)


class GetRecentTransactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        prefs = _category_preferences_map(user)
        # union() cannot be followed by select_related(); merge in Python instead.
        expenses = (
            Expanse.objects.filter(user=user)
            .select_related("category")
            .order_by("-date", "-id")[:25]
        )
        incomes = (
            Income.objects.filter(user=user)
            .select_related("category")
            .order_by("-date", "-id")[:25]
        )
        merged = [
            _recent_transaction_row(e, "expense", prefs) for e in expenses
        ] + [
            _recent_transaction_row(i, "income", prefs) for i in incomes
        ]
        merged.sort(key=lambda row: (row["date"], row["id"]), reverse=True)
        return Response(merged[:5], status=status.HTTP_200_OK)