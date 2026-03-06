from django.core.management.base import BaseCommand
from expanse.models import category

class Command(BaseCommand):
    help = "Seed initial categories"

    def handle(self, *args, **options):
        categories = [
            "Food",
            "Transport",
            "Housing",
            "Utilities",
            "Healthcare",
            "Entertainment",
            "Education",
            "Savings",
            "Personal Care",
            "Other",
        ]

        created = 0
        for name in categories:
            _, was_created = category.objects.get_or_create(name=name,is_default=True)
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Categories seeded. Created: {created}"))