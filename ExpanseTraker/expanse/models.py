from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.db.models import Q
from datetime import timedelta

# Create your models here.


class baseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_%(class)s",
    )
    updated_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_%(class)s",
    )

    class Meta:
        abstract = True


class category(baseModel):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="categories",
    )
    is_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ('name', 'user')
    
        

    def __str__(self):
        return self.name


class Expanse(baseModel):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="expanses",
    )
    category = models.ForeignKey(
        category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expanses",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    date = models.DateField()


class Income(baseModel):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="incomes",
    )
    category = models.ForeignKey(
        category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incomes",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    date = models.DateField()


class Budget(baseModel):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="budgets",
    )
    category = models.ForeignKey(
        category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="budgets",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()


class RrcurringManager(models.Manager):
    def get_queryset(self):
        return  super().get_queryset().filter(is_active=True)
    
    def due_recurrings(self):
        today = timezone.now().date()
        return self.get_queryset().filter(Q(next_run_date__lte=today) | Q(next_run_date__isnull=True))
    

    def update_next_run_date(self, recurring):
        today = timezone.now().date()
        if recurring.next_run_date is None:
            recurring.next_run_date = today 
        if recurring.frequency == "daily":
            if today - recurring.next_run_date > timedelta(days=1):
                recurring.next_run_date = today
            else:
                recurring.next_run_date += timedelta(days=1)
        elif recurring.frequency == "weekly":
            recurring.next_run_date += timedelta(days=7)
        elif recurring.frequency == "monthly":
            recurring.next_run_date += relativedelta(months=1)
        elif recurring.frequency == "yearly":
            recurring.next_run_date += relativedelta(years=1) 
        recurring.save()

    def stop_recurrings(self, recurring):
        recurring.is_active = False
        recurring.save()


class Recurring(baseModel):
    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]
    TYPE_CHOICES = [
        ("expense", "Expense"),
        ("income", "Income"),
    ]
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="recurrings",
    )
    category = models.ForeignKey(
        category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recurrings",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_run_date = models.DateField(null=True, blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    recurringObjects = RrcurringManager()
    objects = models.Manager()  # The default manager.
    
    