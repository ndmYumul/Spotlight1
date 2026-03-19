from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.http import Http404
import uuid
import traceback
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta, date
import datetime
from django.db.models import F

from .models import Building, UserProfile, Reservation, Schedule, Notification
from .serializers import (
    BuildingSerializer, 
    UserSerializer, 
    UserSerializerWithToken, 
    ReservationSerializer,
    ScheduleSerializer,
    NotificationSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Create your views here.
@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/buildings/',
        '/api/buildings/create/',
        '/api/buildings/upload/',
        '/api/buildings/<id>/reviews/',
        '/api/buildings/top/',
        '/api/buildings/<id>/',
        '/api/buildings/delete/<id>/',
        '/api/buildings/<update>/<id>/',
    ]
    return Response(routes)

@api_view(['GET'])
def getBuildings(request):
    buildings = Building.objects.all()
    serializer = BuildingSerializer(buildings, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getBuilding(request, pk):
    if pk == 'undefined' or not pk:
        return Response({'detail': 'A valid Building ID was not provided'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    try:
        building = Building.objects.get(_id=pk)
        serializer = BuildingSerializer(building, many=False)
        return Response(serializer.data)
    except (Building.DoesNotExist, ValueError):
        return Response({'detail': 'Building not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def createBuilding(request):
    try:
        building = Building.objects.create(
            user=request.user,
            name='New Building Name',
            description='Edit this description...',
            totalSlots=0 
        )
        serializer = BuildingSerializer(building, many=False)
        return Response(serializer.data)
    except Exception as e:
        return Response({'detail': f'Create Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateBuilding(request, pk):
    try:
        building = Building.objects.get(_id=pk)
        data = request.data
        
        building.name = data.get('name', building.name)
        building.description = data.get('description', building.description)
        
        if data.get('totalSlots') is not None:
            building.totalSlots = int(data.get('totalSlots'))

        building.save()
        serializer = BuildingSerializer(building, many=False)
        return Response(serializer.data)
    except Exception as e:
        return Response({'detail': str(e)}, status=400)
    
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteBuilding(request, pk):
    try:
        building = get_object_or_404(Building, _id=pk)
        building.delete()
        return Response('Building Deleted')
    except Exception as e:
        return Response({'detail': f'Delete Error: {str(e)}'}, status=500)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v

        return data
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def uploadImage(request):
    data = request.data
    building_id = data.get('building_id')
    user_id = data.get('user_id')
    image_file = request.FILES.get('image')

    if building_id:
        try:
            building = Building.objects.get(_id=building_id)
            building.image = request.FILES.get('image')
            building.save()
            return Response(building.image.url)
        except Building.DoesNotExist:
            return Response({'detail': 'Building not found'}, status=404)

    if user_id and image_file:
        try:
            user = User.objects.get(id=user_id)
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.image = request.FILES.get('image')
            profile.save()
            return Response(profile.image.url)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=404)

    return Response('No valid ID (building_id or user_id) provided', status=400)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    data = request.data

    user.first_name = data.get('name', user.first_name)
    
    new_email = data.get('email', user.email)
    user.email = new_email
    user.username = new_email 

    if 'isPro' in data:
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.is_pro = data['isPro']
        profile.save()

    password = data.get('password')
    if password and password != '':
        user.password = make_password(password)

    user.save()

    serializer = UserSerializerWithToken(user, many=False)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    try:
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAdminUser])
def createUser(request):
    try:
        temp_id = str(uuid.uuid4())[:8] 
        
        user = User.objects.create(
            first_name='New Student',
            username=f'newuser_{temp_id}',
            email=f'temp_{temp_id}@spotlight.com',
            password=make_password('password123')
        )
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)
    except Exception as e:
        message = {'detail': f'Error creating user: {str(e)}'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateUser(request, pk):
    try:
        user = User.objects.get(id=pk)
        data = request.data

        user.first_name = data.get('name', user.first_name)
        user.email = data.get('email', user.email)
        user.username = data.get('email', user.username) 
        user.is_staff = data.get('isAdmin', user.is_staff)

        if 'password' in data and data['password'] != '':
            user.password = make_password(data['password'])

        user.save()

        try:
            from .models import UserProfile
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            profile.is_pro = data.get('isPro', profile.is_pro)
            
            if 'arrival_hour' in data:
                profile.arrival_hour = data.get('arrival_hour')
            
            profile.save()
        except Exception as profile_error:
            print(f"Profile Update Error: {profile_error}")

        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)

    except Exception as e:
        print(f"ERROR: {e}") 
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    userForDeletion = User.objects.get(id=pk)
    userForDeletion.delete()
    return Response('User was deleted')

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUserById(request, pk):
    try:
        user = User.objects.get(id=pk)
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'detail': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def getReservations(request):
    try:
        reservations = Reservation.objects.all()
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyReservations(request):
    user = request.user
    reservations = user.reservation_set.all() 
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateReservation(request, pk):
    reservation = get_object_or_404(Reservation, _id=pk)
    data = request.data
    
    reservation.start_hour = data.get('start_hour', reservation.start_hour)
    reservation.end_hour = data.get('end_hour', reservation.end_hour)
    reservation.date = data.get('date', reservation.date)
    
    reservation.save() 

    serializer = ReservationSerializer(reservation, many=False)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getReservationById(request, pk):
    reservation = get_object_or_404(Reservation, _id=pk)
    serializer = ReservationSerializer(reservation, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def auth_user(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        user = User.objects.get(username=username)
        if user.check_password(password):
            serializer = UserSerializerWithToken(user).data
            return Response(serializer)
        else:
            return Response({'detail': 'Invalid credentials'}, status=401)
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=404)
    except Exception as e:
        traceback.print_exc()
        return Response({'detail': str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def registerUser(request):
    data = request.data
    try:
        user = User.objects.create(
            first_name=data['name'],
            username=data['email'], 
            email=data['email'],
            password=make_password(data['password'])
        )
        serializer = UserSerializerWithToken(user, many=False)
        return Response(serializer.data)
    except Exception as e:
        if User.objects.filter(email=data['email']).exists():
            return Response({'detail': 'User with this email already exists'}, status=400)
        return Response({'detail': str(e)}, status=400)
    
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteBuilding(request, pk):
    try:
        building = Building.objects.get(_id=pk)

        building.delete()
        return Response({'detail': 'Building was successfully deleted'}, status=status.HTTP_200_OK)

    except Building.DoesNotExist:
        return Response({'detail': 'Building not found'}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({'detail': f'Delete Error: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST']) 
@permission_classes([IsAuthenticated])
def update_user_schedule(request):
    try:
        user = request.user
        data = request.data 
        
        # This part looks for the existing schedule or creates a new one
        schedule, created = Schedule.objects.get_or_create(user=user)
        
        # Extract the list from the React request
        weekly_data = data.get('weekly_schedule')
        
        if weekly_data is None:
            return JsonResponse({'error': 'No schedule data provided'}, status=400)

        schedule.weekly_schedule = weekly_data
        schedule.save()

        return JsonResponse({
            'weekly_schedule': schedule.weekly_schedule,
            'updated_at': schedule.updated_at.isoformat()
        })
    except Exception as e:
        print(f"CRITICAL ERROR IN UPDATE_SCHEDULE: {e}") # This prints to your terminal
        return JsonResponse({'error': str(e)}, status=500)

# --- HELPER FUNCTIONS ---

def get_date_for_day(day_name):
    """Calculates the next calendar date for a given day string (e.g., 'Monday')"""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    try:
        target_day = days.index(day_name.capitalize())
    except (ValueError, AttributeError):
        return None
        
    today = timezone.now().date()
    current_day = today.weekday()
    
    days_ahead = target_day - current_day
    if days_ahead <= 0:
        days_ahead += 7
        
    return today + datetime.timedelta(days=days_ahead)

def create_user_notification(user, title, message, n_type='info'):
    """Utility to log system activity to the Notification table"""
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=n_type
    )

# --- INDIVIDUAL RESERVATION LOGIC ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createReservation(request):
    """Handles manual single reservation creation from the Building card"""
    try:
        user = request.user
        data = request.data
        
        building = Building.objects.get(_id=data.get('building_id'))
        
        # Check if slots are available
        if building.totalSlots <= 0:
            return JsonResponse({'error': 'This building is currently full.'}, status=400)
            
        # Create the reservation
        reservation = Reservation.objects.create(
            user=user,
            building=building,
            date=data.get('date'),
            start_hour=data.get('start_hour'),
            end_hour=data.get('end_hour')
        )
        
        # MANUALLY SUBTRACT SLOT
        building.totalSlots -= 1
        building.save()
        
        create_user_notification(
            user, 
            "Spot Secured", 
            f"You have successfully reserved a spot at {building.name}.", 
            "info"
        )
        
        return Response({'message': 'Reservation successful'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteReservation(request, pk):
    """Handles manual cancellation of a single spot"""
    try:
        user = request.user
        reservation = Reservation.objects.get(_id=pk, user=user)
        building = reservation.building
        
        # MANUALLY ADD SLOT BACK
        building.totalSlots += 1
        building.save()
        
        create_user_notification(
            user, 
            "Reservation Cancelled", 
            f"Your booking for {building.name} has been removed.", 
            "warning"
        )
        
        reservation.delete()
        return Response({'message': 'Reservation deleted and slot restored'})
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=404)

# --- BULK AI SYNC LOGIC ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reserve_weekly_schedule(request):
    """Handles the 'Reserve All' logic from the AI Schedule Screen"""
    try:
        user = request.user
        user_schedule = Schedule.objects.filter(user=user).first()

        if not user_schedule or not user_schedule.weekly_schedule:
            return JsonResponse({'error': 'No schedule found. Update AI Engine first.'}, status=400)

        created_count = 0
        skipped = 0

        for item in user_schedule.weekly_schedule:
            if not item.get('active') or not item.get('building'):
                continue

            building = Building.objects.filter(name__iexact=item.get('building')).first()
            
            if not building or building.totalSlots <= 0:
                skipped += 1
                continue

            target_date = get_date_for_day(item.get('day'))
            if not target_date: continue

            exists = Reservation.objects.filter(user=user, date=target_date).exists()

            if not exists:
                arrival_str = item.get('arrival', '08:00')
                departure_str = item.get('departure', '17:00')
                start_h = int(arrival_str.split(':')[0])
                end_h = int(departure_str.split(':')[0])

                Reservation.objects.create(
                    user=user, building=building, date=target_date,
                    start_hour=start_h, end_hour=end_h
                )
                
                building.totalSlots -= 1
                building.save()
                created_count += 1
            else:
                skipped += 1

        if created_count > 0:
            create_user_notification(
                user, "AI Sync Successful", 
                f"Automated engine secured {created_count} spots for the upcoming week.", "ai"
            )

        return JsonResponse({'message': f'Sync Complete! Created {created_count} spots.'})
    except Exception as e:
        return JsonResponse({'error': f'Backend Error: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_weekly_reservations(request):
    """Handles the 'Clear All' logic and restores building slots"""
    try:
        user = request.user
        today = timezone.now().date()
        upcoming = Reservation.objects.filter(user=user, date__gte=today)
        count = upcoming.count()

        for res in upcoming:
            building = res.building
            building.totalSlots += 1
            building.save()
            res.delete()
        
        if count > 0:
            create_user_notification(
                user, "Schedule Purged", 
                f"Successfully cleared {count} spots and updated campus availability.", "warning"
            )
        
        return JsonResponse({'message': f'Cleared {count} reservations.'})
    except Exception as e:
        return JsonResponse({'error': f'Clear failed: {str(e)}'}, status=500)

# --- NOTIFICATION & PROFILE LOGIC ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getNotifications(request):
    user = request.user
    notifications = Notification.objects.filter(user=user).order_by('-created_at')
    data = [{
        'id': n.id, 'title': n.title, 'message': n.message,
        'notification_type': n.notification_type, 'is_read': n.is_read,
        'created_at': n.created_at
    } for n in notifications]
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def markAsRead(request, pk):
    try:
        notification = Notification.objects.get(id=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)