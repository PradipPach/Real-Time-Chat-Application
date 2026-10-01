# 💬 Real-Time Chat Application

A simple app for creating an account and chatting with other users in real time.

## ✨ Features

- Sign up, log in, and edit your profile
- Find users and see who is online
- Chat live with typing and read status

## 🧰 Tech Stack

- **Frontend:** React and Vite
- **Backend:** Python and FastAPI
- **Database:** SQLite by default
- **Live chat:** WebSockets

## 🗂️ Project Structure

```text
backend/   FastAPI server and database
frontend/  React web app
docker-compose.yml  Docker services
```

## ⚙️ Backend Setup

In PowerShell, run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. The app uses SQLite by default.

## 🎨 Frontend Setup

In a second terminal, run:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. Start the backend first.

## 🔐 Authentication Flow

Sign up or log in. The server returns a secure token that the app uses to authorize API and chat connections.

## 💬 Real-Time Chat

Messages and typing status update live. Chat history is saved, and offline messages appear when the recipient returns.

## 🐳 Run with Docker Compose (Optional)

With Docker Desktop running, open a terminal in the project folder and run:

```powershell
docker compose up --build -d
```

Open `http://localhost:3000`. To stop the app:

```powershell
docker compose down
```

Use the backend and frontend setup above if you prefer running locally without Docker.

## 📝 Notes

- Create two accounts in separate browsers to test chatting.
- Keep secret keys private and change the development key before deployment.

## ✍️ Author Information

- **Author:** Pradip Pachapol
- **GitHub:** [@PradipPach](https://github.com/PradipPach)
