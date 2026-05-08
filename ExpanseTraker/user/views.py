from django.utils import timezone
from django.shortcuts import render
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import  TokenObtainPairView
from .models import User, VerificationToken , PasswordResetToken
from .serializers import UserSerializer
from .tasks import send_verification_email,send_password_reset_email
from rest_framework.throttling import ScopedRateThrottle
from .utils import s3
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
    
    def patch(self, request):
        user = request.user
        queryset = User.active_objects.filter(id=user.id)
        if not queryset.exists():
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserSerializer(queryset.first(), data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RequestPasswordReset(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'
    def post(self, request):
        email = request.data.get("email")
        user = User.active_objects.filter(email=email).first()
        if not user or not user.is_active :
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        send_password_reset_email.delay(user.id)
        return Response(
            {"message": "Password reset link sent successfully"},
            status=status.HTTP_200_OK,
        )

class ResetPasswordView(APIView):
        def post(self, request):
            toekn = request.data.get("token")
            new_password = request.data.get("new_password")
            token_qs = PasswordResetToken.objects.filter(token=toekn, expires_at__gt=timezone.now()).order_by("-created_at")
            print(token_qs)
            if not token_qs.exists():
                return Response(
                    {"error": "Invalid or expired token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = token_qs.first()
            user = token.user
            user.set_password(new_password)
            user.save()
            token.delete()
            return Response(
                {"message": "Password reset successfully"},
                status=status.HTTP_200_OK,  
            )

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
     

class UploadProfilePicture(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        file = request.FILES.get("profile_picture")
        if not file:
            return Response(
                {"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        file_url = s3.upload_profile_picture_to_s3(file, user.id)
        if not file_url:
            return Response(
                {"error": "Failed to upload profile picture"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        user.profile_picture = file_url
        user.save()
        return Response(
            {"message": "Profile picture uploaded successfully", "profile_picture": file_url},
            status=status.HTTP_200_OK,
        )
