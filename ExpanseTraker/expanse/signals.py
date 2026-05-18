from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from .models import Budget,Expanse
from django.core.cache import cache
from .utils import clear_budget_cache


@receiver(post_save, sender=Budget)
@receiver(post_delete, sender=Budget)
@receiver(post_save, sender=Expanse)
@receiver(post_delete, sender=Expanse)
def invalidate_budget_cache(sender, instance, **kwargs):
    clear_budget_cache(cache, instance.user_id, "summary", "overall")