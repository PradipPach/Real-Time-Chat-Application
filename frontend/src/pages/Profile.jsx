import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [message, setMessage] = useState({ text: "", error: false });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/users/me", { name });
      setUser(res.data);
      setMessage({ text: "Profile updated", error: false });
    } catch (err) {
      setMessage({ text: getErrorMessage(err), error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSave}>
        <div className="profile-top">
          <Avatar name={user.name} id={user.id} size={80} />
          <p className="profile-email">{user.email}</p>
        </div>
        {message.text && <div className={message.error ? "form-error" : "form-ok"}>{message.text}</div>}
        <label>Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </label>
        <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        <p className="auth-switch"><Link to="/">Back to chat</Link> · <a href="#logout" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a></p>
      </form>
    </div>
  );
}
