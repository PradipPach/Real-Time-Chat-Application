"""Database tables: User and Message."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text

from app.database import Base


def utc_now():
    # stored as naive UTC so it behaves the same on SQLite / MySQL / PostgreSQL
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # stored as a bcrypt hash
    created_at = Column(DateTime, default=utc_now)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    is_delivered = Column(Boolean, default=False)
    is_seen = Column(Boolean, default=False)
