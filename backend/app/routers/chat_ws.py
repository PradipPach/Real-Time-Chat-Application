"""
WebSocket endpoint:  ws://localhost:8000/ws?token=<JWT>

Messages the browser can send:
  {"type": "message", "to": 2, "message": "hi"}
  {"type": "typing",  "to": 2, "is_typing": true}
  {"type": "seen",    "from": 2}

Messages the server sends back:
  message, typing, seen, delivered, presence, error
"""
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.database import SessionLocal
from app.models import Message, User
from app.schemas import message_to_dict
from app.security import decode_token
from app.websocket_manager import manager

router = APIRouter()


async def handle_message(db, me_id: int, data: dict):
    receiver_id = data.get("to")
    text = (data.get("message") or "").strip()
    if not text:
        raise ValueError("Message cannot be empty")
    if len(text) > 2000:
        raise ValueError("Message is too long (max 2000 characters)")
    if not isinstance(receiver_id, int) or receiver_id == me_id or not db.get(User, receiver_id):
        raise ValueError("Receiver not found")

    msg = Message(
        sender_id=me_id,
        receiver_id=receiver_id,
        message=text,
        is_delivered=manager.is_online(receiver_id),  # delivered if receiver is connected
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    payload = {"type": "message", "message": message_to_dict(msg)}
    await manager.send_to_user(receiver_id, payload)
    await manager.send_to_user(me_id, payload)  # echo to sender (all tabs)


async def handle_seen(db, me_id: int, data: dict):
    other_id = data.get("from")
    updated = (
        db.query(Message)
        .filter(Message.sender_id == other_id, Message.receiver_id == me_id, Message.is_seen == False)  # noqa: E712
        .update({"is_seen": True, "is_delivered": True})
    )
    db.commit()
    if updated:
        await manager.send_to_user(other_id, {"type": "seen", "by": me_id})


async def mark_delivered_on_connect(db, me_id: int):
    """Messages sent while I was offline are now 'delivered'."""
    pending = db.query(Message).filter(Message.receiver_id == me_id, Message.is_delivered == False)  # noqa: E712
    sender_ids = {m.sender_id for m in pending.all()}
    if sender_ids:
        pending.update({"is_delivered": True})
        db.commit()
        for sid in sender_ids:
            await manager.send_to_user(sid, {"type": "delivered", "to": me_id})


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = ""):
    db = SessionLocal()
    try:
        # 1) JWT check before we accept the connection
        user_id = decode_token(token)
        user = db.get(User, user_id) if user_id else None
        if not user:
            await websocket.close(code=1008)  # policy violation
            return

        # 2) connect + tell everyone I'm online
        came_online = await manager.connect(user_id, websocket)
        if came_online:
            await manager.broadcast({"type": "presence", "user_id": user_id, "online": True})
        await mark_delivered_on_connect(db, user_id)

        # 3) listen for events
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                event = data.get("type")
                if event == "message":
                    await handle_message(db, user_id, data)
                elif event == "typing":
                    await manager.send_to_user(
                        data.get("to"),
                        {"type": "typing", "from": user_id, "is_typing": bool(data.get("is_typing"))},
                    )
                elif event == "seen":
                    await handle_seen(db, user_id, data)
            except WebSocketDisconnect:
                raise
            except Exception as e:  # bad JSON, validation errors, etc.
                await websocket.send_json({"type": "error", "detail": str(e)})
    except WebSocketDisconnect:
        pass
    finally:
        if "user_id" in locals() and user_id:
            if manager.disconnect(user_id, websocket):
                await manager.broadcast({"type": "presence", "user_id": user_id, "online": False})
        db.close()
