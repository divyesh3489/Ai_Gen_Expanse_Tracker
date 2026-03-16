from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.crypto import get_random_string

from .models import User, VerificationToken


@shared_task
def send_verification_email(user_id):
    try:
        user = User.objects.get(id=user_id)
        if not user.is_verified:
            token = VerificationToken.objects.create(
                user=user, token=get_random_string(length=50)
            )
            verification_link = f"{settings.DOMAIN}/user/verify/{token.token}/"

            send_mail(
                "Verify Your Account",
                f"Please click the following link to verify your account: {verification_link}",
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
    except User.DoesNotExist:
        print(f"User with id {user_id} does not exist.")