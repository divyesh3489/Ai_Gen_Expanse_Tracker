from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

urlpatterns = [
    path('register/', views.RegisterUser.as_view(), name='register'),
    path('login/', views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', views.UserDetails.as_view(), name='user_detail'),
    path('verify/<str:token>/', views.VerifyUser.as_view(), name='verify_user'),
]