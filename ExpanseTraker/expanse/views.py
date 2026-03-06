from django.db.models import Q
from django.shortcuts import render
from rest_framework import status

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Budget, Expanse, Income, category
from .serializers import CategorySerializer, ExpanseSerializer, IncomeSerializer


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
