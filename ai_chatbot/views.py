from django.shortcuts import render
import os
import json
import traceback
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google import genai
from google.genai import types
from google.genai import errors 
from dotenv import load_dotenv

# Import the new UserSchedule model along with your others
from base.models import Building, ChatMessage, Reservation, Schedule

# DRF IMPORTS
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.5-flash" 

SYSTEM_PROMPT = """
You are 'Spotlight AI', the University Parking Information Assistant. 
Your goal is to answer student questions based on the DATA provided below.

DATA SOURCES:
1. STATUS: Live availability of parking buildings.
2. YOUR_RESERVATIONS: Specific spots the user has already booked.
3. YOUR_WEEKLY_SCHEDULE: The user's planned routine from the Schedule Screen.

RULES:
- If a user asks to "book", "reserve", or "cancel", politely instruct them to use the 'Schedule' or 'Dashboard' tabs.
- Always check if a building is full in 'STATUS' before recommending it.
- Be concise, professional, and helpful.
"""

@csrf_exempt
@api_view(['POST']) 
@permission_classes([IsAuthenticated])
def chat(request):
    user = request.user
    user_message = ""
    user_name = user.first_name if user.first_name else user.username
    now = timezone.now()

    # 1. Fetch Schedule Context
    user_schedule = Schedule.objects.filter(user=user).first()
    schedule_context = "No weekly schedule set yet."
    if user_schedule and user_schedule.weekly_schedule:
        sched_items = []
        for item in user_schedule.weekly_schedule:
            if item.get('active'):
                # Added building name into the AI context
                building_name = item.get('building', 'Unspecified Building')
                sched_items.append(f"- {item['day']}: {building_name} ({item['arrival']}-{item['departure']})")
        if sched_items:
            schedule_context = "\n".join(sched_items)

    # 2. Fetch Building Status
    buildings = Building.objects.all()
    building_context = "\n".join([f"- {b.name}: {b.slots}/{b.maxSlots} available" for b in buildings])

    # 3. Fetch Active Reservations
    active_res = Reservation.objects.filter(user=user).order_by('-date')[:5]
    res_list = [f"- {r.building.name} on {r.date} at {r.start_hour}:00" for r in active_res]
    reservation_context = "\n".join(res_list) if res_list else "No active reservations."

    # 4. Construct Instruction
    full_instruction = (
        f"{SYSTEM_PROMPT}\n"
        f"USER: {user_name}\n"
        f"CURRENT_TIME: {now.strftime('%Y-%m-%d %H:%M')}\n\n"
        f"STATUS (Live Buildings):\n{building_context}\n\n"
        f"YOUR_RESERVATIONS (Existing):\n{reservation_context}\n\n"
        f"YOUR_WEEKLY_SCHEDULE (Planned):\n{schedule_context}"
    )

    # 5. AI Interaction
    try:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=full_instruction, 
                    temperature=0.3
                ),
            )
            ai_reply = response.text
        except errors.ClientError as e:
            # Check for the 429 Rate Limit
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print("DEBUG: Gemini Rate Limit (429) Hit")
                return JsonResponse({"reply": "I'm thinking a bit too hard! 🧠 Please wait a moment and try again. ⏳"}, status=200)
            raise e 

        # 6. Log the chat history
        ChatMessage.objects.create(user=user, user_text=user_message, ai_response=ai_reply)

        return JsonResponse({"reply": ai_reply})

    except Exception as e:
        # Full traceback in terminal for 500 errors
        print("\n" + "="*60)
        print(f"🔴 CHATBOT ERROR: {str(e)}")
        traceback.print_exc()
        print("="*60 + "\n")
        return JsonResponse({"reply": "I hit a small snag! Check the backend terminal. 🚧"}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_chat(request):
    ChatMessage.objects.filter(user=request.user).delete()
    return JsonResponse({"reply": "History cleared!"})