import { useState } from "react";
import { Avatar, Icon, Empty, Modal, Stars } from "../components/ui.jsx";
import { useStore, participantsOf } from "../lib/store.jsx";
import { useRoute, navigate } from "../lib/router.js";
import { fmtDate, fmtRange } from "../lib/matching.js";

const TABS = [["confirmed", "Upcoming"], ["pending", "Pending"], ["completed", "Completed"], ["cancelled", "Cancelled"]];

function FeedbackModal({ session, onClose }) {
  const { me, byId, dispatch } = useStore();
  const targets = participantsOf(session).filter((p) => p !== me.id);
  const [ratings, setRatings] = useState(Object.fromEntries(targets.map((t) => [t, 5])));
  const [comments, setComments] = useState({});

  const submit = () => {
    const feedback = targets.map((t) => ({ fromId: me.id, toId: t, rating: ratings[t], comment: (comments[t] || "").trim() }));
    dispatch({ type: "completeSession", id: session.id, feedback });
    onClose();
    navigate(`/feedback/${session.id}`);
  };

  return (
    <Modal title="Session feedback" onClose={onClose}>
      <p className="muted">How did the {session.skill} session go? Your feedback helps everyone. Marking it complete updates the Give &amp; Ask score for all participants.</p>
      {targets.map((t) => (
        <div key={t} className="fb-row">
          <div className="fb-who"><Avatar person={byId[t]} size={34} /><b>{byId[t].name}</b><small className="muted">{t === session.teacherId ? "Teacher" : "Learner"}</small></div>
          <Stars value={ratings[t]} onChange={(v) => setRatings({ ...ratings, [t]: v })} size={22} />
          <textarea rows={2} placeholder="Say something helpful (optional)" value={comments[t] || ""} onChange={(e) => setComments({ ...comments, [t]: e.target.value })} aria-label={`Comment for ${byId[t].name}`} />
        </div>
      ))}
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={submit}>Complete session</button>
      </div>
    </Modal>
  );
}

function SessionCard({ s, onComplete }) {
  const { me, byId, dispatch, notify } = useStore();
  const people = participantsOf(s);
  const iAmIn = people.includes(me.id);
  const iAccepted = s.accepted.includes(me.id);
  const waiting = people.filter((p) => !s.accepted.includes(p));
  const role = s.teacherId === me.id ? "You teach" : "You learn";
  return (
    <article className="card session">
      <div className="s-top">
        <div>
          <h3>{s.skill} <span className="muted small">({s.level})</span></h3>
          <div className="small muted">
            {s.kind === "chain" ? `Chain swap · step ${s.step} of ${s.steps}` : s.kind === "group" ? "Group session" : "One-to-one"}
            {iAmIn ? ` · ${role}` : ""}
          </div>
        </div>
        <span className={`pill ${s.status}`}>{{ confirmed: "Confirmed", pending: "Pending", completed: "Completed", cancelled: "Cancelled" }[s.status]}</span>
      </div>
      <div className="s-people">
        <span className="who"><Avatar person={byId[s.teacherId]} size={30} /> <b>{byId[s.teacherId].name.split(" ")[0]}</b> <small className="muted">teaches</small></span>
        <Icon name="arrow" size={16} />
        <span className="who">{s.learnerIds.map((l) => <span key={l} className="who"><Avatar person={byId[l]} size={30} /> <b>{l === me.id ? "You" : byId[l].name.split(" ")[0]}</b></span>)}</span>
      </div>
      <div className="s-meta">
        <span><Icon name="calendar" size={15} /> {fmtDate(s.date)}, {fmtRange(s.slot)}</span>
        <span><Icon name="pin" size={15} /> {s.location}</span>
      </div>
      {s.status === "pending" && (
        <p className="small muted">Waiting for: {waiting.map((w) => (w === me.id ? "you" : byId[w].name.split(" ")[0])).join(", ")}. A suggestion only becomes a session once everyone accepts.</p>
      )}
      <div className="s-actions">
        {s.status === "pending" && iAmIn && !iAccepted && <button className="btn primary sm" onClick={() => { dispatch({ type: "acceptSession", id: s.id }); notify("Accepted."); }}>Accept</button>}
        {s.status === "pending" && (
          <button className="btn ghost sm" onClick={() => { dispatch({ type: "demoAcceptAll", id: s.id }); notify("Demo: everyone accepted. Session confirmed."); }}>Demo: simulate others accepting</button>
        )}
        {s.status === "confirmed" && iAmIn && <button className="btn good sm" onClick={() => onComplete(s)}>Mark as completed</button>}
        {(s.status === "pending" || s.status === "confirmed") && iAmIn && (
          <button className="btn ghost sm" onClick={() => { dispatch({ type: "cancelSession", id: s.id }); notify("Session cancelled."); }}>Cancel</button>
        )}
        {s.status === "completed" && <button className="btn outline sm" onClick={() => navigate(`/feedback/${s.id}`)}>View feedback</button>}
        {s.groupId && s.status !== "completed" && s.status !== "cancelled" && <button className="btn ghost sm" onClick={() => navigate(`/group/${s.groupId}`)}>Open proposal</button>}
      </div>
    </article>
  );
}

export default function Sessions() {
  const { query } = useRoute();
  const { state, me } = useStore();
  const tab = TABS.some(([k]) => k === query.get("tab")) ? query.get("tab") : "confirmed";
  const [completing, setCompleting] = useState(null);
  const mine = state.sessions.filter((s) => participantsOf(s).includes(me.id));
  const list = mine.filter((s) => s.status === tab).sort((a, b) => (tab === "completed" ? new Date(b.completedAt) - new Date(a.completedAt) : new Date(a.date) - new Date(b.date)));
  const count = (k) => mine.filter((s) => s.status === k).length;

  return (
    <div className="page">
      <h1>Sessions</h1>
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => navigate(`/sessions?tab=${k}`)}>
            {label} <span className="count">{count(k)}</span>
          </button>
        ))}
      </div>
      <p className="muted small explain">Suggested matches are not sessions. Request → <b>Pending</b> → everyone accepts → <b>Confirmed</b> → feedback → <b>Completed</b>.</p>
      {list.length === 0 && (
        <Empty icon="calendar" title={tab === "confirmed" ? "No upcoming sessions" : `Nothing in ${TABS.find(([k]) => k === tab)[1].toLowerCase()}`}
          action={<button className="btn primary" onClick={() => navigate("/matches")}>Find a match</button>}>
          Ask someone for help or accept a group session to get started.
        </Empty>
      )}
      <div className="stack">{list.map((s) => <SessionCard key={s.id} s={s} onComplete={setCompleting} />)}</div>
      {completing && <FeedbackModal session={completing} onClose={() => setCompleting(null)} />}
    </div>
  );
}
