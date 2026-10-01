# 💬 Real-Time Chat Application

A one-to-one messaging application built with React and FastAPI. Users can create an account, sign in, find other users, and exchange messages in real time. The backend stores users and messages in a database and uses JWTs to protect API and WebSocket connections.

## ✨ Features

- User registration and login
- JWT-based authentication and protected pages/API routes
- Searchable user list and online presence
- One-to-one real-time messaging
- Typing indicators, delivery status, and read receipts
- Message history and profile editing
- Responsive chat interface

## 🧰 Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios
- **Backend:** Python, FastAPI, Uvicorn, SQLAlchemy
- **Authentication:** JWT and bcrypt password hashing
- **Database:** SQLite by default; PostgreSQL or MySQL can be configured
- **Real-time communication:** WebSockets
- **Optional containers:** Docker Compose and PostgreSQL

## 🗂️ Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── routers/       # Authentication, users, messages, WebSocket
│   │   ├── config.py      # Environment-based configuration
│   │   ├── database.py    # SQLAlchemy database setup
│   │   ├── models.py      # User and message models
│   │   ├── schemas.py     # Request/response serialization
│   │   └── main.py        # FastAPI application entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # HTTP API client
│   │   ├── components/    # Reusable chat and UI components
│   │   ├── context/       # Authentication state
│   │   ├── hooks/         # WebSocket hook
│   │   └── pages/         # Login, registration, chat, profile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## ⚙️ Backend Setup

Prerequisites: Python 3.10 or newer and `pip`.

Open a terminal in the project directory, then run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

If PowerShell blocks virtual-environment activation, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once, then activate again. Alternatively, skip activation and run `.venv\Scripts\python -m pip install -r requirements.txt` and `.venv\Scripts\python -m uvicorn app.main:app --reload`.

The API is available at `http://localhost:8000`; interactive API documentation is at `http://localhost:8000/docs`. By default, the backend uses SQLite and creates the database tables automatically on startup.

To use PostgreSQL or MySQL instead, edit `DATABASE_URL` in `backend/.env` and install the matching driver. Example values are provided in `backend/.env.example`.

## 🎨 Frontend Setup

Prerequisites: Node.js (including npm).

Open a second terminal in the project directory and run:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. The default `VITE_API_URL` in `frontend/.env.example` points to the local backend at `http://localhost:8000`. Start the backend before using the app.

## 🔐 Authentication Flow

1. A user registers or logs in through the frontend.
2. The backend validates credentials and returns a signed JWT.
3. The frontend stores the token in browser local storage and attaches it as a Bearer token to API requests.
4. Protected backend routes validate the token and identify the current user.
5. The WebSocket connection sends the token as a query parameter; the backend validates it before accepting the connection. Invalid or expired tokens are rejected.

## 💬 Real-Time Chat

1. After signing in, the client opens an authenticated WebSocket connection to the backend.
2. The backend tracks connected users and broadcasts online/offline presence.
3. Messages, typing indicators, and read events are sent as WebSocket events. Messages are stored in the database and delivered to the recipient when connected.
4. If a recipient is offline, the message remains in history and is marked delivered when they reconnect. Opening a conversation marks messages as seen.
5. The frontend can also load previous messages through the messages API.

## 🐳 Run with Docker Compose (Optional)

Prerequisites: Docker Desktop installed and running. Since the app needs a database, backend, and frontend, start the services together with Docker Compose.

1. Open a terminal in the project root (the folder containing `docker-compose.yml`).
2. Build the images and start all services:

```powershell
docker compose up --build -d
```

3. Check that the containers are running:

```powershell
docker compose ps
```

4. Open the app at `http://localhost:3000`. The backend API docs are at `http://localhost:8000/docs`.

To follow service logs:

```powershell
docker compose logs -f
```

To stop and remove the containers and network:

```powershell
docker compose down
```

PostgreSQL data is kept in the `pgdata` Docker volume when you stop the services. To also delete that database data, run `docker compose down -v`.

For a clean local development setup with SQLite, use the separate backend and frontend steps above instead.

## 📝 Notes

- For local development, start the backend first and keep it running while using the frontend.
- The default local database is SQLite; no separate database server is needed.
- To test one-to-one chat, create two accounts in separate browsers or in a regular and an incognito window.
- Keep `.env` files and production secrets private. Change the development `SECRET_KEY` before deploying.
- Docker Compose uses PostgreSQL and serves the frontend at `http://localhost:3000`; the local Vite setup uses `http://localhost:5173`.

## ✍️ Author Information

- **Author:** Pradip Pachapol
- **GitHub:** [@PradipPach](https://github.com/PradipPach)
