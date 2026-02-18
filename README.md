# SpecSmith AI Control

A full-stack project with React frontend (Firebase + OpenAI) and FastAPI backend (MongoDB).

## Quick Start

### Frontend (main app)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Environment Variables

**Frontend** (`frontend/.env`):
- `VITE_OPENAI_API_KEY` - OpenAI API key for Agent Workbench
- `VITE_FIREBASE_*` - Firebase config (optional; `firebase.ts` has fallbacks)

**Backend** (`backend/.env`):
- `MONGO_URL` - MongoDB connection string (e.g. `mongodb://localhost:27017` or MongoDB Atlas URL)
- `DB_NAME` - Database name (default: `specsmith`)
- `CORS_ORIGINS` - Allowed origins (default: `http://localhost:3000`)

### Backend (optional)

The frontend works standalone. The backend is a separate API (status checks) that requires MongoDB:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### Firebase Service Account

The Firebase Admin SDK service account (`backend/my-new-compass-firebase-adminsdk-*.json`) is used for server-side Firebase operations. Keep it secure and add to `.gitignore` if committing.
