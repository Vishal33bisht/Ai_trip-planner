TripCraft AI ✈️

AI-Powered Travel Itinerary Planner for Indian Cities

Show Image
Show Image
Show Image
Show Image
TripCraft AI is a full-stack web application that generates personalized, budget-aware travel itineraries using Google Gemini AI. Get detailed day-by-day plans with real places, costs, and activities tailored to your preferences.
Show Image

✨ Features

🤖 AI-Powered Itineraries - Uses Google Gemini AI for realistic, detailed travel plans
💰 Budget-Aware Planning - Stays within ±10% of your specified budget
🏙️ 40+ Indian Cities - Pre-seeded database of major tourist destinations
🎯 Personalized Experiences - Customize based on travel style, pace, and interests
📍 Real Places & Costs - Includes actual restaurants, attractions, and prices
🔐 User Authentication - Secure JWT-based login and signup
📱 Responsive Design - Modern UI with React and Tailwind CSS
🔄 Smart Fallback System - City-specific data when AI quota is exhausted


🛠️ Tech Stack
Backend
Show Image
Show Image
Show Image

FastAPI - Modern Python web framework
SQLAlchemy - ORM for database management
PostgreSQL - Primary database
Google Gemini AI - AI itinerary generation
JWT - Token-based authentication
Passlib - Password hashing

Frontend
Show Image
Show Image
Show Image

React 19 - UI library
Vite 7 - Build tool and dev server
React Router - Client-side routing
Axios - HTTP client
Tailwind CSS 4 - Utility-first CSS


📋 Prerequisites
Before you begin, ensure you have the following installed:

Python 3.8+
Node.js 20+ and npm
PostgreSQL (local or cloud instance)
Google Gemini API Key - Get it from Google AI Studio


⚙️ Installation & Setup
1️⃣ Clone the Repository
bashgit clone https://github.com/yourusername/tripcraft-ai.git
cd tripcraft-ai
2️⃣ Backend Setup
Create Virtual Environment
bashcd backend
python -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
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

# In a separate terminal, seed cities
python seed_cities.py
3️⃣ Frontend Setup
bashcd front-end
npm install
npm run dev
The frontend will run on http://localhost:5173

🚦 Running the Application
Start Backend Server
bashcd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
Start Frontend Server
bashcd front-end
npm run dev
```

Frontend App: **http://localhost:5173**

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
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── CTA.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── PlanTrip.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── TripDetails.jsx
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md

🔑 API Endpoints
🔐 Authentication
MethodEndpointDescriptionPOST/api/auth/signupRegister new userPOST/api/auth/loginLogin and get JWT token
🏙️ Cities
MethodEndpointDescriptionGET/api/citiesGet all cities
🗺️ Itineraries
MethodEndpointDescriptionPOST/api/itinerariesCreate new itineraryGET/api/itineraries/{id}Get itinerary detailsGET/api/itinerariesList all itineraries

🎨 Key Features Explained
🤖 AI Itinerary Generation
The system uses Google Gemini AI with a sophisticated prompt that:

Allocates budget across accommodation, food, activities, and transport
Suggests real places based on the selected city
Adjusts recommendations based on budget tier (budget/mid-range/luxury)
Provides detailed hour-by-hour breakdowns

🔄 Fallback System
When AI quota is exhausted, the system uses a curated database of:

Real attractions with entry fees
Popular restaurants with average costs
Budget-appropriate recommendations
City-specific points of interest

Cities with enhanced fallback data:

Delhi
Mumbai
Jaipur
Bangalore
Goa

💰 Budget Calculation
pythondaily_budget = total_budget / days

allocations = {
    "food": 30%,
    "activities": 30%,
    "transport": 15%,
    "accommodation": 25%
}

📸 Screenshots
Home Page
Show Image
Trip Planning
Show Image
Generated Itinerary
Show Image

🔧 Recommended Improvements
🔥 High Priority

 Authentication Enhancement

Password strength validation
Password reset via email
OAuth integration (Google/Facebook)
HTTP-only cookies for JWT storage


 User Experience

Loading animations during AI generation
Real-time progress indicators
Itinerary editing capabilities
PDF/print export functionality
Share itineraries via unique links


 AI Optimization

Caching for popular city/duration combinations
User feedback loop for improvements
Multi-model support (GPT-4, Claude as fallbacks)



⚡ Medium Priority

 Feature Additions

Collaborative trip planning with friends
Budget tracking during trips
Weather forecast integration
Hotel/activity booking integration
User dashboard for saved itineraries
Pre-made itinerary templates


 Data Expansion

International cities beyond India
Seasonal recommendations
Local tips and safety information


 Performance

Server-side caching (Redis)
Database indexing optimization
Image lazy loading
API response time improvements



📊 Low Priority

 Analytics & Monitoring

Google Analytics integration
Error tracking (Sentry)
Track popular destinations


 Mobile App

React Native mobile application
Offline mode for saved itineraries


 Testing

Unit tests (pytest, Jest)
Integration tests
CI/CD pipeline




🐛 Known Issues

AI Quota Limitations - Free tier Gemini API has usage limits; fallback system handles this
City Search - No fuzzy matching yet (exact substring required)
localStorage Security - JWT stored in localStorage (should use HTTP-only cookies)
No Rate Limiting - API endpoints not rate-limited yet
Mobile Optimization - Works on mobile but could be better optimized


🔒 Security Considerations
✅ Current Implementation

Password hashing with bcrypt
JWT authentication
CORS configuration
SQL injection protection (SQLAlchemy ORM)

❌ Needs Improvement

Use HTTP-only cookies for JWT storage
Add CSRF protection
Implement rate limiting
Add comprehensive input validation
Enhanced API request logging


📊 Database Schema
sqlUsers
├── id (PK)
├── name
├── email (Unique)
└── password (Hashed)

Cities
├── id (PK)
├── name (Unique)
└── country

Itineraries
├── id (PK)
├── user_id (FK → Users)
├── city
├── days
├── budget
├── travel_style
├── accommodation
├── pace
├── transport_mode
├── interests (JSON)
└── plan (JSON)

ItineraryDays
├── id (PK)
├── itinerary_id (FK → Itineraries)
├── day_number
├── morning
├── afternoon
└── evening

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request


📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments

Google Gemini AI for itinerary generation
geonamescache for Indian city data
FastAPI for the excellent Python framework
Tailwind CSS for beautiful UI components


📧 Contact
Your Name - @yourtwitter - your.email@example.com
Project Link: https://github.com/yourusername/tripcraft-ai

<div align="center">
⭐ Star this repo if you found it helpful!
Happy Traveling! ✈️🌍
Made with ❤️ by Your Name
</div>
