from django.contrib import admin

from .models import User, VerificationToken,PasswordResetToken

# Register your models here.

admin.site.register(User)
admin.site.register(VerificationToken)
admin.site.register(PasswordResetToken)
    
