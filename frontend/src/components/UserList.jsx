import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import Loader from "./Loader";
import { formatTime } from "../utils";

export default function UserList({ me, users, loading, search, onSearch, activeId, onSelect, onLogout, connected }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/profile" className="me" title="My profile">
          <Avatar name={me.name} id={me.id} size={40} />
          <span className="me-name">{me.name}</span>
        </Link>
        <button className="btn-ghost" onClick={onLogout}>Logout</button>
      </div>

      {!connected && <div className="banner">Connecting… messages will work once connected</div>}

      <div className="search-box">
        <input
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="user-list">
        {loading && <Loader small />}
        {!loading && users.length === 0 && (
          <p className="empty-text">{search ? "No users match your search." : "No other users yet. Ask a friend to register."}</p>
        )}
        {users.map((u) => (
          <button key={u.id} className={`user-item ${u.id === activeId ? "active" : ""}`} onClick={() => onSelect(u)}>
            <Avatar name={u.name} id={u.id} online={u.is_online} />
            <div className="user-info">
              <div className="user-row">
                <span className="user-name">{u.name}</span>
                {u.last_message && <span className="user-time">{formatTime(u.last_message.timestamp)}</span>}
              </div>
              <div className="user-row">
                <span className="user-last">
                  {u.last_message
                    ? (u.last_message.sender_id === me.id ? "You: " : "") + u.last_message.message
                    : u.is_online ? "Online" : "Offline"}
                </span>
                {u.unread_count > 0 && <span className="badge">{u.unread_count}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
