# Spotlight: Smart Campus Reservation System

Spotlight is a full-stack web application designed to manage and automate building reservations at Holy Angel University. It helps students secure study or activity spots through a manual booking interface or an automated weekly scheduler. The system includes real-time slot tracking, automated notifications, and an administrative dashboard for campus management.

## Key Features
* **Smart Scheduling:** Automated weekly booking based on student schedules.
* **Live Slot Tracking:** Real-time updates of available building capacity.
* **Admin Dashboard:** Full CRUD operations for buildings and user reservations.
* **Responsive UI:** Built with React and Bootstrap for a seamless mobile and desktop experience.
* **Secure Authentication:** Token-based security using Django REST Framework and JWT.

---

## Technical Stack

**Backend:** Django, Django REST Framework, PostgreSQL  
**Frontend:** React.js, Redux (State Management), Axios, React-Bootstrap  
**Storage:** Cloudinary (Image hosting for campus buildings)

---

## Installation and Setup

### 1. Clone the Repository
Open your terminal and run the following commands to get a local copy of the project:

```bash
git clone [https://github.com/ndmYumul/Spotlight1.git](https://github.com/ndmYumul/Spotlight1.git)
cd Spotlight1

 2. Backend Initialization (Django)
It is recommended to use a virtual environment to keep your dependencies organized.

# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# Activate the environment
# On Windows: 
venv\Scripts\activate
# On Mac/Linux: 
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create an admin account to access the dashboard
python manage.py createsuperuser

# Start the Django server
python manage.py runserver

The backend will now be running at http://127.0.0.1:8000/.
3. Frontend Initialization (React)
Open a second terminal window or tab to run the frontend concurrently.

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start

The frontend will launch automatically in your browser at http://localhost:3000/.
Environment Variables
To enable image uploads and cloud database features, create a .env file in the backend folder with the following keys:

SECRET_KEY=your_django_secret_key
DEBUG=True
CLOUDINARY_URL=your_cloudinary_link

And a .env file in the frontend folder:

REACT_APP_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

Project Structure
/backend: Contains the Django project, API views, and PostgreSQL models for Buildings and Reservations.
/frontend: Contains the React source code, Redux store, and UI components.
/constants: Redux action types for keeping the state predictable.
License
Distributed under the MIT License. See LICENSE for more information.

---

### Final Deployment Checklist
Before you push this to GitHub for your Render and Vercel deployment:

1.  **Check `.gitignore`:** Ensure your `venv/`, `.env` files, and `__pycache__` are ignored so you don't leak your Cloudinary keys or secret keys.
2.  **Verify the URL:** In your `README.md`, I used your specific GitHub link (`ndmYumul/Spotlight1.git`) so anyone who clones it gets your latest code.
