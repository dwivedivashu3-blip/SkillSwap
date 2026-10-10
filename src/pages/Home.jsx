import { useMemo } from "react";
import { Icon, ScoreRing } from "../components/ui.jsx";
import { useStore, participantsOf } from "../lib/store.jsx";
import { navigate } from "../lib/router.js";
import { giveAskPoints, badgeFor, fmtDate, fmtRange } from "../lib/matching.js";

export function weeklyDelta(sessions, userId) {
  const cutoff = Date.now() - 7 * 86400000;
  let helped = 0, asked = 0;
  for (const s of sessions) {
    if (s.status !== "completed" || !s.completedAt || new Date(s.completedAt).getTime() < cutoff) continue;
    if (s.teacherId === userId) helped += s.learnerIds.length;
    if (s.learnerIds.includes(userId)) asked += 1;
  }
  return { helped, asked };
}

const ACTIONS = [
  { icon: "search", title: "Find a skill to learn", text: "Search by skill or person", to: "/discover" },
  { icon: "plus", title: "Add your skills", text: "Update what you can teach and want to learn", to: "/profile" },
  { icon: "sparkle", title: "View smart matches", text: "Let us find the best matches for you", to: "/matches" },
  { icon: "users", title: "Join a group session", text: "Learn with others", to: "/matches?tab=group" },
];

export default function Home() {
  const { state, me, byId } = useStore();
  const week = useMemo(() => weeklyDelta(state.sessions, me.id), [state.sessions, me.id]);
  const pts = giveAskPoints(me);
  const badge = badgeFor(pts);

  const popular = useMemo(() => {
    const counts = {};
    state.students.forEach((s) => [...s.teach, ...s.learn].forEach((x) => (counts[x.skill] = (counts[x.skill] || 0) + 1)));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [state.students]);

  const upcoming = state.sessions
    .filter((s) => participantsOf(s).includes(me.id) && (s.status === "confirmed" || s.status === "pending"))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="page">
      <h1 className="hello">Welcome back, {me.name.split(" ")[0]}!</h1>
      <p className="muted">You can teach. You can learn. You can make a difference.</p>

      <div className="stat-grid">
        <div className="stat green">
          <span className="stat-ico"><Icon name="users" /></span>
          <div className="stat-num">{me.helped}</div>
          <div className="stat-label">People helped</div>
          <div className="stat-delta up">↑ +{week.helped} this week</div>
        </div>
        <div className="stat lav">
          <span className="stat-ico"><Icon name="help" /></span>
          <div className="stat-num">{me.asked}</div>
          <div className="stat-label">Times asked for help</div>
          <div className="stat-delta up">↑ +{week.asked} this week</div>
        </div>
        <div className="stat score">
          <div className="stat-label strong">Your Give &amp; Ask Score</div>
          <ScoreRing helped={me.helped} asked={me.asked} progress={badge.progress} />
          <div className="stat-foot">
            <b>{pts} pts · {badge.name}</b>
            <span>{badge.next ? `${badge.toNext} pts to ${badge.next}. Asking counts too!` : "Top level reached!"}</span>
          </div>
        </div>
      </div>

      <h2 className="section">Quick Actions</h2>
      <div className="action-grid">
        {ACTIONS.map((a) => (
          <button key={a.title} className="action" onClick={() => navigate(a.to)}>
            <span className="action-ico"><Icon name={a.icon} /></span>
            <strong>{a.title}</strong>
            <span className="muted small">{a.text}</span>
          </button>
        ))}
      </div>

      {upcoming.length > 0 && (
        <>
          <h2 className="section">Coming up</h2>
          <div className="card list-card">
            {upcoming.map((s) => (
              <button key={s.id} className="row-link" onClick={() => navigate("/sessions")}>
                <Icon name="calendar" />
                <span><b>{s.skill}</b> with {byId[s.teacherId === me.id ? s.learnerIds[0] : s.teacherId]?.name}</span>
                <span className="muted small">{fmtDate(s.date)}, {fmtRange(s.slot)}</span>
                <span className={`pill ${s.status}`}>{s.status === "confirmed" ? "Confirmed" : "Pending"}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <h2 className="section">Popular Skills on Campus</h2>
      <div className="chips">
        {popular.map(([skill, n]) => (
          <button key={skill} className="chip" onClick={() => navigate(`/discover?q=${encodeURIComponent(skill)}`)} title={`${n} people teach or want this`}>
            {skill}
          </button>
        ))}
      </div>

      <p className="inspire">
        Inspired by workplace cultures that ask <i>“Did you ask for help? How many people have you helped?”</i> This is
        inspiration for the project, not an officially verified rule of any company.
      </p>
    </div>
  );
}
