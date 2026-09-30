"""Chat history between me and another user."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Message, User
from app.schemas import message_to_dict

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.get("/{user_id}")
def chat_history(user_id: int, limit: int = 200, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    if not db.get(User, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    rows = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == me.id, Message.receiver_id == user_id),
                and_(Message.sender_id == user_id, Message.receiver_id == me.id),
            )
        )
        .order_by(Message.id.desc())
        .limit(min(limit, 500))
        .all()
    )
    return [message_to_dict(m) for m in reversed(rows)]  # oldest first
