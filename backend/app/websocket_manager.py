"""Keeps track of who is connected right now (online users)."""
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # one user can have many tabs open -> list of sockets per user
        self.active: dict[int, list[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket) -> bool:
        """Accept the socket. Returns True if the user just came online."""
        await ws.accept()
        first_connection = user_id not in self.active
        self.active.setdefault(user_id, []).append(ws)
        return first_connection

    def disconnect(self, user_id: int, ws: WebSocket) -> bool:
        """Remove the socket. Returns True if the user is now fully offline."""
        sockets = self.active.get(user_id, [])
        if ws in sockets:
            sockets.remove(ws)
        if not sockets:
            self.active.pop(user_id, None)
            return True
        return False

    def is_online(self, user_id: int) -> bool:
        return user_id in self.active

    async def send_to_user(self, user_id: int, data: dict):
        for ws in list(self.active.get(user_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                pass  # socket already closed, ignore

    async def broadcast(self, data: dict):
        for user_id in list(self.active.keys()):
            await self.send_to_user(user_id, data)


manager = ConnectionManager()
