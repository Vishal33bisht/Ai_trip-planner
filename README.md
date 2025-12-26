TripCraft AI - AI-Powered Travel Itinerary Planner
TripCraft AI is a full-stack web application that generates personalized, budget-aware travel itineraries for Indian cities using AI (Google Gemini). Users can specify their budget, travel style, interests, and preferences to receive detailed day-by-day plans with real places, costs, and activities.

🚀 Features

AI-Powered Itineraries: Uses Google Gemini AI to generate realistic, detailed travel plans
Budget-Aware Planning: Stays within ±10% of your specified budget
40+ Indian Cities: Pre-seeded database of major Indian cities
Personalized Experiences: Customize based on travel style, pace, accommodation, and interests
Real Places & Costs: Includes actual restaurants, attractions, and estimated costs
User Authentication: JWT-based secure login and signup
Responsive Design: Modern UI built with React and Tailwind CSS
Fallback System: Smart fallback with city-specific data when AI quota is exhausted


🛠️ Tech Stack
Backend

FastAPI - Modern Python web framework
SQLAlchemy - ORM for database management
PostgreSQL - Primary database
JWT - Token-based authentication
Google Gemini AI - AI itinerary generation
Python-Jose - JWT encoding/decoding
Passlib - Password hashing

Frontend

React 19 - UI library
Vite - Build tool and dev server
React Router - Client-side routing
Axios - HTTP client
Tailwind CSS 4 - Utility-first CSS framework


📋 Prerequisites

Python 3.8+
Node.js 20+ and npm
PostgreSQL (local or cloud instance)
Google Gemini API Key (from Google AI Studio)


⚙️ Installation & Setup
1. Clone the Repository
bashgit clone <your-repo-url>
cd tripcraft-ai
2. Backend Setup
Create Virtual Environment
bashcd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install Dependencies
bashpip install -r requirements.txt
Configure Environment Variables
Create a .env file in the backend directory:
envDATABASE_URL=postgresql://username:password@localhost:5432/tripcraft_db
SECRET_KEY=your-secret-jwt-key-change-in-production
GEMINI_API_KEY=your-google-gemini-api-key
Initialize Database
bash# Run FastAPI server (creates tables automatically)
uvicorn app.main:app --reload

# Seed cities (in a separate terminal)
python seed_cities.py
3. Frontend Setup
bashcd front-end
npm install
npm run dev
The frontend will run on http://localhost:5173

🚦 Running the Application
Start Backend
bashcd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
Start Frontend
bashcd front-end
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📂 Project Structure
```
tripcraft-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # Database configuration
│   │   ├── auth.py              # JWT authentication
│   │   ├── crud.py              # Database operations & AI logic
│   │   └── routers/
│   │       ├── cities.py        # City endpoints
│   │       ├── users.py         # Auth endpoints
│   │       └── itineraries.py   # Itinerary endpoints
│   ├── seed_cities.py           # City seeding script
│   ├── requirements.txt
│   └── .env
│
├── front-end/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md

🔑 API Endpoints
Authentication

POST /api/auth/signup - Register new user
POST /api/auth/login - Login and get JWT token

Cities

GET /api/cities - Get all cities

Itineraries

POST /api/itineraries - Create new itinerary
GET /api/itineraries/{id} - Get itinerary details
GET /api/itineraries - List all itineraries


🎨 Key Features Explained
AI Itinerary Generation
The system uses Google Gemini AI with a sophisticated prompt that:

Allocates budget across accommodation, food, activities, and transport
Suggests real places based on the city
Adjusts recommendations based on budget tier (budget/mid-range/luxury)
Provides detailed hour-by-hour breakdowns

Fallback System
When AI quota is exhausted, the system uses a curated database of:

Real attractions with entry fees
Popular restaurants with average costs
Budget-appropriate recommendations
City-specific points of interest

Budget Calculation
pythondaily_budget = total_budget / days
allocations = {
    "food": 30%,
    "activities": 30%,
    "transport": 15%,
    "accommodation": 25%
}
