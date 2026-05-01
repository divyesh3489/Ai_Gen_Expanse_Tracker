from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError
import time

class Command(BaseCommand):
    help = "Waits for the database to be available before starting the application."

    def handle(self, *args, **options):
        self.stdout.write("Waiting for the database to be available...")
        retry_count = 0
        max_retries = 5
        db_conn = None
        while not db_conn and retry_count < max_retries:
            try:
                db_conn = connections["default"]
                db_conn.cursor()
            except OperationalError:
                self.stdout.write("Database unavailable, waiting 1 second...")
                time.sleep(1)
            retry_count += 1
        if db_conn:
            self.stdout.write(self.style.SUCCESS("Database is available!"))
        else:
            self.stdout.write(self.style.ERROR("Failed to connect to the database."))