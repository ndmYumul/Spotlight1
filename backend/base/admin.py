from django.contrib import admin
from .models import Building
from .models import UserProfile

# Register your models here.
admin.site.register(Building)
admin.site.register(UserProfile)