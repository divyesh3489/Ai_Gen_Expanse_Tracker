
from celery import shared_task
from dateutil.utils import today
from .models import Recurring,Expanse,Income
from django.utils import timezone
from datetime import timedelta

@shared_task
def create_recurring_expanses():
    recurring_expanses = Recurring.recurringObjects.due_recurrings().filter(type='expense')
    print(f"Found {recurring_expanses.count()} due recurring expanses.")
    today = timezone.now().date()
    bulk_expanses = []
    for recurring in recurring_expanses:
        expanse = Expanse(
            user=recurring.user,
            category=recurring.category,
            amount=recurring.amount,
            note=recurring.note,
            date=recurring.next_run_date if recurring.next_run_date else today,
            created_by=recurring.user,
            updated_by=recurring.user
        )
        bulk_expanses.append(expanse)
        Recurring.recurringObjects.update_next_run_date(recurring)
    Expanse.objects.bulk_create(bulk_expanses)


@shared_task
def create_recurring_incomes():
    recurring_incomes = Recurring.recurringObjects.due_recurrings().filter(type='income')

    bulk_incomes = []
    print(f"Found {recurring_incomes.count()} due recurring incomes.")
    for recurring in recurring_incomes:
        income = Income(
            user=recurring.user,
            category=recurring.category,
            amount=recurring.amount,
            note=recurring.note,
            date=recurring.next_run_date if recurring.next_run_date else recurring.start_date,
            created_by=recurring.user,
            updated_by=recurring.user
        )
        bulk_incomes.append(income)
        Recurring.recurringObjects.update_next_run_date(recurring)
    Income.objects.bulk_create(bulk_incomes)

