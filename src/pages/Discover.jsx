import { useMemo, useState } from "react";
import { Avatar, Icon, SkillTag, Empty, pct } from "../components/ui.jsx";
import RequestModal from "../components/RequestModal.jsx";
import { useStore } from "../lib/store.jsx";
import { useRoute, navigate } from "../lib/router.js";
import { LEVELS, DAYS, directionScore, summarizeSlots } from "../lib/matching.js";

export default function Discover() {
  const { query } = useRoute();
  const { state, me, dispatch } = useStore();
  const q = query.get("q") || "";
  const [text, setText] = useState(q);
  const [mode, setMode] = useState("all");
  const [level, setLevel] = useState("");
  const [day, setDay] = useState("");
  const [requestTo, setRequestTo] = useState(null);
  const [openWhy, setOpenWhy] = useState(null);
  const bookmarks = state.bookmarks[me.id] || [];

  const needle = (query.get("q") ?? "").trim().toLowerCase();

  const results = useMemo(() => {
    return state.students
      .filter((s) => s.id !== me.id)
      .filter((s) => {
        const teachHit = s.teach.filter((t) => !needle || t.skill.toLowerCase().includes(needle));
        const learnHit = s.learn.filter((t) => !needle || t.skill.toLowerCase().includes(needle));
        const nameHit = needle && s.name.toLowerCase().includes(needle);
        let pool = [];
        if (mode === "all") pool = [...teachHit, ...learnHit];
        if (mode === "teach") pool = teachHit;
        if (mode === "learn") pool = learnHit;
        if (nameHit && !level) pool = pool.length ? pool : [{ level: "any" }];
        if (!pool.length) return false;
        if (level && !pool.some((p) => p.level === level)) return false;
        if (day !== "" && !s.slots.some((sl) => sl.day === Number(day))) return false;
        return true;
      })
      .map((s) => ({ s, fit: directionScore(me, s) }))
      .sort((a, b) => (b.fit?.score || 0) - (a.fit?.score || 0) || b.s.helped - a.s.helped);
  }, [state.students, me, needle, mode, level, day]);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/discover${text.trim() ? `?q=${encodeURIComponent(text.trim())}` : ""}`);
  };

  return (
    <div className="page">
      <h1>Discover People &amp; Skills</h1>
      <form className="searchbar" onSubmit={submit} role="search">
        <Icon name="search" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search a skill or a person, e.g. Python" aria-label="Search skills or people" />
        <button className="btn primary" type="submit">Search</button>
      </form>

      <div className="filters">
        {[["all", "All"], ["teach", "Teach"], ["learn", "Learn"]].map(([k, label]) => (
          <button key={k} className={`pillbtn ${mode === k ? "on" : ""}`} onClick={() => setMode(k)} aria-pressed={mode === k}>{label}</button>
        ))}
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Skill level">
          <option value="">Skill Level</option>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={day} onChange={(e) => setDay(e.target.value)} aria-label="Available day">
          <option value="">Available Time</option>
          {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>
        {(level || day !== "" || mode !== "all" || q) && (
          <button className="linkbtn" onClick={() => { setMode("all"); setLevel(""); setDay(""); setText(""); navigate("/discover"); }}>Clear filters</button>
        )}
      </div>

      <p className="muted small" aria-live="polite">{results.length} {results.length === 1 ? "person" : "people"} found</p>

      {results.length === 0 && (
        <Empty icon="search" title="Nobody matches those filters yet">
          Try a different skill or clear the filters. Can't find a teacher for a skill? Add it to "Wants to learn" on your profile and SkillSwap will pool demand with other learners.
        </Empty>
      )}

      <div className="stack">
        {results.map(({ s, fit }) => (
          <article key={s.id} className="person card">
            <Avatar person={s} size={56} />
            <div className="person-body">
              <h3>{s.name} <span className="muted small">{s.dept}, Year {s.year}</span></h3>
              <div className="kv"><span>Can teach:</span> <span>{s.teach.map((t) => <SkillTag key={t.skill} {...t} />)}{s.teach.length === 0 && <i className="muted">Nothing added yet</i>}</span></div>
              <div className="kv"><span>Wants to learn:</span> <span>{s.learn.map((t) => <SkillTag key={t.skill} {...t} />)}{s.learn.length === 0 && <i className="muted">Nothing added yet</i>}</span></div>
              <div className="kv avail"><Icon name="calendar" size={15} /> <span>{summarizeSlots(s.slots)}</span></div>
              {fit && (
                <div className="fit">
                  <button className="fitbtn" onClick={() => setOpenWhy(openWhy === s.id ? null : s.id)} aria-expanded={openWhy === s.id}>
                    <Icon name="sparkle" size={14} /> Teaches {fit.skill}, which you want · {pct(fit.score)} fit
                  </button>
                  {openWhy === s.id && (
                    <ul className="why">
                      {fit.reasons.map((r) => <li key={r}>{r}</li>)}
                      <li className="muted">Score = skill overlap {pct(fit.skillOverlap)} × schedule {pct(fit.scheduleScore)} × level fit {pct(fit.levelFit)}</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="person-side">
              <div className="ga-badge" title="People helped / times asked for help">
                <b>{s.helped} / {s.asked}</b><small>Helped / Asked</small>
              </div>
              <div className="person-actions">
                <button className="btn primary sm" onClick={() => navigate(`/messages?with=${s.id}`)}>Message</button>
                {fit && <button className="btn outline sm" onClick={() => setRequestTo(s)}>Ask for help</button>}
                <button className={`icon-btn ${bookmarks.includes(s.id) ? "saved" : ""}`} onClick={() => dispatch({ type: "toggleBookmark", id: s.id })} aria-label={bookmarks.includes(s.id) ? `Remove ${s.name} from saved` : `Save ${s.name}`} aria-pressed={bookmarks.includes(s.id)}>
                  <Icon name="bookmark" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {requestTo && <RequestModal teacher={requestTo} onClose={() => setRequestTo(null)} />}
    </div>
  );
}
