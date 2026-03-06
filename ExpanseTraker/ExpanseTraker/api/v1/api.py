from django.urls import path, include

urlpatterns = [
    path('user/', include('user.urls')),
    path('expanse/', include('expanse.urls')),
]
