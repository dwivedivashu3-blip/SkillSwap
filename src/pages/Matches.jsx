import { useMemo, useState } from "react";
import { Avatar, Icon, Empty, Modal, AvatarStack, pct } from "../components/ui.jsx";
import RequestModal from "../components/RequestModal.jsx";
import { useStore, makePairSession, makeChainSessions } from "../lib/store.jsx";
import { useRoute, navigate } from "../lib/router.js";
import { directMatches, chainSwaps, groupProposals, helpersFor, fmtSlot, fmtRange, fmtDate, nextOccurrence, DAYS } from "../lib/matching.js";

const TABS = [["direct", "Direct Matches"], ["chain", "Chain Swaps"], ["group", "Group Sessions"]];

function ScoreBreakdown({ d }) {
  return (
    <div className="breakdown">
      <div><span>Skill overlap</span><b>{pct(d.skillOverlap)}</b></div>
      <div><span>Schedule overlap</span><b>{pct(d.scheduleScore)}</b></div>
      <div><span>Level fit</span><b>{pct(d.levelFit)}</b></div>
      <div className="total"><span>Match score</span><b>{pct(d.score)}</b></div>
    </div>
  );
}

/* ---------------- Direct ---------------- */
function Direct({ onSwitchTab }) {
  const { state, me, byId, dispatch, notify } = useStore();
  const direct = useMemo(() => directMatches(me.id, state.students), [state.students, me.id]);
  const helpers = useMemo(() => helpersFor(me.id, state.students).slice(0, 4), [state.students, me.id]);
  const [ask, setAsk] = useState(null);

  const requestSwap = (m) => {
    const partner = byId[m.partnerId];
    const f = m.forward.overlap[0], b = m.backward.overlap[0];
    dispatch({
      type: "addSessions",
      sessions: [
        makePairSession({ teacherId: partner.id, learnerId: me.id, skill: m.forward.skill, level: m.forward.learnerLevel, slot: { day: f.day, start: f.start, end: f.end }, requestedBy: me.id }),
        makePairSession({ teacherId: me.id, learnerId: partner.id, skill: m.backward.skill, level: m.backward.learnerLevel, slot: { day: b.day, start: b.start, end: b.end }, requestedBy: me.id }),
      ],
    });
    notify(`Swap requested with ${partner.name.split(" ")[0]}. Both sessions stay pending until they accept.`);
    navigate("/sessions?tab=pending");
  };

  if (direct.length === 0) {
    return (
      <>
        <div className="banner info">
          <Icon name="info" /> No two-way swap is available for you right now. Try a <button className="linkbtn" onClick={() => onSwitchTab("chain")}>chain swap</button> or a <button className="linkbtn" onClick={() => onSwitchTab("group")}>group session</button>.
        </div>
        <h3 className="subhead">People who can teach what you want</h3>
        {helpers.length === 0 && <Empty title="No teachers found">Add a skill you want to learn on your profile.</Empty>}
        <div className="stack">
          {helpers.map((h) => {
            const t = byId[h.teacherId];
            return (
              <div key={t.id} className="card helper">
                <Avatar person={t} size={44} />
                <div className="grow"><b>{t.name}</b> teaches <b>{h.skill}</b> ({h.teacherLevel})<div className="muted small">{h.reasons[1]}</div></div>
                <span className="score-pill">{pct(h.score)} fit</span>
                <button className="btn outline sm" onClick={() => setAsk(t)}>Ask for help</button>
              </div>
            );
          })}
        </div>
        {ask && <RequestModal teacher={ask} onClose={() => setAsk(null)} />}
      </>
    );
  }

  return (
    <div className="stack">
      {direct.map((m) => {
        const p = byId[m.partnerId];
        return (
          <div key={m.id} className="card direct">
            <div className="direct-people">
              <div className="pbox"><Avatar person={me} size={52} /><b>You</b><small>learn {m.forward.skill}</small></div>
              <div className="swap-ico"><Icon name="refresh" size={22} /></div>
              <div className="pbox"><Avatar person={p} size={52} /><b>{p.name}</b><small>learns {m.backward.skill}</small></div>
              <span className="score-pill big">{pct(m.score)} match</span>
            </div>
            <p className="muted">{p.name.split(" ")[0]} teaches you <b>{m.forward.skill}</b> ({m.forward.teacherLevel}); you teach {p.name.split(" ")[0]} <b>{m.backward.skill}</b> ({m.backward.teacherLevel}).</p>
            <div className="two-col">
              <div><h5>You learn</h5><ScoreBreakdown d={m.forward} /><p className="small muted">First shared slot: {fmtSlot(m.forward.overlap[0])}</p></div>
              <div><h5>You teach</h5><ScoreBreakdown d={m.backward} /><p className="small muted">First shared slot: {fmtSlot(m.backward.overlap[0])}</p></div>
            </div>
            <div className="card-actions">
              <span className="note-inline">This is a suggestion. It becomes a session after both of you accept.</span>
              <button className="btn primary" onClick={() => requestSwap(m)}>Request swap</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Chain ---------------- */
function Chain({ onSwitchTab }) {
  const { state, me, byId, dispatch, notify } = useStore();
  const chains = useMemo(() => chainSwaps(me.id, state.students), [state.students, me.id]);
  const hasDirect = useMemo(() => directMatches(me.id, state.students).length > 0, [state.students, me.id]);
  const [detail, setDetail] = useState(null);

  const request = (chain) => {
    dispatch({ type: "addSessions", sessions: makeChainSessions({ chain, requestedBy: me.id }) });
    notify("Chain swap requested. Each step stays pending until that pair accepts.");
    setDetail(null);
    navigate("/sessions?tab=pending");
  };

  if (!chains.length) {
    return (
      <Empty icon="graph" title="No chain swaps for you yet" action={<button className="btn outline" onClick={() => onSwitchTab("group")}>See group sessions</button>}>
        A chain swap needs a loop where each person teaches what the next person wants. Add more skills or free time on your profile to create more loops.
      </Empty>
    );
  }

  return (
    <div className="stack">
      <div className="banner good">
        <Icon name="check" /> {hasDirect ? `We found ${chains.length} chain swap${chains.length > 1 ? "s" : ""} in addition to your direct matches.` : `We found ${chains.length === 1 ? "a chain swap" : `${chains.length} chain swaps`}! No direct pairs were available, but ${chains.length === 1 ? "this cycle works" : "these cycles work"}:`}
      </div>
      {chains.map((c) => (
        <div key={c.id} className="card chain">
          <div className="chain-row">
            {c.members.map((id, i) => {
              const p = byId[id];
              const e = c.edges[i];
              const teachesSkill = c.edges[(i + c.members.length - 1) % c.members.length].skill;
              return (
                <div key={id} className="chain-seg">
                  <div className="chain-person">
                    <Avatar person={p} size={60} />
                    <b>{id === me.id ? `${p.name.split(" ")[0]} (you)` : p.name.split(" ")[0]}</b>
                    <div className="small">Can teach: <b className="blue">{teachesSkill}</b></div>
                    <div className="small">Wants to learn: <b className="blue">{e.skill}</b></div>
                    <span className={`step-badge s${i % 3}`}>{i + 1} → {((i + 1) % c.members.length) + 1}</span>
                  </div>
                  {i < c.members.length - 1 && <span className="arrow"><Icon name="arrow" size={22} /></span>}
                </div>
              );
            })}
            <span className="arrow loop" title="The last person teaches the first, closing the loop"><Icon name="refresh" size={20} /></span>
          </div>
          <div className="cycle-box">
            <span className="cycle-ico"><Icon name="graph" size={22} /></span>
            <div className="grow">
              <b>Cycle detected using graph theory</b>
              <div className="small muted">Each person's teaching skill matches the next person's learning goal, and each pair shares a free slot. Match score {pct(c.score)}.</div>
            </div>
            <button className="btn good" onClick={() => setDetail(c)}>View Details</button>
          </div>
        </div>
      ))}

      {detail && (
        <Modal title="Chain swap details" onClose={() => setDetail(null)} wide>
          <p className="muted">Every step is a real free-time overlap. Nobody has to teach and learn from the same person.</p>
          <ol className="chain-steps">
            {detail.edges.map((e, i) => (
              <li key={i}>
                <b>{byId[e.learnerId].name.split(" ")[0]}</b> learns <b>{e.skill}</b> ({e.learnerLevel}) from <b>{byId[e.teacherId].name.split(" ")[0]}</b> ({e.teacherLevel})
                <div className="small muted">Free together: {e.overlap.slice(0, 2).map(fmtSlot).join(" · ")} · fit {pct(e.score)}</div>
              </li>
            ))}
          </ol>
          <p className="small muted">Detected by walking the learning graph (edge = “can learn from”) and keeping every simple loop of 3 to 4 people.</p>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setDetail(null)}>Close</button>
            <button className="btn primary" onClick={() => request(detail)}>Request chain swap</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Group ---------------- */
function Group() {
  const { state, me, byId } = useStore();
  const groups = useMemo(() => groupProposals(state.students), [state.students]);
  if (!groups.length) return <Empty icon="users" title="No group sessions yet">Group sessions appear when 3 or more students want the same skill and a teacher shares a free window.</Empty>;
  const rel = (g) => (g.teacherId === me.id ? 0 : g.demand.includes(me.id) ? 1 : me.teach.some((t) => t.skill === g.skill) ? 2 : 3);
  const sorted = [...groups].sort((a, b) => rel(a) - rel(b));
  const label = (g) => (g.teacherId === me.id ? "You're the proposed teacher" : g.demand.includes(me.id) ? "You asked for this" : me.teach.some((t) => t.skill === g.skill) ? "You could teach this" : "Open to join");
  return (
    <div className="stack">
      {sorted.map((g) => {
        const teacher = byId[g.teacherId];
        return (
          <button key={g.id} className="card group-card" onClick={() => navigate(`/group/${g.id}`)}>
            <span className="group-ico"><Icon name="video" size={24} /></span>
            <div className="grow">
              <b>{g.skill} – {g.level}</b>
              <div className="small muted">{g.learnerIds.length} learners · taught by {teacher.name} ({g.teacherLevel})</div>
              <div className="small">{DAYS[g.slot.day]}, {fmtDate(nextOccurrence(g.slot.day))} · {fmtRange(g.slot)}</div>
            </div>
            <AvatarStack people={g.learnerIds.map((i) => byId[i])} />
            <span className={`tag ${rel(g) < 3 ? "mine" : ""}`}>{label(g)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Matches() {
  const { query } = useRoute();
  const tab = TABS.some(([k]) => k === query.get("tab")) ? query.get("tab") : null;
  const { state, me } = useStore();
  // default to the tab that actually has something for this person
  const initial = useMemo(() => {
    if (tab) return tab;
    if (directMatches(me.id, state.students).length) return "direct";
    if (chainSwaps(me.id, state.students).length) return "chain";
    return "direct";
  }, [tab, me.id, state.students]);
  const go = (k) => navigate(`/matches?tab=${k}`);
  return (
    <div className="page">
      <h1>Smart Matches</h1>
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={initial === k} className={initial === k ? "on" : ""} onClick={() => go(k)}>{label}</button>
        ))}
      </div>
      <p className="muted small explain">Match score = skill overlap × schedule overlap × level fit. These are suggestions. Nothing is booked until everyone involved accepts.</p>
      {initial === "direct" && <Direct onSwitchTab={go} />}
      {initial === "chain" && <Chain onSwitchTab={go} />}
      {initial === "group" && <Group />}
    </div>
  );
}
