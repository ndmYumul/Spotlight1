from rest_framework import serializers
from .models import Building, UserProfile, Reservation, Schedule, Notification
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import datetime
class BuildingSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField(read_only=True)
    slots = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Building
        fields = ['_id', 'name', 'description', 'totalSlots', 'maxSlots', 'image', 'createdAt', 'slots']
    
    def get__id(self, obj):
        return obj._id
    
    def get_slots(self, obj):
        return obj.slots

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['weekly_schedule', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)
    image = serializers.SerializerMethodField(read_only=True) 
    arrival_hour = serializers.SerializerMethodField(read_only=True)
    isPro = serializers.BooleanField(source='userprofile.is_pro', read_only=True)
    schedule = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'image', 'arrival_hour', 'isPro', 'schedule']

    def get__id(self, obj):
        return obj.id

    def get_isAdmin(self, obj):
        return obj.is_staff

    def get_name(self, obj):
        name = obj.first_name
        if name == '':
            name = obj.email
        return name
    
    def get_image(self, obj):
        try:
            return obj.userprofile.image.url
        except:
            pass
            return None
        
    def get_arrival_hour(self, obj):
        try:
            return obj.userprofile.arrival_hour
        except:
            pass
            return 7

    def get_isPro(self, obj):
        try:
            return obj.is_staff or obj.userprofile.is_pro
        except:
            return obj.is_staff
        
    def get_schedule(self, obj):
        try:
            schedule = obj.schedule 
            return ScheduleSerializer(schedule, many=False).data
        except:
            return None


class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)
    isPro = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'image', 'token', 'arrival_hour', 'isPro', 'schedule']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)
    
    def get_isPro(self, obj):
        try:
            return obj.userprofile.is_pro
        except:
            return False
    
from rest_framework import serializers
from .models import Reservation
from django.utils import timezone

class ReservationSerializer(serializers.ModelSerializer):
    # We remove the 'source' argument to stop the Redundant error.
    # We use ReadOnlyField to ensure it is not required during POST requests.
    _id = serializers.ReadOnlyField()
    
    name = serializers.SerializerMethodField(read_only=True)
    buildingName = serializers.SerializerMethodField(read_only=True)
    is_completed = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            '_id', 
            'user', 
            'building', 
            'date', 
            'start_hour', 
            'end_hour', 
            'name', 
            'buildingName', 
            'is_completed'
        ]

    def get_name(self, obj):
        return obj.user.get_full_name() if obj.user.get_full_name() else obj.user.username

    def get_buildingName(self, obj):
        return obj.building.name if obj.building else "Campus Building"

    def get_is_completed(self, obj):
        now = timezone.now()
        # If the date is strictly in the past
        if obj.date < now.date():
            return True
        # If it is today but the end hour has passed
        if obj.date == now.date() and obj.end_hour <= now.hour:
            return True
        return False
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

def get_is_completed(self, obj):
    now = timezone.now()
    res_date = obj.date

    # If res_date is a string, convert it to a date object
    if isinstance(res_date, str):
        try:
            # Assumes format YYYY-MM-DD
            res_date = datetime.datetime.strptime(res_date, '%Y-%m-%d').date()
        except ValueError:
            # Handle cases where the string might have extra time data (ISO format)
            res_date = datetime.datetime.strptime(res_date.split('T')[0], '%Y-%m-%d').date()

    # Now the comparison is safe (Date vs Date)
    if res_date < now.date():
        return True
    
    # If it is today, check if the end hour has passed
    if res_date == now.date() and obj.end_hour <= now.hour:
        return True
        
    return False