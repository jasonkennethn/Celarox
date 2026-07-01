from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Create a superuser with predefined credentials"

    def handle(self, *args, **options):
        username = "jasonkennethn"
        email = "jasonkennethn@gmail.com"
        password = "Nerellas@123"

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username, email=email, password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f"Successfully created superuser {username}")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"Superuser {username} already exists")
            )
