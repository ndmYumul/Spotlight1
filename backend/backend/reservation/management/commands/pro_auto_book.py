from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from base.models import Building, Schedule
from reservation.models import Reservation
import datetime

class Command(BaseCommand):
    help = 'Midnight Auto-Reservation for Pro Users based on JSON weekly_schedule'

    def handle(self, *args, **kwargs):
        today_name = timezone.now().strftime('%A') 
        self.stdout.write(f"--- Starting Auto-Reserve for {today_name} ---")

        pro_users = User.objects.filter(
            userprofile__is_pro=True, 
            schedule__isnull=False
        )

        for user in pro_users:
            try:
                user_schedule = user.schedule
                weekly_data = user_schedule.weekly_schedule 

                today_tasks = [
                    item for item in weekly_data 
                    if item.get('day', '').lower() == today_name.lower()
                ]

                for task in today_tasks:
                    best_building = Building.objects.filter(totalSlots__gt=0).order_by('-totalSlots').first()

                    if best_building:
                        try:
                            s_hour = int(task.get('start_time', '09:00').split(':')[0])
                            e_hour = int(task.get('end_time', '10:00').split(':')[0])
                        except (ValueError, AttributeError):
                            s_hour, e_hour = 9, 10

                        Reservation.objects.create(
                            user=user,
                            building=best_building,
                            start_hour=s_hour,
                            end_hour=e_hour,
                            date=timezone.now().date()
                        )

                        best_building.totalSlots -= 1
                        best_building.save()

                        self.stdout.write(self.style.SUCCESS(
                            f"Successfully reserved {best_building.name} for {user.username} at {s_hour}:00"
                        ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error for user {user.username}: {e}"))