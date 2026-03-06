from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.crypto import get_random_string

from .models import User, VerificationToken


@receiver(post_save, sender=User)
def create_verification_token(sender, instance, created, **kwargs):
    if created and not instance.is_verified:
        token = VerificationToken.objects.create(
            user=instance, token=get_random_string(length=50)
        )
        verfinication_link = f"{settings.DOMAIN}/user/verify/{token.token}/"

        send_mail(
            "Verify Your Account",
            f"Please click the following link to verify your account: {verfinication_link}",
            settings.EMAIL_HOST_USER,
            [instance.email],
            fail_silently=False,
        )
