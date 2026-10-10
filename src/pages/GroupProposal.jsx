import { useMemo, useState } from "react";
import { Avatar, AvatarStack, Icon, Modal, Empty } from "../components/ui.jsx";
import { useStore, makeGroupSession, participantsOf } from "../lib/store.jsx";
import { navigate } from "../lib/router.js";
import { groupProposals, fmtDate, fmtRange, fmtSlot, nextOccurrence, DAYS } from "../lib/matching.js";
import { LOCATIONS } from "../data/seed.js";

export default function GroupProposal({ id }) {
  const { state, me, byId, dispatch, notify } = useStore();
  const proposal = useMemo(() => groupProposals(state.students).find((g) => g.id === id), [state.students, id]);
  const existing = state.sessions.find((s) => s.groupId === id && s.status !== "cancelled" && s.status !== "completed");
  const [slotOverride, setSlotOverride] = useState(null);
  const [picking, setPicking] = useState(false);
  const [location, setLocation] = useState(LOCATIONS[0]);

  if (!proposal) {
    return (
      <div className="page">
        <button className="linkbtn back" onClick={() => navigate("/matches?tab=group")}><Icon name="back" size={16} /> Back</button>
        <Empty icon="users" title="This group proposal is no longer available">The teacher or learners' availability may have changed.</Empty>
      </div>
    );
  }

  const teacher = byId[existing?.teacherId || proposal.teacherId];
  const slot = existing?.slot || slotOverride || proposal.slot;
  const learnerIds = existing ? existing.learnerIds : proposal.learnerIds;
  const learners = learnerIds.map((i) => byId[i]);
  const date = existing?.date || nextOccurrence(slot.day);
  const iAmIn = existing ? participantsOf(existing).includes(me.id) : false;
  const iAccepted = existing?.accepted.includes(me.id);
  const iAmTeacher = teacher.id === me.id;

  const accept = () => {
    if (existing) {
      dispatch({ type: "joinSession", id: existing.id });
    } else {
      dispatch({ type: "addSessions", sessions: [makeGroupSession({ proposal, slot, teacherId: proposal.teacherId, requestedBy: me.id, location })] });
    }
    notify("You accepted. The session is confirmed once everyone accepts.");
  };

  // alternative windows: any window in which the teacher is free with >= 3 of the learners
  const options = [];
  const pool = proposal.learnerIds.map((i) => byId[i]);
  for (const t of [byId[proposal.teacherId], ...proposal.alternatives.map((a) => byId[a.teacherId])]) {
    if (t.id !== proposal.teacherId) continue; // keep the same teacher; alternatives listed separately
    for (const s of t.slots) {
      for (let h = s.start; h + 2 <= s.end; h++) {
        const n = pool.filter((l) => l.slots.some((x) => x.day === s.day && x.start <= h && x.end >= h + 2)).length;
        if (n >= 1 && !(s.day === slot.day && h === slot.start)) options.push({ day: s.day, start: h, end: h + 2, n });
      }
    }
  }
  options.sort((a, b) => b.n - a.n || a.day - b.day || a.start - b.start);

  const chooseSlot = (o) => {
    const s = { day: o.day, start: o.start, end: o.end };
    if (existing) dispatch({ type: "setSlot", id: existing.id, slot: s });
    else setSlotOverride(s);
    notify(`Suggested time changed to ${fmtSlot(s)}. Everyone has to accept the new time.`);
    setPicking(false);
  };

  const status = existing?.status;

  return (
    <div className="page narrow">
      <div className="gp-head">
        <h1><Icon name="users" size={22} /> Group Session Proposal</h1>
        <button className="linkbtn back" onClick={() => navigate("/matches?tab=group")}><Icon name="back" size={16} /> Back</button>
      </div>

      <div className="banner info big">
        <span className="group-ico sm"><Icon name="users" size={20} /></span>
        <div>
          <b>{proposal.demand.length} learners requested the same skill</b>
          <div className="small muted">We found a group session for {proposal.skill}. It runs when at least 3 learners share a free window with the teacher.</div>
        </div>
      </div>

      <div className="card gp-main">
        <div className="gp-left">
          <div className="gp-skill">
            <span className="group-ico"><Icon name="video" size={22} /></span>
            <div>
              <b>{proposal.skill} – {proposal.level}</b>
              <div className="small muted">{learners.length} learners · 1 teacher</div>
            </div>
          </div>
          <AvatarStack people={learners} max={4} size={30} />
          <div className="gp-actions">
            {!existing && <button className="btn primary" onClick={accept}>Accept Session</button>}
            {existing && !iAccepted && iAmIn && <button className="btn primary" onClick={accept}>Accept Session</button>}
            {existing && !iAmIn && <button className="btn primary" onClick={accept}>Join as learner</button>}
            {existing && iAccepted && status === "pending" && <button className="btn good" disabled><Icon name="check" size={16} /> You accepted</button>}
            {status !== "confirmed" && <button className="btn outline" onClick={() => setPicking(true)}>Suggest Another Time</button>}
          </div>
        </div>
        <div className="gp-time">
          <small className="muted">Suggested Time</small>
          <div className="gp-date"><Icon name="calendar" size={18} /> {fmtDate(date)}</div>
          <div className="gp-range">{fmtRange(slot)}</div>
          <small className="muted">{DAYS[slot.day]}s</small>
        </div>
      </div>

      <div className="status-line">
        <span className={`pill ${status || "suggested"}`}>{status === "confirmed" ? "Confirmed" : status === "pending" ? "Pending: waiting for everyone to accept" : "Suggested: not booked yet"}</span>
        {existing && <span className="small muted">{existing.accepted.length} of {participantsOf(existing).length} accepted</span>}
        {status === "pending" && (
          <button className="linkbtn" onClick={() => { dispatch({ type: "demoAcceptAll", id: existing.id }); notify("Demo: everyone accepted. Session confirmed."); }}>
            Demo: simulate everyone accepting
          </button>
        )}
        {status === "confirmed" && <button className="linkbtn" onClick={() => navigate("/sessions")}>Go to Sessions to mark it complete</button>}
      </div>

      <div className="card">
        <h3 className="card-title">Session Details</h3>
        <div className="detail-grid">
          <div className="detail"><Avatar person={teacher} size={36} /><div><small className="muted">Teacher{iAmTeacher ? " (you)" : ""}</small><b>{teacher.name} ({proposal.teacherLevel})</b></div></div>
          <div className="detail"><span className="d-ico"><Icon name="users" /></span><div><small className="muted">Learners</small><b>{learners.length} students</b></div></div>
          <div className="detail"><span className="d-ico"><Icon name="pin" /></span><div><small className="muted">Location</small>
            {existing ? <b>{existing.location}</b> : <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select>}
          </div></div>
          <div className="detail"><span className="d-ico"><Icon name="clock" /></span><div><small className="muted">Duration</small><b>{slot.end - slot.start} hours</b></div></div>
        </div>
        <h4 className="mini">Learners</h4>
        <div className="learner-list">
          {learners.map((l) => (
            <span key={l.id} className={`learner ${existing?.accepted.includes(l.id) ? "ok" : ""}`}>
              <Avatar person={l} size={24} /> {l.id === me.id ? "You" : l.name.split(" ")[0]}
              {existing?.accepted.includes(l.id) && <Icon name="check" size={13} />}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Why this proposal?</h3>
        <ul className="why plain">
          <li>{proposal.demand.length} students want {proposal.skill} at {proposal.level} level (demand pooled).</li>
          <li>{teacher.name.split(" ")[0]} teaches it at {proposal.teacherLevel} level and is free {fmtSlot(proposal.slot)}.</li>
          <li>{proposal.learnerIds.length} of those learners are free in that same window.</li>
          {proposal.alternatives.length > 0 && <li>Other possible teachers: {proposal.alternatives.map((a) => byId[a.teacherId].name.split(" ")[0]).join(", ")}.</li>}
        </ul>
      </div>

      {picking && (
        <Modal title="Suggest another time" onClose={() => setPicking(false)}>
          <p className="muted">Pick a window where the teacher is free. The number shows how many of the learners are also free.</p>
          {options.length === 0 && <p>No other windows found.</p>}
          <div className="option-list">
            {options.slice(0, 8).map((o, i) => (
              <button key={i} className="option" onClick={() => chooseSlot(o)}>
                <span>{fmtSlot(o)} <small className="muted">({fmtDate(nextOccurrence(o.day))})</small></span>
                <span className={`tag ${o.n >= 3 ? "mine" : ""}`}>{o.n} of {pool.length} learners free</span>
              </button>
            ))}
          </div>
          <p className="small muted">A group runs with 3 or more learners. Times with fewer will need more people to join.</p>
        </Modal>
      )}
    </div>
  );
}
