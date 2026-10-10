import { useState } from "react";
import { Modal, Avatar } from "./ui.jsx";
import { directionScore, fmtSlot, fmtDate, nextOccurrence } from "../lib/matching.js";
import { useStore, makePairSession } from "../lib/store.jsx";
import { LOCATIONS } from "../data/seed.js";

/** Ask `teacher` for a session. Creates a PENDING session; it is only confirmed once they accept. */
export default function RequestModal({ teacher, onClose, onDone }) {
  const { me, dispatch, notify } = useStore();
  const detail = directionScore(me, teacher);
  const [slotIdx, setSlotIdx] = useState(0);
  const [location, setLocation] = useState(LOCATIONS[0]);

  if (!detail) {
    return (
      <Modal title="Request a session" onClose={onClose}>
        <p>{teacher.name} doesn't teach anything you want to learn at a time you're both free. Add more free time or skills on your profile, or send a message.</p>
        <div className="modal-actions"><button className="btn primary" onClick={onClose}>OK</button></div>
      </Modal>
    );
  }

  const send = () => {
    const slot = detail.overlap[slotIdx];
    dispatch({
      type: "addSessions",
      sessions: [makePairSession({
        teacherId: teacher.id, learnerId: me.id, skill: detail.skill, level: detail.learnerLevel,
        slot: { day: slot.day, start: slot.start, end: slot.end }, requestedBy: me.id, location,
      })],
    });
    notify(`Request sent to ${teacher.name.split(" ")[0]}. It becomes a session once they accept.`);
    onDone?.();
    onClose();
  };

  return (
    <Modal title={`Ask ${teacher.name.split(" ")[0]} for help`} onClose={onClose}>
      <div className="req-head">
        <Avatar person={teacher} size={44} />
        <div>
          <strong>{detail.skill} ({detail.learnerLevel})</strong>
          <div className="muted small">with {teacher.name}, who teaches it at {detail.teacherLevel} level</div>
        </div>
      </div>
      <label className="field">
        <span>Pick a time you're both free</span>
        <select value={slotIdx} onChange={(e) => setSlotIdx(Number(e.target.value))}>
          {detail.overlap.map((o, i) => (
            <option key={i} value={i}>{fmtSlot(o)} ({fmtDate(nextOccurrence(o.day))})</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Location</span>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </label>
      <p className="note">Asking for help is a good thing. This stays a <b>pending request</b> until {teacher.name.split(" ")[0]} accepts it.</p>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={send}>Send request</button>
      </div>
    </Modal>
  );
}
