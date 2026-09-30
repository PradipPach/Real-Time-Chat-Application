import { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const timer = useRef(null);
  const isTyping = useRef(false);

  const stopTyping = () => {
    clearTimeout(timer.current);
    if (isTyping.current) {
      isTyping.current = false;
      onTyping(false);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (!isTyping.current) {
      isTyping.current = true;
      onTyping(true);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(stopTyping, 1500); // stop "typing…" after 1.5s of silence
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onSend(clean);
    setText("");
    stopTyping();
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input type="text" placeholder="Type a message" value={text} onChange={handleChange} maxLength={2000} autoFocus />
      <button type="submit" className="btn-send" disabled={!text.trim()}>Send</button>
    </form>
  );
}
