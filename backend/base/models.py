from django.db import models
from django.contrib.auth.models import User
import os
import random
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from cloudinary_storage.storage import MediaCloudinaryStorage

# Create your models here.
def get_filename_ext(filepath):
    base_name = os.path.basename(filepath)
    name, ext = os.path.splitext(base_name)
    return name, ext

def upload_image_path(instance, filename):
    new_filename = random.randint(1, 2541781232)
    name, ext = get_filename_ext(filename)
    final_filename = '{new_filename}{ext}'.format(new_filename=new_filename, ext=ext)
    return "img/{new_filename}/{final_filename}".format(new_filename=new_filename, final_filename=final_filename)

class Building(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    _id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    image = models.ImageField(
        upload_to='buildings/', 
        storage=MediaCloudinaryStorage(),
        null=True, 
        blank=True
    )
    description = models.TextField(null=True, blank=True)
    totalSlots = models.IntegerField(null=True, blank=True, default=0, validators=[MinValueValidator(0)])
    maxSlots = models.IntegerField(null=True, blank=True, default=0, validators=[MinValueValidator(0)])
    createdAt = models.DateTimeField(auto_now_add=True)

    @property
    def slots(self):
        today = timezone.now().date()
        active_reservations = self.reservation_set.filter(date=today).count() 
        capacity = self.totalSlots if self.totalSlots > 0 else self.maxSlots
        return max(0, capacity - active_reservations)
    
    def save(self, *args, **kwargs):
        if self._state.adding and (self.totalSlots == 0 or self.totalSlots is None):
            self.totalSlots = self.maxSlots
        super(Building, self).save(*args, **kwargs)

    @property
    def slots(self):
        today = timezone.now().date()
        active_reservations = Reservation.objects.filter(building=self, date=today).count()
        return self.totalSlots - active_reservations

    def __str__(self):
        return self.name if self.name else "Unnamed Building"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    image = models.ImageField(
        null=True, 
        blank=True, 
        upload_to='profile_pics/', 
        storage=MediaCloudinaryStorage() 
    )
    arrival_hour = models.IntegerField(default=7, null=True, blank=True)
    is_pro = models.BooleanField(default=False) 
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return str(self.user.username) if self.user else "No User"
    
class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True)
    start_hour = models.IntegerField(default=7) 
    end_hour = models.IntegerField(default=8)
    date = models.DateField()
    createdAt = models.DateTimeField(auto_now_add=True)
    _id = models.AutoField(primary_key=True, editable=False)
    # is_completed = models.BooleanField(default=False)

    @property
    def is_completed(self):
        now = timezone.now()
        reservation_date = self.date
        
        if reservation_date < now.date():
            return True
        
        if reservation_date == now.date() and self.end_hour < now.hour:
            return True
            
        return False

    def __str__(self):
        return f"{self.user.username} | {self.start_hour}:00 - {self.end_hour}:00"
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'userprofile'):
        instance.userprofile.save()

class Plan(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    description = models.TextField()
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True) # For Stripe integration
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return self.name

class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=False)
    expire_date = models.DateTimeField(null=True, blank=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return f"{self.user.username}'s Subscription"

class Schedule(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='schedule')
    weekly_schedule = models.JSONField(default=list) 
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Schedule for {self.user.username}"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Pro Alert'),
        ('danger', 'Urgent'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=200, null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    user_text = models.TextField()
    ai_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Chat with {self.user.username} at {self.timestamp}"
    
class ParkingAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    building = models.ForeignKey('Building', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.building.name}"