"""Request/response shapes (validation)."""
from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdateIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)


def user_to_dict(user):
    return {"id": user.id, "name": user.name, "email": user.email}


def message_to_dict(m):
    a, b = sorted([m.sender_id, m.receiver_id])
    return {
        "id": m.id,
        "room_id": f"{a}_{b}",  # private room = the two user ids
        "sender_id": m.sender_id,
        "receiver_id": m.receiver_id,
        "message": m.message,
        "timestamp": m.timestamp.isoformat() + "Z",
        "is_delivered": bool(m.is_delivered),
        "is_seen": bool(m.is_seen),
    }
