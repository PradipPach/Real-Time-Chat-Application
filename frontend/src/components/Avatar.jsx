const COLORS = ["#128c7e", "#5b6abf", "#c2185b", "#e67e22", "#00897b", "#8e44ad", "#2e86c1"];

export default function Avatar({ name = "?", id = 0, online = false, size = 44 }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, background: COLORS[id % COLORS.length] }}>
      {initials}
      {online && <span className="online-dot" />}
    </div>
  );
}
