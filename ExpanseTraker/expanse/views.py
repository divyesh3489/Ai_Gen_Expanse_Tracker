from django.db.models import Q,Sum
from django.shortcuts import render
from rest_framework import status

# Create your views here.
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Budget, Expanse, Income, Category,Recurring,UserCategoryPreference
from .serializers import BudgetSerializer, CategorySerializer, ExpanseSerializer, IncomeSerializer, RecurringSerializer, UserCategoryPreferenceSerializer


class CategoryView(APIView):
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
        expanses = Expanse.objects.filter(user=request.user).order_by("-date","-id")
        serializer = self.serializer_class(expanses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
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
        serializer = self.serializer_class(expanse_instance)
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
            expanse_instance, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncomeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get(self, request):
        incomes = Income.objects.filter(user=request.user).order_by("-date","-id")
        serializer = self.serializer_class(incomes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
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
        serializer = self.serializer_class(income_instance)
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
            income_instance, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecurringView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecurringSerializer

    def get(self, request):
        recurring_expanses = Recurring.recurringObjects.filter(user=request.user).select_related('category').order_by("-created_at","id")
        serializer = self.serializer_class(recurring_expanses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):    
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
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
        serializer = self.serializer_class(reccuring_instance)
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
            reccuring_instance, data=request.data, context={"request": request}, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class BudgetView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get(self, request):
        budgets = Budget.objects.filter(user=request.user).select_related("category").order_by("-id")
        serializer = self.serializer_class(budgets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BudgetDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get(self, request, pk):
        budget = Budget.objects.filter(user=request.user, id=pk).select_related("category").first()
        if not budget:
            return Response({"detail": "Budget not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(budget)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        budget = Budget.objects.filter(user=request.user, id=pk).first()
        if not budget:
            return Response({"detail": "Budget not found."}, status=status.HTTP_404_NOT_FOUND)
        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, pk):
        budget = Budget.objects.filter(user=request.user, id=pk).first()
        if not budget:
            return Response({"detail": "Budget not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(budget, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        budget = Budget.objects.filter(user=request.user, id=pk).first()
        if not budget:
            return Response({"detail": "Budget not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(
            budget, data=request.data, context={"request": request}, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BudgetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = request.query_params.get("from")
        end = request.query_params.get("to")
        if not start or not end:
            return Response(
                {"detail": "Query params 'from' and 'to' are required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        budgets = (
            Budget.objects.filter(user=request.user, start_date__lte=end, end_date__gte=start)
            .select_related("category")
            .order_by("id")
        )

        results = []
        for b in budgets:
            expanse_qs = Expanse.objects.filter(user=request.user, date__gte=start, date__lte=end)
            if b.category_id is not None:
                expanse_qs = expanse_qs.filter(category_id=b.category_id)

            spent = expanse_qs.aggregate(total=Sum("amount"))["total"] or 0
            remaining = b.amount - spent
            progress = (spent / b.amount * 100) if b.amount and b.amount != 0 else None

            results.append(
                {
                    "id": b.id,
                    "category": b.category_id,
                    "category_name": b.category.name if b.category_id else None,
                    "budget_amount": b.amount,
                    "period_start": b.start_date,
                    "period_end": b.end_date,
                    "spent_amount": spent,
                    "remaining_amount": remaining,
                    "progress_percent": progress,
                    "is_over_budget": remaining < 0,
                }
            )

        return Response(results, status=status.HTTP_200_OK)
