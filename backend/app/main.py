"""App entry point. Run:  uvicorn app.main:app --reload"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import CORS_ORIGINS
from app.database import Base, engine
from app.routers import auth, chat_ws, messages, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat")

Base.metadata.create_all(bind=engine)  # creates tables on first run

app = FastAPI(title="Real-Time Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(messages.router)
app.include_router(chat_ws.router)


# ---------- Global exception handling: every error returns {"detail": "..."} ----------
@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    first = exc.errors()[0]
    field = str(first["loc"][-1])
    return JSONResponse(status_code=422, content={"detail": f"{field}: {first['msg']}"})


@app.exception_handler(Exception)
async def unexpected_error(request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Something went wrong on the server"})


@app.get("/")
def health():
    return {"status": "ok"}
