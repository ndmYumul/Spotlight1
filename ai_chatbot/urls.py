from django.urls import path
from . import views

urlpatterns = [
    path('clear/', views.clear_chat, name='clear_chat'),
    path('chat/', views.chat, name='ai-chat'),
]