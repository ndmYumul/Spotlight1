from base.models import Building, ParkingAssignment
from django.utils import timezone

def automated_assignment_logic(user):
    """
    The 'Brain': Assigns a spot based on Priority and Availability.
    """
    # 1. Decision Rule: Find buildings with space, ordered by a 'priority' field
    # (Assuming you have a priority_level field, or just by most slots available)
    best_building = Building.objects.filter(totalSlots__gt=0).order_by('-totalSlots').first()

    if best_building:
        # 2. Automated Assignment: Create the record
        assignment = ParkingAssignment.objects.create(
            user=user,
            building=best_building,
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(hours=2) # Default 2hr block
        )
        
        # 3. Auto-Adjustment: Decrease the count in the Building database
        best_building.totalSlots -= 1
        best_building.save()
        
        return best_building.name
    return None