import { useEffect } from "react";
import { LEVEL_RANK } from "../lib/matching.js";

/* ---------- icons (24px stroke icons, drawn inline so there is no icon dependency) ---------- */
const P = {
  home: "M3 11.5 12 4l9 7.5M5 10v10h14V10",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.2A6.5 6.5 0 0 1 21.5 20",
  message: "M4 5h16v11H9l-5 4z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  trophy: "M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 20h8",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 21h4",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  plus: "M12 5v14M5 12h14",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01",
  check: "M5 12.5l4.5 4.5L19 7.5",
  star: "M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.5 6.6 20.4l1-6.1L3.2 10l6.1-.9z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M15 5l-7 7 7 7",
  video: "M3 7h12v10H3zM15 11l6-3v8l-6-3",
  pin: "M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  graph: "M6 6m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M18 8m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M12 19m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M8 7l8 1M17 10l-4 7M10 17.5L7 8.5",
  x: "M6 6l12 12M18 6L6 18",
  send: "M4 12l16-8-6 16-3-7z",
  cap: "M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5",
  leaf: "M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c2-5 5-8 9-10",
  refresh: "M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5",
};

export function Icon({ name, size = 18, className = "", strokeWidth = 1.8 }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={P[name] || P.info} />
    </svg>
  );
}

export function Logo({ small }) {
  return (
    <div className="logo">
      <svg width={small ? 30 : 36} height={small ? 24 : 28} viewBox="0 0 40 30" aria-hidden="true">
        <path d="M2 9c5-8 14-8 20-2l-4 1 9 4 1-9-3 2C16-1 5-1 -1 8z" fill="#6c4de6" />
        <path d="M38 21c-5 8-14 8-20 2l4-1-9-4-1 9 3-2c8 8 19 8 25-1z" fill="#16a085" />
      </svg>
      <div>
        <div className="logo-name">SkillSwap</div>
        <div className="logo-tag">Teach • Learn • Grow</div>
      </div>
    </div>
  );
}

/* ---------- avatars: initials on a stable gradient (no photos of real people) ---------- */
const GRADS = [
  ["#6c4de6", "#9b8cf5"], ["#0ea5a4", "#5eead4"], ["#2563eb", "#60a5fa"], ["#d97706", "#fbbf24"],
  ["#db2777", "#f9a8d4"], ["#16a34a", "#86efac"], ["#7c3aed", "#c4b5fd"], ["#0891b2", "#67e8f9"],
];
export function Avatar({ person, size = 40 }) {
  const name = person?.name || "?";
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [a, b] = GRADS[hash % GRADS.length];
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <span
      className="avatar" role="img" aria-label={name}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ people, max = 3, size = 26 }) {
  const shown = people.slice(0, max);
  return (
    <span className="avatar-stack">
      {shown.map((p) => (
        <span key={p.id} className="stack-item"><Avatar person={p} size={size} /></span>
      ))}
      {people.length > max && <span className="stack-more">+{people.length - max} more</span>}
    </span>
  );
}

export const levelClass = (level) => `lvl lvl-${(level || "").toLowerCase()}`;
export const SkillTag = ({ skill, level }) => (
  <span className="skilltag">{skill}{level ? <em> ({level})</em> : null}</span>
);

export function Stars({ value, onChange, size = 18 }) {
  return (
    <span className="stars" role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Icon name="star" size={size} className={n <= value ? "star on" : "star"} />;
        return onChange ? (
          <button type="button" key={n} className="star-btn" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </span>
  );
}

export function ScoreRing({ helped, asked, progress, size = 112, caption }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 110 110" width={size} height={size} aria-hidden="true">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#d6efe1" strokeWidth="9" />
        <circle
          cx="55" cy="55" r={r} fill="none" stroke="#16a34a" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${c * progress} ${c}`} transform="rotate(-90 55 55)"
        />
      </svg>
      <div className="ring-text">
        <strong>{helped}</strong><span> / {asked}</span>
        {caption && <small>{caption}</small>}
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon = "sparkle", title, children, action }) {
  return (
    <div className="empty">
      <Icon name={icon} size={28} />
      <h4>{title}</h4>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export const pct = (n) => `${Math.round(n * 100)}%`;
export const rankLevel = (l) => LEVEL_RANK[l] || 0;
