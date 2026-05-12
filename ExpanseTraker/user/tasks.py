from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.crypto import get_random_string
from email.mime.image import MIMEImage
from django.utils import timezone
from .models import User, VerificationToken, PasswordResetToken


@shared_task
def send_verification_email(user_id):
    try:
        user = User.objects.get(id=user_id)
        if not user.is_verified:
            token_qs = VerificationToken.objects.filter(user=user).order_by(
                "-created_at"
            )
            token = token_qs.first()
            if not token:
                token = VerificationToken.objects.create(
                    user=user, token=get_random_string(32)
                )
            base_domain = (settings.DOMAIN or "").rstrip("/")
            verification_link = (
                f"{base_domain}/api/v1/user/verify/{token.token}/"
                if base_domain
                else f"/api/v1/user/verify/{token.token}/"
            )

            subject = "Verify your ExpanseTraker account"
            context = {
                "user": user,
                "verification_link": verification_link,
                "app_name": "ExpanseTraker",
            }
            html_content = render_to_string(
                "email_verification.html",
                context,
            )
            text_content = strip_tags(html_content)

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            msg.attach_alternative(html_content, "text/html")
            try:
                logo_path = settings.BASE_DIR / "media" / "branding" / "logo.png"
                with open(logo_path, "rb") as f:
                    img = MIMEImage(f.read())
                img.add_header("Content-ID", "<finstackai_logo>")
                img.add_header("Content-Disposition", "inline", filename="logo.png")
                msg.attach(img)
            except Exception:
                # Email still works even if logo is missing/unreadable.
                pass
            msg.send(fail_silently=False)
            
    except User.DoesNotExist:
        print(f"User with id {user_id} does not exist.")


@shared_task
def send_password_reset_email(user_id):
    try:
        user = User.objects.get(id=user_id)
        if user.is_active :
            # Generate password reset token and send email

            token_qs = PasswordResetToken.objects.filter(user=user, expires_at__gt=timezone.now()).order_by("-created_at")
            if token_qs.exists():
                token = token_qs.first()
            else:
                token = PasswordResetToken.objects.create(
                    user=user, token=get_random_string(32), expires_at=timezone.now() + timezone.timedelta(minutes=15)
                )
            base_domain = (settings.FRONTEND_URL or "").rstrip("/")
            reset_link = (
                f"{base_domain}/reset-password?token={token.token}"
                if base_domain
                else f"/reset-password/?token={token.token}"
            )
            subject = "Reset your ExpanseTraker password"
            context = {
                "user": user,
                "reset_link": reset_link,
                "app_name": "ExpanseTraker",
                "expires_in_minutes": 15,
                "expires_at": getattr(token, "expires_at", None),
            }
            html_content = render_to_string(
                "password_reset_email.html",
                context,
            )
            text_content = strip_tags(html_content)
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            msg.attach_alternative(html_content, "text/html")
            try:
                logo_path = settings.BASE_DIR / "media" / "branding" / "logo.png"
                with open(logo_path, "rb") as f:
                    img = MIMEImage(f.read())
                img.add_header("Content-ID", "<finstackai_logo>")
                img.add_header("Content-Disposition", "inline", filename="logo.png")
                msg.attach(img)
            except Exception:
                # Email still works even if logo is missing/unreadable.
                pass
            msg.send(fail_silently=False)
    except User.DoesNotExist:
        print(f"User with id {user_id} does not exist.")

@shared_task
def delete_expired_password_reset_tokens():
    now = timezone.now()
    expired_tokens = PasswordResetToken.objects.filter(expires_at__lt=now)
    count = expired_tokens.count()
    expired_tokens.delete()
    print(f"Deleted {count} expired password reset tokens.")