from django.shortcuts import render
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import  TokenObtainPairView
from .models import User, VerificationToken
from .serializers import UserSerializer
from .tasks import send_verification_email
from rest_framework.throttling import ScopedRateThrottle

# Create your views here.


class RegisterUser(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            send_verification_email.delay(serializer.instance.id)

            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = User.active_objects.filter(id=user.id)
        if not queryset.exists():
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserSerializer(queryset.first())
        return Response(serializer.data, status=status.HTTP_200_OK)
        

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        user = User.active_objects.filter(email=request.data.get("email")).first()
        if not user:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"error": "User Not Found"}, status=status.HTTP_404_NOT_FOUND
            )
        if not user.is_verified:
            return Response(
                {"error": "User Not Verified Please Verify Your Account"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().post(request, *args, **kwargs)


class VerifyUser(APIView):
    def get(self, request, token):
        try:
            verification_token = VerificationToken.objects.get(token=token)
            user = verification_token.user
            user.is_verified = True
            user.save()
            verification_token.delete()
            
            # Render success template with auto-redirect
            context = {
                'redirect_url': settings.FRONTEND_LOGIN_URL
            }
            return render(request, 'email_verified.html', context)
            
        except VerificationToken.DoesNotExist:
            context = {
                'redirect_url': settings.FRONTEND_LOGIN_URL,
                'app_name': 'ExpanseTraker',
            }
            return render(request, 'invalid_token.html', context, status=400)

class ResendVerificationEmail(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'email_verification'
    def post(self, request):
        email = request.data.get("email")
        user = User.active_objects.filter(email=email).first()
        if not user:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if user.is_verified:
            return Response(
                {"message": "User is already verified"}, status=status.HTTP_200_OK
            )
        send_verification_email.delay(user.id)
        return Response(
            {"message": "Verification email resent successfully"},
            status=status.HTTP_200_OK,
        )
     