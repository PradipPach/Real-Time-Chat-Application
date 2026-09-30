import { formatTime } from "../utils";

export default function MessageBubble({ message, mine }) {
  // ✓ sent, ✓✓ delivered, blue ✓✓ seen
  const ticks = message.is_seen || message.is_delivered ? "✓✓" : "✓";
  return (
    <div className={`bubble-row ${mine ? "mine" : "theirs"}`}>
      <div className="bubble">
        <span className="bubble-text">{message.message}</span>
        <span className="bubble-meta">
          {formatTime(message.timestamp)}
          {mine && <span className={`ticks ${message.is_seen ? "seen" : ""}`}>{ticks}</span>}
        </span>
      </div>
    </div>
  );
}
