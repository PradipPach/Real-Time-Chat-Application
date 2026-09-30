import { useCallback, useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import useChatSocket from "../hooks/useChatSocket";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const { user: me, token, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typing, setTyping] = useState({}); // { userId: true/false }
  const [error, setError] = useState("");

  // refs so the socket handler always sees the latest values
  const activeRef = useRef(null);
  const usersRef = useRef([]);
  const typingTimers = useRef({});
  useEffect(() => { activeRef.current = activeUser; }, [activeUser]);
  useEffect(() => { usersRef.current = users; }, [users]);

  // ---------- Load users (with search) ----------
  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/users", { params: { search } });
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUsersLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300); // wait 300ms after typing in search
    return () => clearTimeout(t);
  }, [loadUsers]);

  // ---------- Real-time events from the server ----------
  function handleEvent(ev) {
    const active = activeRef.current;

    if (ev.type === "presence") {
      if (ev.user_id !== me.id && !usersRef.current.some((u) => u.id === ev.user_id)) {
        loadUsers(); // a brand new user appeared
        return;
      }
      setUsers((list) => list.map((u) => (u.id === ev.user_id ? { ...u, is_online: ev.online } : u)));
      setActiveUser((a) => (a && a.id === ev.user_id ? { ...a, is_online: ev.online } : a));
    }

    if (ev.type === "message") {
      const m = ev.message;
      const incoming = m.sender_id !== me.id;
      const otherId = incoming ? m.sender_id : m.receiver_id;
      const isOpen = active && active.id === otherId;

      if (!usersRef.current.some((u) => u.id === otherId)) loadUsers();

      // update sidebar: last message, unread badge, move person to top
      setUsers((list) => {
        const target = list.find((u) => u.id === otherId);
        if (!target) return list;
        const updated = {
          ...target,
          last_message: m,
          unread_count: incoming && !isOpen ? target.unread_count + 1 : target.unread_count,
        };
        return [updated, ...list.filter((u) => u.id !== otherId)];
      });

      if (isOpen) {
        setMessages((msgs) => (msgs.some((x) => x.id === m.id) ? msgs : [...msgs, m]));
        if (incoming) send({ type: "seen", from: otherId });
      }
      if (incoming) setTyping((t) => ({ ...t, [otherId]: false }));
    }

    if (ev.type === "typing") {
      setTyping((t) => ({ ...t, [ev.from]: ev.is_typing }));
      clearTimeout(typingTimers.current[ev.from]);
      if (ev.is_typing) {
        // safety: hide "typing…" after 4s even if the stop event is lost
        typingTimers.current[ev.from] = setTimeout(() => setTyping((t) => ({ ...t, [ev.from]: false })), 4000);
      }
    }

    if (ev.type === "seen") {
      setMessages((msgs) =>
        msgs.map((m) => (m.sender_id === me.id && m.receiver_id === ev.by ? { ...m, is_seen: true, is_delivered: true } : m))
      );
    }

    if (ev.type === "delivered") {
      setMessages((msgs) =>
        msgs.map((m) => (m.sender_id === me.id && m.receiver_id === ev.to ? { ...m, is_delivered: true } : m))
      );
    }

    if (ev.type === "error") setError(ev.detail);
  }

  const { send, connected } = useChatSocket(token, handleEvent);

  // ---------- User actions ----------
  const openChat = async (u) => {
    setActiveUser(u);
    setMessages([]);
    setMessagesLoading(true);
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, unread_count: 0 } : x)));
    try {
      const { data } = await api.get(`/messages/${u.id}`);
      setMessages(data);
      send({ type: "seen", from: u.id });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSend = (text) => {
    if (!send({ type: "message", to: activeUser.id, message: text })) {
      setError("Not connected yet. Reconnecting…");
    }
  };

  const handleTyping = (isTyping) => {
    send({ type: "typing", to: activeUser.id, is_typing: isTyping });
  };

  return (
    <div className={`app-shell ${activeUser ? "chat-open" : ""}`}>
      {error && (
        <div className="toast-error" onClick={() => setError("")}>
          {error} <span>(tap to close)</span>
        </div>
      )}
      <UserList
        me={me}
        users={users}
        loading={usersLoading}
        search={search}
        onSearch={setSearch}
        activeId={activeUser?.id}
        onSelect={openChat}
        onLogout={logout}
        connected={connected}
      />
      <ChatWindow
        me={me}
        user={activeUser}
        messages={messages}
        loading={messagesLoading}
        isTyping={activeUser ? !!typing[activeUser.id] : false}
        onSend={handleSend}
        onTyping={handleTyping}
        onBack={() => setActiveUser(null)}
      />
    </div>
  );
}
