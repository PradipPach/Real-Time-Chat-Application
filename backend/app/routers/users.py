"""List/search users, show online status, basic profile."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Message, User
from app.schemas import ProfileUpdateIn, message_to_dict, user_to_dict
from app.websocket_manager import manager

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("")
def list_users(search: str = "", db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    query = db.query(User).filter(User.id != me.id)
    if search.strip():
        like = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(like), User.email.ilike(like)))

    result = []
    for u in query.order_by(User.name).all():
        last = (
            db.query(Message)
            .filter(
                or_(
                    and_(Message.sender_id == me.id, Message.receiver_id == u.id),
                    and_(Message.sender_id == u.id, Message.receiver_id == me.id),
                )
            )
            .order_by(Message.id.desc())
            .first()
        )
        unread = (
            db.query(Message)
            .filter(Message.sender_id == u.id, Message.receiver_id == me.id, Message.is_seen == False)  # noqa: E712
            .count()
        )
        item = user_to_dict(u)
        item["is_online"] = manager.is_online(u.id)
        item["unread_count"] = unread
        item["last_message"] = message_to_dict(last) if last else None
        result.append(item)

    # people you chatted with recently come first
    result.sort(key=lambda x: x["last_message"]["timestamp"] if x["last_message"] else "", reverse=True)
    return result


@router.put("/me")
def update_profile(data: ProfileUpdateIn, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    me.name = data.name.strip()
    db.commit()
    db.refresh(me)
    return user_to_dict(me)


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    item = user_to_dict(user)
    item["is_online"] = manager.is_online(user.id)
    return item
