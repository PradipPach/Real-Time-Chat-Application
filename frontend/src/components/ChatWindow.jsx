import { useEffect, useRef } from "react";
import Avatar from "./Avatar";
import Loader from "./Loader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({ me, user, messages, loading, isTyping, onSend, onTyping, onBack }) {
  const bottomRef = useRef(null);

  // Auto scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!user) {
    return (
      <section className="chat-window empty-chat">
        <h2>Real-Time Chat</h2>
        <p>Pick a person from the list to start chatting.</p>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button className="btn-back" onClick={onBack} aria-label="Back to users">←</button>
        <Avatar name={user.name} id={user.id} online={user.is_online} size={40} />
        <div>
          <div className="chat-title">{user.name}</div>
          <div className="chat-status">{isTyping ? "typing…" : user.is_online ? "online" : "offline"}</div>
        </div>
      </header>

      <div className="messages">
        {loading && <Loader small />}
        {!loading && messages.length === 0 && <p className="empty-text">No messages yet. Say hello!</p>}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.sender_id === me.id} />
        ))}
        {isTyping && <div className="typing-bubble"><span /><span /><span /></div>}
        <div ref={bottomRef} />
      </div>

      <MessageInput key={user.id} onSend={onSend} onTyping={onTyping} />
    </section>
  );
}
