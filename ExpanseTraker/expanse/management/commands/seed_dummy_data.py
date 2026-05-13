"""
Seed realistic dummy Expanse, Income, and Recurring rows for a single user.
"""
from __future__ import annotations

import random
from datetime import date, timedelta
from decimal import Decimal
from typing import Iterable, Sequence

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from expanse.models import Category, Expanse, Income, Recurring


def _money(lo: float, hi: float) -> Decimal:
    return Decimal(str(round(random.uniform(lo, hi), 2)))


def _random_date_last_months(months: int = 12) -> date:
    """Uniform random calendar day in the last `months` months (approximate span)."""
    today = timezone.localdate()
    start = today - timedelta(days=int(months * 30.4375))  # ~avg month
    span = (today - start).days
    return start + timedelta(days=random.randint(0, max(span, 1)))


def _build_category_lookup(categories: Iterable[Category]) -> dict[str, Category]:
    return {c.name.strip().lower(): c for c in categories}


def _pick_category(
    lookup: dict[str, Category],
    names: Sequence[str],
) -> Category | None:
    for raw in names:
        key = raw.strip().lower()
        if key in lookup:
            return lookup[key]
    return None


# ----- Expense weights & amounts -----
def _expense_weight(name: str) -> int:
    n = name.lower()
    if any(k in n for k in ("food", "dining", "grocery", "groceries")):
        return 10
    if "transport" in n:
        return 8
    if any(k in n for k in ("shopping", "clothing", "clothes")):
        return 8
    if any(k in n for k in ("housing", "rent")):
        return 3
    if any(k in n for k in ("utility", "utilities", "mobile", "internet")):
        return 4
    if any(k in n for k in ("health", "care", "medical", "doctor")):
        return 4
    if any(k in n for k in ("entertain", "movie", "subscription")):
        return 5
    if "education" in n:
        return 3
    if "travel" in n:
        return 3
    return 2


def _expense_amount_and_note(cat: Category | None) -> tuple[Decimal, str]:
    if cat is None:
        return _money(100, 3000), random.choice(
            ["Misc purchase", "Cash expense", "Small expense", "General expense"]
        )
    n = cat.name.lower()
    # Food / Dining / Groceries
    if any(k in n for k in ("food", "dining", "grocery", "groceries")):
        note = random.choice(
            [
                "Lunch at office",
                "Dinner with family",
                "Ordered on Zomato",
                "Swiggy order",
                "Coffee at Starbucks",
                "Team lunch",
                "Weekend brunch",
                "Grocery run",
                "Snacks and beverages",
            ]
        )
        return _money(100, 2000), note
    if "transport" in n:
        return _money(50, 500), random.choice(
            [
                "Uber to airport",
                "Monthly metro pass",
                "Fuel refill",
                "Ola cab to office",
                "Auto fare",
                "Parking charges",
                "Train ticket",
            ]
        )
    if any(k in n for k in ("housing", "rent")):
        return _money(5000, 25000), random.choice(
            [
                "Monthly rent",
                "Society maintenance",
                "Rent for January",
                "Advance rent payment",
            ]
        )
    if any(k in n for k in ("utility", "utilities")):
        return _money(200, 2000), random.choice(
            ["Electricity bill", "Water bill", "Gas cylinder", "Piped gas bill"]
        )
    if any(k in n for k in ("health", "personal care")) or "medical" in n:
        return _money(300, 5000), random.choice(
            [
                "Doctor consultation",
                "Medicine purchase",
                "Lab tests",
                "Pharmacy bill",
                "Health checkup",
                "Dental visit",
            ]
        )
    if any(k in n for k in ("entertain", "movie")) or "subscription" in n:
        return _money(100, 1500), random.choice(
            [
                "Movie tickets",
                "Netflix plan upgrade",
                "Concert tickets",
                "Amusement park",
                "OTT subscription",
                "Gaming top-up",
            ]
        )
    if any(k in n for k in ("shopping", "clothing")):
        return _money(200, 5000), random.choice(
            [
                "Amazon order",
                "Flipkart sale purchase",
                "Clothes shopping",
                "New shoes",
                "Accessories",
                "Home decor",
            ]
        )
    if "education" in n:
        return _money(500, 10000), random.choice(
            [
                "Online course fee",
                "Book purchase",
                "Coaching class fee",
                "Workshop registration",
                "Udemy course",
            ]
        )
    if "travel" in n:
        return _money(1000, 20000), random.choice(
            [
                "Flight tickets",
                "Hotel booking",
                "Goa trip",
                "Weekend getaway",
                "Travel insurance",
                "Cab booking for trip",
            ]
        )
    return _money(100, 3000), random.choice(
        ["Misc expense", "General purchase", "Card payment", "Store purchase"]
    )


# ----- Income -----
def _income_weight(name: str) -> int:
    n = name.lower()
    if any(k in n for k in ("salary", "wage", "payroll", "pay")):
        return 12
    if any(k in n for k in ("freelance", "consult", "contract")):
        return 6
    if any(k in n for k in ("business", "trade")):
        return 4
    if any(k in n for k in ("invest", "dividend", "stock")):
        return 7
    if "rent" in n:
        return 5
    if "bonus" in n or "incentive" in n:
        return 5
    if any(k in n for k in ("side", "hustle", "gig")):
        return 5
    if "savings" in n:
        return 6
    return 3


def _income_amount_and_note(cat: Category | None) -> tuple[Decimal, str]:
    notes = [
        "Monthly salary credit",
        "Freelance project payment",
        "Client payment received",
        "Dividend credited",
        "Rental income",
        "Performance bonus",
        "Annual bonus",
        "Side project income",
        "Consulting fee",
        "Investment returns",
    ]
    if cat is None:
        return _money(5000, 80000), random.choice(notes)
    n = cat.name.lower()
    if any(k in n for k in ("salary", "wage", "payroll")):
        return _money(40000, 120000), random.choice(
            ["Monthly salary credit", "Performance bonus", "Annual bonus"]
        )
    if any(k in n for k in ("freelance", "consult")):
        return _money(5000, 50000), random.choice(
            ["Freelance project payment", "Client payment received", "Consulting fee"]
        )
    if "business" in n:
        return _money(10000, 80000), random.choice(
            ["Client payment received", "Business revenue", "Side project income"]
        )
    if any(k in n for k in ("invest", "dividend", "stock")) or "savings" == n:
        return _money(1000, 20000), random.choice(
            ["Dividend credited", "Investment returns", "Monthly SIP returns"]
        )
    if "rent" in n:
        return _money(8000, 30000), random.choice(["Rental income", "Tenant payment"])
    if "bonus" in n:
        return _money(5000, 50000), random.choice(
            ["Performance bonus", "Annual bonus", "Year-end bonus"]
        )
    if any(k in n for k in ("side", "gig", "hustle")):
        return _money(2000, 15000), random.choice(
            ["Side project income", "Gig payment", "Weekend work payment"]
        )
    return _money(5000, 60000), random.choice(notes)


class Command(BaseCommand):
    help = (
        "Remove all expanses, incomes, and recurring rows for the target user, then seed "
        "~100 expenses, ~70 incomes, and ~30 recurring records (default email: admin@gmail.com)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            default="admin@gmail.com",
            help="Target user email (default: admin@gmail.com)",
        )

    def handle(self, *args, **options):
        email = options["email"].strip()
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as exc:
            raise CommandError(f"No user found with email: {email}") from exc

        with transaction.atomic():
            e_del, _ = Expanse.objects.filter(user=user).delete()
            i_del, _ = Income.objects.filter(user=user).delete()
            r_del, _ = Recurring.objects.filter(user=user).delete()
            self.stdout.write(
                self.style.WARNING(
                    f"Removed existing data for {email}: "
                    f"{e_del} expanses, {i_del} incomes, {r_del} recurring."
                )
            )

            all_categories = list(Category.objects.all())
            cat_lookup = _build_category_lookup(all_categories)
            expense_cats = [c for c in all_categories if c.type == "expense"]
            income_cats = [c for c in all_categories if c.type == "income"]

            # --- Expenses (100) ---
            exp_weights = (
                [_expense_weight(c.name) for c in expense_cats]
                if expense_cats
                else []
            )
            exp_total = 0
            for _ in range(100):
                if expense_cats and exp_weights:
                    cat = random.choices(expense_cats, weights=exp_weights, k=1)[0]
                else:
                    cat = None
                amount, note = _expense_amount_and_note(cat)
                Expanse.objects.create(
                    user=user,
                    category=cat,
                    amount=amount,
                    note=note,
                    date=_random_date_last_months(12),
                )
                exp_total += 1

            # --- Income (70) ---
            inc_weights = (
                [_income_weight(c.name) for c in income_cats] if income_cats else []
            )
            inc_total = 0
            for _ in range(70):
                if income_cats and inc_weights:
                    cat = random.choices(income_cats, weights=inc_weights, k=1)[0]
                else:
                    cat = None
                amount, note = _income_amount_and_note(cat)
                Income.objects.create(
                    user=user,
                    category=cat,
                    amount=amount,
                    note=note,
                    date=_random_date_last_months(12),
                )
                inc_total += 1

            # --- Recurring (30) ---
            recurring_specs: list[dict] = [
                {
                    "note": "Netflix subscription",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": Decimal("649.00"),
                    "cats": ("Subscriptions", "Entertainment"),
                },
                {
                    "note": "Spotify Premium",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": Decimal("119.00"),
                    "cats": ("Subscriptions",),
                },
                {
                    "note": "Gym membership",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(800, 2000),
                    "cats": ("Fitness", "Personal Care"),
                },
                {
                    "note": "House rent",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(10000, 30000),
                    "cats": ("Housing",),
                },
                {
                    "note": "Internet bill",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(500, 1500),
                    "cats": ("Mobile & Internet", "Utilities"),
                },
                {
                    "note": "Mobile recharge",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(200, 600),
                    "cats": ("Mobile & Internet",),
                },
                {
                    "note": "Electricity bill",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(500, 3000),
                    "cats": ("Utilities",),
                },
                {
                    "note": "Monthly SIP / investment",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(1000, 10000),
                    "cats": ("Other", "Subscriptions", "Debt Payments"),
                },
                {
                    "note": "Salary credit",
                    "type": "income",
                    "frequency": "monthly",
                    "amount": _money(50000, 120000),
                    "cats": ("Investments", "Savings"),
                },
                {
                    "note": "Health insurance premium",
                    "type": "expense",
                    "frequency": "yearly",
                    "amount": _money(2000, 10000),
                    "cats": ("Insurance", "Healthcare"),
                },
                {
                    "note": "Car insurance premium",
                    "type": "expense",
                    "frequency": "yearly",
                    "amount": _money(5000, 15000),
                    "cats": ("Insurance",),
                },
                {
                    "note": "Home loan EMI",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(3000, 20000),
                    "cats": ("Debt Payments", "Housing"),
                },
                {
                    "note": "Magazine subscription",
                    "type": "expense",
                    "frequency": "yearly",
                    "amount": _money(200, 500),
                    "cats": ("Subscriptions", "Entertainment"),
                },
                {
                    "note": "Weekly groceries estimate",
                    "type": "expense",
                    "frequency": "weekly",
                    "amount": _money(1500, 4000),
                    "cats": ("Groceries", "Food"),
                },
                {
                    "note": "Office commute pass",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(800, 2500),
                    "cats": ("Transport",),
                },
                {
                    "note": "Water bill",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(300, 1200),
                    "cats": ("Utilities",),
                },
                {
                    "note": "Domestic help salary",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(4000, 12000),
                    "cats": ("Other", "Housing"),
                },
                {
                    "note": "Cloud storage subscription",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(150, 800),
                    "cats": ("Subscriptions", "Electronics"),
                },
                {
                    "note": "Parking slot fee",
                    "type": "expense",
                    "frequency": "monthly",
                    "amount": _money(500, 2000),
                    "cats": ("Housing", "Transport"),
                },
                {
                    "note": "Quarterly advance tax",
                    "type": "expense",
                    "frequency": "yearly",
                    "amount": _money(5000, 25000),
                    "cats": ("Taxes",),
                },
            ]

            # Pad to 30 with varied realistic rows
            extra_templates = [
                ("Apple Music", "expense", "monthly", (99, 179), ("Subscriptions",)),
                ("YouTube Premium", "expense", "monthly", (129, 299), ("Subscriptions",)),
                ("Amazon Prime", "expense", "yearly", (1499, 1499), ("Subscriptions", "Entertainment")),
                ("Hotstar / Disney+", "expense", "yearly", (899, 1499), ("Entertainment",)),
                ("Professional gym (annual)", "expense", "yearly", (12000, 24000), ("Fitness",)),
                ("Mutual fund SIP", "expense", "monthly", (1500, 15000), ("Other", "Debt Payments")),
                ("Freelance retainer (in)", "income", "monthly", (15000, 45000), ("Investments", "Savings")),
                ("Dividend reinvestment note", "income", "yearly", (2000, 15000), ("Investments",)),
                ("Rental deposit return", "income", "yearly", (5000, 20000), ("Savings",)),
                ("Child tuition", "expense", "monthly", (3000, 15000), ("Education",)),
            ]

            for title, rtype, freq, amt_spec, cat_names in extra_templates:
                if len(recurring_specs) >= 30:
                    break
                if isinstance(amt_spec, tuple):
                    amt = _money(amt_spec[0], amt_spec[1]) if amt_spec[0] != amt_spec[1] else Decimal(str(amt_spec[0]))
                else:
                    amt = Decimal(str(amt_spec))
                recurring_specs.append(
                    {
                        "note": title,
                        "type": rtype,
                        "frequency": freq,
                        "amount": amt,
                        "cats": cat_names,
                    }
                )

            # Ensure exactly 30 specs
            while len(recurring_specs) < 30:
                recurring_specs.append(
                    {
                        "note": f"Misc recurring {len(recurring_specs) + 1}",
                        "type": random.choice(("expense", "income")),
                        "frequency": random.choice(("weekly", "monthly", "yearly")),
                        "amount": _money(100, 5000),
                        "cats": tuple(),
                    }
                )

            recurring_specs = recurring_specs[:30]

            rec_total = 0
            today = timezone.localdate()
            for spec in recurring_specs:
                cat = _pick_category(cat_lookup, spec["cats"])
                start = _random_date_last_months(14)
                # Keep recurring plausible: no end date (ongoing)
                next_run = min(start + timedelta(days=random.randint(0, 60)), today)
                Recurring.objects.create(
                    user=user,
                    category=cat,
                    amount=spec["amount"],
                    note=spec["note"],
                    start_date=start,
                    end_date=None,
                    next_run_date=next_run,
                    frequency=spec["frequency"],
                    type=spec["type"],
                    is_active=True,
                )
                rec_total += 1

            total = exp_total + inc_total + rec_total

        self.stdout.write(self.style.SUCCESS(f"✓ Created {exp_total} expenses"))
        self.stdout.write(self.style.SUCCESS(f"✓ Created {inc_total} income records"))
        self.stdout.write(self.style.SUCCESS(f"✓ Created {rec_total} recurring records"))
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Seed complete. Total: {total} records created for {email}"
            )
        )
