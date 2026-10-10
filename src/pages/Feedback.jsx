import { Avatar, Icon, Stars, ScoreRing, Empty } from "../components/ui.jsx";
import { useStore, participantsOf } from "../lib/store.jsx";
import { navigate } from "../lib/router.js";
import { giveAskPoints, badgeFor } from "../lib/matching.js";

export default function Feedback({ id }) {
  const { state, me, byId } = useStore();
  const s = state.sessions.find((x) => x.id === id);
  if (!s || s.status !== "completed") {
    return <div className="page"><Empty icon="star" title="No completed session found" action={<button className="btn primary" onClick={() => navigate("/sessions")}>Back to sessions</button>}>Feedback appears after a confirmed session is marked complete.</Empty></div>;
  }
  const iAmIn = participantsOf(s).includes(me.id);
  const helped = s.teacherId === me.id ? s.learnerIds.length : 0;
  const asked = s.learnerIds.includes(me.id) ? 1 : 0;
  const badge = badgeFor(giveAskPoints(me));

  return (
    <div className="page narrow">
      <h1>Session Feedback</h1>
      <div className="banner good big">
        <span className="big-check"><Icon name="check" size={20} /></span>
        <div><b>Session completed!</b><div className="small muted">{s.skill} ({s.level}). The Give &amp; Ask score has been updated for everyone who took part.</div></div>
      </div>

      <div className="stack">
        {s.feedback.length === 0 && <p className="muted">No written feedback was left for this session.</p>}
        {s.feedback.map((f, i) => (
          <div className="card fb-card" key={i}>
            <Avatar person={byId[f.fromId]} size={40} />
            <div className="grow">
              <b>{byId[f.fromId].name}</b> <small className="muted">({f.fromId === s.teacherId ? "Teacher" : "Learner"})</small>
              <div><Stars value={f.rating} size={16} /></div>
              {f.comment && <p className="quote">{f.comment}</p>}
              <small className="muted">For {byId[f.toId].name}</small>
            </div>
          </div>
        ))}
      </div>

      {iAmIn && (
        <div className="card score-updated">
          <h3 className="card-title"><Icon name="leaf" size={18} className="green-t" /> Give &amp; Ask Score Updated</h3>
          <div className="su-row">
            <div className="delta green"><Icon name="users" /><b>+{helped}</b><small>People helped</small></div>
            <div className="delta lav"><Icon name="help" /><b>+{asked}</b><small>Times asked</small></div>
            <div className="su-ring"><ScoreRing helped={me.helped} asked={me.asked} progress={badge.progress} size={104} /><small className="muted">Total score · {badge.name}</small></div>
          </div>
          <p className="small muted">Showing the score for {me.name}. Use “Demo: viewing as” to see the others.</p>
        </div>
      )}
      <div className="card-actions"><button className="btn outline" onClick={() => navigate("/sessions?tab=completed")}>Back to sessions</button></div>
    </div>
  );
}
