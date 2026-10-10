import { useState } from "react";
import { Icon, Logo, Avatar } from "./ui.jsx";
import { useStore, participantsOf } from "../lib/store.jsx";
import { navigate } from "../lib/router.js";

export const NAV = [
  { key: "", label: "Home", icon: "home" },
  { key: "discover", label: "Discover", icon: "search" },
  { key: "matches", label: "Smart Matches", icon: "sparkle" },
  { key: "profile", label: "My Profile", icon: "user" },
  { key: "messages", label: "Messages", icon: "message" },
  { key: "sessions", label: "Sessions", icon: "calendar" },
  { key: "leaderboard", label: "Leaderboard", icon: "trophy" },
  { key: "about", label: "How it works", icon: "info" },
];

function activeKey(parts) {
  const k = parts[0] || "";
  if (k === "group") return "matches";
  if (k === "feedback") return "sessions";
  return k;
}

function Sidebar({ parts }) {
  const active = activeKey(parts);
  return (
    <aside className="sidebar">
      <a href="#/" className="logo-link" aria-label="SkillSwap home"><Logo /></a>
      <nav aria-label="Main">
        {NAV.map((n) => (
          <a key={n.key} href={`#/${n.key}`} className={`nav-item ${active === n.key ? "active" : ""}`} aria-current={active === n.key ? "page" : undefined}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </a>
        ))}
      </nav>
      <div className="side-foot">
        <Icon name="cap" size={20} />
        <span>A stronger campus through shared skills</span>
      </div>
    </aside>
  );
}

function Topbar() {
  const { state, dispatch, me, byId, notify } = useStore();
  const [open, setOpen] = useState(false);

  const mine = state.sessions.filter((s) => participantsOf(s).includes(me.id));
  const needsReply = mine.filter((s) => s.status === "pending" && !s.accepted.includes(me.id));
  const upcoming = mine.filter((s) => s.status === "confirmed");
  const count = needsReply.length;

  return (
    <header className="topbar">
      <label className="viewas">
        <span>Demo: viewing as</span>
        <select
          value={me.id}
          onChange={(e) => { dispatch({ type: "switchUser", id: e.target.value }); notify(`Now viewing as ${byId[e.target.value].name}`); }}
        >
          {state.students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <div className="bell-wrap">
        <button className="icon-btn bell" onClick={() => setOpen(!open)} aria-label={`Notifications, ${count} need your reply`} aria-expanded={open}>
          <Icon name="bell" size={20} />
          {count > 0 && <span className="dot">{count}</span>}
        </button>
        {open && (
          <div className="popover" role="menu">
            <h4>Notifications</h4>
            {needsReply.length === 0 && upcoming.length === 0 && <p className="muted small">You're all caught up.</p>}
            {needsReply.map((s) => (
              <button key={s.id} className="pop-item" onClick={() => { setOpen(false); navigate("/sessions?tab=pending"); }}>
                <strong>{byId[s.requestedBy]?.name.split(" ")[0] || "Someone"}</strong> asked for a {s.skill} session. Reply needed.
              </button>
            ))}
            {upcoming.slice(0, 3).map((s) => (
              <button key={s.id} className="pop-item" onClick={() => { setOpen(false); navigate("/sessions"); }}>
                Confirmed: {s.skill} session coming up.
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="avatar-btn" onClick={() => navigate("/profile")} aria-label="My profile"><Avatar person={me} size={36} /></button>
    </header>
  );
}

export default function Layout({ parts, children }) {
  const { toast } = useStore();
  return (
    <div className="shell">
      <Sidebar parts={parts} />
      <div className="main">
        <Topbar />
        <main className="content" id="main">{children}</main>
      </div>
      <nav className="tabbar" aria-label="Mobile">
        {NAV.slice(0, 6).map((n) => (
          <a key={n.key} href={`#/${n.key}`} className={activeKey(parts) === n.key ? "active" : ""}>
            <Icon name={n.icon} size={20} /><span>{n.label.replace("Smart ", "").replace("My ", "")}</span>
          </a>
        ))}
      </nav>
      {toast && <div className="toast" role="status" key={toast.id}><Icon name="check" size={16} />{toast.message}</div>}
    </div>
  );
}
