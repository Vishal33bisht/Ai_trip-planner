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
git clone https://github.com/Vishal33bisht/Ai_trip-planner.git
cd Ai_trip-planner

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

Create PostgreSQL database:
createdb tripcraft_db

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
Budget Allocation:

Food: 30%
Activities: 30%
Transport: 15%
Accommodation: 25%

The system ensures spending stays within ±10% of the target budget.

🔒 Security
✅ Implemented

Implemented
Password hashing with bcrypt

JWT authentication with secure tokens

ORM-based SQL protection (SQLAlchemy)

CORS properly configured

Secure password validation

⏳ Future Improvements
HTTP-only secure cookies

Rate limiting on endpoints

CSRF protection

API key rotation


📄 License
MIT License

⭐ Support
If you found this project useful, star the repository.
Happy Traveling ✈️🌍

---



## 🐳 DevOps & Deployment Architecture

### 1. Docker & Container Orchestration
The project is containerized using optimized, multi-stage Docker builds:
- **`backend/Dockerfile`**: Two-stage Python 3.12 slim build with dependency compilation, non-root user execution (`appuser`), and health checks (`GET /health`).
- **`front-end/Dockerfile`**: Two-stage build compiling Vite React SPA assets into a minimal `nginx:alpine` runner with custom caching and SPA routing.
- **`docker-compose.yml`**: Full-stack multi-container composition connecting PostgreSQL 16, FastAPI backend, and NGINX frontend with dependent health checks (`service_healthy`) and isolated bridge networking.

```bash
# Run full stack with Docker Compose
docker compose up --build

# Run database only for local dev
docker compose -f docker-compose.dev.yml up -d
```

### 2. CI/CD Automation (GitHub Actions)
- **CI Pipeline (`.github/workflows/ci.yml`)**: Automatically triggers on PRs and commits to `main`. Executes Python 3.12 syntax verification, PostgreSQL service container schema migrations/initialization, frontend ESLint and Vite build checks, and Docker Buildx build testing.
- **CD Pipeline (`.github/workflows/cd.yml`)**: Builds and pushes multi-platform images to GitHub Container Registry (GHCR) tagged with commit SHAs and semver tags, followed by vulnerability scanning via Aqua Security Trivy.

### 3. Kubernetes Deployment (`k8s/`)
Declarative Kubernetes infrastructure manifests:
- `postgres.yaml`: PersistentVolumeClaim (PVC) and PostgreSQL Deployment.
- `backend.yaml`: Scalable FastAPI Deployment with liveness/readiness probes, resource limits/requests, and ClusterIP Service.
- `frontend.yaml`: Scalable NGINX frontend Deployment with health probes.
- `ingress.yaml`: NGINX Ingress Controller routing traffic across frontend and API paths (`/`, `/api`, `/health`).
- `kustomization.yaml`: Kustomize configuration for environment overlays.
