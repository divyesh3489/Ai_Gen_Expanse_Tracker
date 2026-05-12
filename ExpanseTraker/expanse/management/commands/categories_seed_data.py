from django.core.management.base import BaseCommand

from expanse.models import Category


class Command(BaseCommand):
    help = "Seed initial categories"

    def handle(self, *args, **options):
        categories = [
    {"name": "Food","icon":"FaUtensils","type":"expense"},
    {"name": "Transport","icon":"FaBus","type":"expense"},
    {"name": "Housing","icon":"FaHome","type":"expense"},
    {"name": "Utilities","icon":"FaBolt","type":"expense"},
    {"name": "Healthcare","icon":"FaHeart","type":"expense"},
    {"name": "Entertainment","icon":"FaFilm","type":"expense"},
    {"name": "Education","icon":"FaGraduationCap","type":"expense"},
    {"name": "Savings","icon":"FaPiggyBank","type":"income"},
    {"name": "Personal Care","icon":"FaUserMd","type":"expense"},
    {"name": "Other","icon":"FaEllipsisH","type":"expense"},

    {"name": "Shopping","icon":"FaShoppingCart","type":"expense"},
    {"name": "Travel","icon":"FaPlane","type":"expense"},
    {"name": "Insurance","icon":"FaShieldAlt","type":"expense"},
    {"name": "Taxes","icon":"FaFileInvoice","type":"expense"},
    {"name": "Groceries","icon":"FaShoppingBasket","type":"expense"},
    {"name": "Dining Out","icon":"FaUtensils","type":"expense"},
    {"name": "Fitness","icon":"FaRunning","type":"expense"},
    {"name": "Subscriptions","icon":"FaList","type":"expense"},
    {"name": "Gifts","icon":"FaGift","type":"expense"},
    {"name": "Pets","icon":"FaDog","type":"expense"},

    {"name": "Childcare","icon":"FaBaby","type":"expense"},
    {"name": "Investments","icon":"FaChartLine","type":"income"},
    {"name": "Debt Payments","icon":"FaDebt","type":"expense"},
    {"name": "Mobile & Internet","icon":"FaWifi","type":"expense"},
    {"name": "Clothing","icon":"FaTshirt","type":"expense"},
    {"name": "Home Maintenance","icon":"FaWrench","type":"expense"},
    {"name": "Furniture","icon":"FaCouch","type":"expense"},
    {"name": "Electronics","icon":"FaLaptop","type":"expense"},
    {"name": "Beauty","icon":"FaSprayCan","type":"expense"},
    {"name": "Donations","icon":"FaHandHoldingHeart","type":"expense"}
        ]

        created = 0
        existing = 0
        for category_data in categories:
            _, was_created = Category.objects.get_or_create(
                name=category_data["name"],
                icon=category_data["icon"],
                type=category_data["type"]
            )
            if was_created:
                created += 1
            else:
                existing += 1

        self.stdout.write(self.style.SUCCESS(f"Categories seeded. Created: {created}, Existing: {existing}"))
