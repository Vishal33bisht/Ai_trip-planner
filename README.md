# ✈️ TripCraft AI  
### AI-Powered Travel Itinerary Planner for Indian Cities

TripCraft AI is a full-stack web application that generates **personalized, budget-aware travel itineraries** using **Google Gemini AI**.  
It provides **day-by-day travel plans** with real places, realistic costs, and activities tailored to user preferences.

---

## ✨ Features

- 🤖 **AI-Powered Itineraries** – Google Gemini AI for realistic travel plans  
- 💰 **Budget-Aware Planning** – Stays within ±10% of user budget  
- 🏙️ **40+ Indian Cities** – Pre-seeded tourist destinations  
- 🎯 **Personalized Experiences** – Based on pace, style & interests  
- 📍 **Real Places & Costs** – Actual attractions and restaurants  
- 🔐 **JWT Authentication** – Secure login & signup  
- 📱 **Responsive UI** – React + Tailwind CSS  
- 🔄 **Fallback System** – City-specific data when AI quota ends  

---

## 🛠️ Tech Stack

### Backend
- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL**
- **Google Gemini AI**
- **JWT Authentication**
- **Passlib (bcrypt)**

### Frontend
- **React 19**
- **Vite 7**
- **React Router**
- **Axios**
- **Tailwind CSS 4**

---

## 📋 Prerequisites

- Python **3.8+**
- Node.js **20+**
- PostgreSQL
- Google Gemini API Key

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/tripcraft-ai.git
cd tripcraft-ai
2️⃣ Backend Setup
cd backend
python -m venv venv

Activate virtual environment:
# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

Install dependencies:
pip install -r requirements.txt

Create .env file inside backend/:
DATABASE_URL=postgresql://username:password@localhost:5432/tripcraft_db
SECRET_KEY=your-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key

Run backend:
uvicorn app.main:app --reload

Seed city data:
python seed_cities.py


3️⃣ Frontend Setup
cd front-end
npm install
npm run dev

Frontend runs at:
👉 http://localhost:5173

🚦 Running the Application
ServiceURLFrontendhttp://localhost:5173Backend APIhttp://localhost:8000API Docshttp://localhost:8000/docs

📂 Project Structure
tripcraft-ai/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── auth.py
│   │   ├── crud.py
│   │   └── routers/
│   │       ├── cities.py
│   │       ├── users.py
│   │       └── itineraries.py
│   ├── seed_cities.py
│   ├── requirements.txt
│   └── .env
│
├── front-end/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md


🔑 API Endpoints
🔐 Authentication
MethodEndpointDescriptionPOST/api/auth/signupRegister userPOST/api/auth/loginLogin & get JWT
🏙️ Cities
MethodEndpointDescriptionGET/api/citiesGet all cities
🗺️ Itineraries
MethodEndpointDescriptionPOST/api/itinerariesCreate itineraryGET/api/itineraries/{id}Get itineraryGET/api/itinerariesList itineraries

💰 Budget Logic
daily_budget = total_budget / days

allocations = {
    "food": 0.30,
    "activities": 0.30,
    "transport": 0.15,
    "accommodation": 0.25
}


🔒 Security
✅ Implemented


Password hashing (bcrypt)


JWT authentication


ORM-based SQL protection


CORS enabled


❌ To Improve


HTTP-only cookies


Rate limiting


CSRF protection



📄 License
MIT License

⭐ Support
If you found this project useful, star the repository.
Happy Traveling ✈️🌍

---

## ✅ Final Result

- Project structure will **no longer appear as a paragraph**
- Tables will render properly
- Code blocks will display correctly
- GitHub will show clean formatting

If you want, I can:
- Optimize this README for **recruiters**
- Add **badges (stars, license, tech stack)**
- Convert it into a **professional open-source README**

Just tell me.
