from django.utils import timezone
from datetime import timedelta
import calendar
def convert_date_to_datetime(date):
    return timezone.datetime.strptime(date, "%Y-%m-%d").date()

def get_last_month_start_and_end_date(date):
    last_month = date.month - 1
    if last_month == 0:
        last_month = 12
        year = date.year - 1
    else:
        year = date.year
    start_date = timezone.datetime(year, last_month, 1).date()
    end_date = timezone.datetime(year, last_month, calendar.monthrange(year, last_month)[1]).date()

    return start_date, end_date

def find_week_monday_date():
    today = timezone.now().date()
    return today - timedelta(days=today.weekday())
def find_month_start_date():
    today = timezone.now().date()
    return timezone.datetime(today.year, today.month, 1).date()

def find_year_start_date():
    today = timezone.now().date()
    return timezone.datetime(today.year, 1, 1).date()

def get_start_date_according_to_frequency(frequency):
    if frequency == "weekly":
        return find_week_monday_date()
    elif frequency == "monthly":
        return find_month_start_date()
    elif frequency == "yearly":
        return find_year_start_date()
    return timezone.now().date()


def get_start_and_end_date_according_to_frequency(frequency):
    today = timezone.now().date()
    if frequency == "weekly":
        start_date = find_week_monday_date()
        end_date = start_date + timedelta(days=6)
    elif frequency == "monthly":
        start_date = find_month_start_date()
        end_date = timezone.datetime(today.year, today.month, calendar.monthrange(today.year, today.month)[1]).date()
    elif frequency == "yearly":
        start_date = find_year_start_date()
        end_date = timezone.datetime(today.year, 12, 31).date()
    else:
        start_date = end_date = today
    return start_date, end_date

def get_budget_catch_key(user_id,category_id, budget_type):
    return f"{user_id}_{category_id}_{budget_type}"


def get_budget_data_from_cache(cache, user_id, category_id, budget_type):
    key = get_budget_catch_key(user_id, category_id, budget_type)
    return cache.get(key)

def set_budget_data_in_cache(cache, user_id, category_id, budget_type, data, timeout=3600):
    key = get_budget_catch_key(user_id, category_id, budget_type)
    cache.set(key, data, timeout)

def clear_budget_cache(cache, user_id, category_id, budget_type):
    key = get_budget_catch_key(user_id, category_id, budget_type)
    cache.delete(key)