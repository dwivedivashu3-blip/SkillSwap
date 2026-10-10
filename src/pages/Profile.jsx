import { useState } from "react";
import { Avatar, Icon, ScoreRing } from "../components/ui.jsx";
import { useStore } from "../lib/store.jsx";
import { SKILLS } from "../data/seed.js";
import { LEVELS, DAYS, fmtHour, giveAskPoints, badgeFor } from "../lib/matching.js";

function SkillEditor({ title, hint, items, onChange }) {
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [err, setErr] = useState("");
  const add = () => {
    const name = skill.trim().replace(/\s+/g, " ");
    if (!name) return setErr("Type or pick a skill first.");
    const canonical = SKILLS.find((x) => x.toLowerCase() === name.toLowerCase()) || name;
    if (items.some((i) => i.skill.toLowerCase() === canonical.toLowerCase())) return setErr(`${canonical} is already in this list.`);
    onChange([...items, { skill: canonical, level }]);
    setSkill(""); setErr("");
  };
  const listId = `skills-${title.replace(/\W/g, "")}`;
  return (
    <section className="card">
      <h3 className="card-title">{title}</h3>
      <p className="muted small">{hint}</p>
      <div className="tag-list">
        {items.length === 0 && <i className="muted small">Nothing yet. Add your first one below.</i>}
        {items.map((i) => (
          <span key={i.skill} className="tag-edit">
            {i.skill} <em>({i.level})</em>
            <button onClick={() => onChange(items.filter((x) => x.skill !== i.skill))} aria-label={`Remove ${i.skill}`}><Icon name="x" size={13} /></button>
          </span>
        ))}
      </div>
      <div className="add-row">
        <input list={listId} value={skill} onChange={(e) => { setSkill(e.target.value); setErr(""); }} placeholder="Skill, e.g. Python" aria-label={`${title}: skill name`} onKeyDown={(e) => e.key === "Enter" && add()} />
        <datalist id={listId}>{SKILLS.map((x) => <option key={x} value={x} />)}</datalist>
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        <button className="btn primary sm" onClick={add}><Icon name="plus" size={15} /> Add</button>
      </div>
      {err && <p className="error" role="alert">{err}</p>}
    </section>
  );
}

function Availability({ slots, onChange }) {
  const [day, setDay] = useState(0);
  const [start, setStart] = useState(16);
  const [end, setEnd] = useState(18);
  const [err, setErr] = useState("");
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const add = () => {
    if (end - start < 1) return setErr("End time must be at least one hour after the start time.");
    if (slots.some((s) => s.day === day && s.start < end && s.end > start)) return setErr("That overlaps a slot you already added.");
    onChange([...slots, { day, start, end }].sort((a, b) => a.day - b.day || a.start - b.start));
    setErr("");
  };
  return (
    <section className="card">
      <h3 className="card-title">Free time</h3>
      <p className="muted small">Matches and sessions use these real slots. Add the times you can actually meet.</p>
      <div className="tag-list">
        {slots.length === 0 && <i className="muted small">No free time yet. You won't get matches until you add some.</i>}
        {slots.map((s, i) => (
          <span key={i} className="tag-edit">
            {DAYS[s.day]} {fmtHour(s.start)} – {fmtHour(s.end)}
            <button onClick={() => onChange(slots.filter((_, j) => j !== i))} aria-label="Remove slot"><Icon name="x" size={13} /></button>
          </span>
        ))}
      </div>
      <div className="add-row">
        <select value={day} onChange={(e) => setDay(Number(e.target.value))} aria-label="Day">{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
        <select value={start} onChange={(e) => setStart(Number(e.target.value))} aria-label="From">{hours.slice(0, -1).map((h) => <option key={h} value={h}>{fmtHour(h)}</option>)}</select>
        <select value={end} onChange={(e) => setEnd(Number(e.target.value))} aria-label="To">{hours.slice(1).map((h) => <option key={h} value={h}>{fmtHour(h)}</option>)}</select>
        <button className="btn primary sm" onClick={add}><Icon name="plus" size={15} /> Add slot</button>
      </div>
      {err && <p className="error" role="alert">{err}</p>}
    </section>
  );
}

export default function Profile() {
  const { me, dispatch, notify } = useStore();
  const patch = (p, msg) => { dispatch({ type: "updateStudent", id: me.id, patch: p }); if (msg) notify(msg); };
  const pts = giveAskPoints(me);
  const badge = badgeFor(pts);
  return (
    <div className="page">
      <h1>My Profile</h1>
      <section className="card profile-head">
        <Avatar person={me} size={72} />
        <div className="grow">
          <label className="field"><span>Name</span><input value={me.name} onChange={(e) => patch({ name: e.target.value })} /></label>
          <label className="field"><span>About you</span><textarea rows={2} value={me.bio} onChange={(e) => patch({ bio: e.target.value })} /></label>
        </div>
        <div className="ph-score"><ScoreRing helped={me.helped} asked={me.asked} progress={badge.progress} size={96} /><b>{badge.name}</b><small className="muted">{pts} pts</small></div>
      </section>
      <SkillEditor title="Skills I can teach" hint="Everyone knows something worth sharing." items={me.teach} onChange={(v) => patch({ teach: v }, "Teaching skills updated")} />
      <SkillEditor title="Skills I want to learn" hint="Asking for help is a strength. This is how SkillSwap finds your matches." items={me.learn} onChange={(v) => patch({ learn: v }, "Learning goals updated")} />
      <Availability slots={me.slots} onChange={(v) => patch({ slots: v }, "Free time updated")} />
    </div>
  );
}
