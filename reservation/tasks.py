from celery import shared_task
from django.utils import timezone
from django.contrib.auth.models import User
from base.models import Building, Schedule, Reservation

@shared_task
def run_auto_reserve_pro():
    today_name = timezone.now().strftime('%A')
    pro_users = User.objects.filter(userprofile__is_pro=True, schedule__isnull=False)

    for user in pro_users:
        try:
            weekly_data = user.schedule.weekly_schedule
            today_tasks = [item for item in weekly_data if item.get('day', '').lower() == today_name.lower()]

            for task in today_tasks:
                best_building = Building.objects.filter(totalSlots__gt=0).order_by('-totalSlots').first()
                if best_building:
                    s_hour = int(task.get('start_time', '09:00').split(':')[0])
                    e_hour = int(task.get('end_time', '10:00').split(':')[0])

                    Reservation.objects.create(
                        user=user,
                        building=best_building,
                        start_hour=s_hour,
                        end_hour=e_hour,
                        date=timezone.now().date()
                    )
                    best_building.totalSlots -= 1
                    best_building.save()
        except Exception as e:
            print(f"Error auto-reserving for {user.username}: {e}")