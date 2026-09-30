# Real-Time Chat Application (React + FastAPI)

Register, log in, see who is online, and chat one-to-one in real time.

## What is inside

| Requirement | Where |
|---|---|
| Register / Login / JWT | `backend/app/routers/auth.py`, `security.py` |
| Protected APIs | `backend/app/deps.py` |
| View + search users, online status, profile | `backend/app/routers/users.py`, `frontend/src/pages/Profile.jsx` |
| Real-time chat (WebSocket), typing, timestamps, delivered/seen | `backend/app/routers/chat_ws.py`, `frontend/src/pages/Chat.jsx` |
| JWT check on socket | `chat_ws.py` (`?token=` is verified before accepting) |
| Private rooms | each message has `room_id = "<smallerId>_<biggerId>"` |
| Message + User tables | `backend/app/models.py` |
| Global exception handling | `backend/app/main.py` |
| Protected routing | `frontend/src/components/ProtectedRoute.jsx` |
| WhatsApp-like responsive UI, loaders, errors | `frontend/src/styles.css`, `components/` |

## Run the backend (Terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux
pip install -r requirements.txt
cp .env.example .env           # (Windows: copy .env.example .env)
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs

## Run the frontend (Terminal 2)

```bash
cd frontend
npm install
cp .env.example .env           # (Windows: copy .env.example .env)
npm run dev
```
Open http://localhost:5173

## How to test

1. Open the app in a normal window and register user A.
2. Open an **incognito window** and register user B.
3. Click each other's name and chat. Try typing (you will see "typing…"), and watch ✓ / ✓✓ / blue ✓✓.

## Use MySQL or PostgreSQL

Change `DATABASE_URL` in `backend/.env` (examples are inside `.env.example`), install the driver
(`pip install pymysql` or `pip install psycopg2-binary`), create an empty database, and restart. Tables are created automatically.

## WebSocket messages (quick reference)

Browser -> server: `message`, `typing`, `seen`
Server -> browser: `message`, `typing`, `seen`, `delivered`, `presence`, `error`
