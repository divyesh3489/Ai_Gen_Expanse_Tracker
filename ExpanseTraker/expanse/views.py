from django.db.models import Q,Sum
from django.shortcuts import render
from rest_framework import status

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Budget, Expanse, Income, category,Recurring
from .serializers import BudgetSerializer, CategorySerializer, ExpanseSerializer, IncomeSerializer, RecurringSerializer


class CategoryView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer

    def get(self, request):
        categorys = category.objects.filter(Q(user=request.user) | Q(is_default=True))
        serializer = self.serializer_class(categorys, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer

    def get(self, request, pk):
        category_instance = category.objects.filter(
            (Q(user=request.user) | Q(is_default=True)) & Q(id=pk)
        )
        print(category_instance)
        if not category_instance.exists():
            return Response(
                {"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND
            )
        category_instance = category_instance.first()
        serializer = self.serializer_class(category_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            category_instance = category.objects.filter(Q(user=request.user) & Q(id=pk))
            if not category_instance.exists():
                return Response(
                    {"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND
                )
            category_instance = category_instance.first()
            if category_instance.is_default:
                return Response(
                    {"detail": "Cannot delete a default category."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            category_instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except:
            return Response(
                {"detail": "An error occurred while trying to delete the category."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request, pk):
        try:
            category_instance = category.objects.filter(Q(user=request.user) & Q(id=pk))
            if not category_instance.exists():
                return Response(
                    {"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND
                )
            category_instance = category_instance.first()
            if category_instance.is_default:
                return Response(
                    {"detail": "Cannot update a default category."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = self.serializer_class(
                category_instance,
                data=request.data,
                context={"request": request},
                partial=True,
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error updating category: {e}")
            return Response(
                {"detail": "An error occurred while trying to update the category."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExpanseView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpanseSerializer

    def get(self, request):
        expanses = Expanse.objects.filter(user=request.user)
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
        incomes = Income.objects.filter(user=request.user)
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
        recurring_expanses = Recurring.recurringObjects.filter(user=request.user).select_related('category')
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
        budgets = Budget.objects.filter(user=request.user).select_related("category")
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
