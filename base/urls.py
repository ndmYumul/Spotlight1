from django.urls import path
from . import views

urlpatterns = [
    path('', views.getRoutes, name="routes"),

    # --- USER & AUTH ROUTES ---
    # Public
    path('users/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/register/', views.registerUser, name='register'), # Consistently use users/ prefix
    
    # Private (Profile)
    path('users/profile/', views.getUserProfile, name="user-profile"),
    path('users/profile/update/', views.updateUserProfile, name="user-profile-update"),
    path('users/schedule/update/', views.update_user_schedule, name="user-schedule-update"),
    path('users/schedule/weekly-sync/', views.reserve_weekly_schedule, name='weekly-sync'),
    path('users/schedule/clear-weekly/', views.clear_weekly_reservations, name='clear-weekly'),
    path('users/notifications/', views.getNotifications, name="notifications"),
    path('users/notifications/<str:pk>/read/', views.markAsRead, name="notification-read"),
    
    # Admin Only
    path('users/', views.getUsers, name="users"),
    path('users/create/', views.createUser, name='user-create'),
    path('users/upload/', views.uploadImage, name='user-upload'),
    path('users/update/<str:pk>/', views.updateUser, name='user-update'),
    path('users/delete/<str:pk>/', views.deleteUser, name='user-delete'),
    path('users/<str:pk>/', views.getUserById, name='user-by-id'),

    # --- BUILDING ROUTES ---
    path('buildings/', views.getBuildings, name="buildings"),
    path('buildings/create/', views.createBuilding, name="building-create"),
    path('buildings/upload/', views.uploadImage, name="building-upload"),
    path('buildings/update/<str:pk>/', views.updateBuilding, name="building-update"),
    path('buildings/delete/<str:pk>/', views.deleteBuilding, name="building-delete"),
    path('buildings/<str:pk>/', views.getBuilding, name="building"),

    # --- RESERVATION ROUTES ---
    path('reservations/', views.getReservations, name='reservations'),
    path('reservations/create/', views.createReservation, name='reservation-create'),
    path('reservations/myreservations/', views.getMyReservations, name='my-reservations'),
    path('reservations/update/<str:pk>/', views.updateReservation, name='reservation-update'),
    path('reservations/delete/<str:pk>/', views.deleteReservation, name='reservation-delete'),
    path('reservations/<str:pk>/', views.getReservationById, name='reservation-by-id'),
]