import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ExpanseTraker.settings")

app = Celery("ExpanseTraker")
app.config_from_object("django.conf:settings", namespace="CELERY")  
app.autodiscover_tasks()
# Celery Beat Schedule - Define periodic tasks
app.conf.beat_schedule = {
    'create_recurring_expanses': {
        'task': 'expanse.tasks.create_recurring_expanses',
        'schedule': crontab(hour=0, minute=0),  # Run daily at midnight
    },  
    'create_recurring_incomes': {
        'task': 'expanse.tasks.create_recurring_incomes',
        'schedule': crontab(hour=0, minute=0),  # Run daily at midnight
    },
}
 


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")