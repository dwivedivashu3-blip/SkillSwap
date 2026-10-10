import { Icon } from "../components/ui.jsx";
import { navigate } from "../lib/router.js";

const STEPS = [
  ["Profile", "Add skills to teach, skills to learn and your free slots."],
  ["Dashboard", "Search who knows what and reach out."],
  ["Match", "Pairs, chains and groups are suggested, with reasons."],
  ["Session", "Meet in a common free slot once everyone accepts."],
  ["Feedback", "Your Give & Ask score updates."],
];

export default function About() {
  return (
    <div className="page narrow about">
      <h1>Everyone is a teacher. Everyone is a learner.</h1>
      <p className="lead">SkillSwap is a free, peer-to-peer skill exchange for campus. No money changes hands, ever.</p>

      <h2 className="section">The problem</h2>
      <div className="trio">
        <div className="card"><b>Skills stay hidden</b><p className="muted">A classmate knows Python or guitar, but nobody can see it.</p></div>
        <div className="card"><b>Asking feels awkward</b><p className="muted">Many students stay silent instead of asking for help.</p></div>
        <div className="card"><b>Meetups never happen</b><p className="muted">“Let's meet sometime” fails when schedules never line up.</p></div>
      </div>

      <h2 className="section">How SkillSwap works</h2>
      <ol className="steps">
        {STEPS.map(([t, d]) => <li key={t}><b>{t}</b><span className="muted">{d}</span></li>)}
      </ol>

      <h2 className="section">Under the hood</h2>
      <div className="card prose">
        <p><b>Match score = skill overlap × schedule overlap × level fit.</b> Every suggestion on the Smart Matches page can show its three numbers.</p>
        <p><b>Chain swaps.</b> When nobody forms a direct pair, SkillSwap looks for a loop: Ananya teaches Python to Meera, Meera teaches video editing to Rahul, Rahul teaches guitar to Ananya. The loop is found with directed-cycle detection on the “can learn from” graph.</p>
        <p><b>Group sessions.</b> When 3 or more students want the same skill and a teacher shares a free window with them, SkillSwap proposes one study circle.</p>
        <p><b>Suggestion vs session.</b> A match is only a suggestion. It becomes a pending request when someone asks, and a confirmed session only after everyone accepts.</p>
        <p className="muted small">This web prototype implements the logic in JavaScript with demo data. The original project plan uses Google Sheets, Pandas + NetworkX and Streamlit for the same algorithms.</p>
      </div>

      <h2 className="section">Pilot plan and what's next</h2>
      <div className="trio">
        <div className="card"><b>Build</b><p className="muted">5 to 8 skills and about 20 profiles.</p></div>
        <div className="card"><b>Pilot</b><p className="muted">15 to 20 friends use it for a few days.</p></div>
        <div className="card"><b>Measure</b><p className="muted">Sessions arranged and skills exchanged.</p></div>
      </div>
      <p className="muted">Next: reputation badges, club integration and a campus skill map.</p>

      <div className="cta-band">
        <div><b>Ask. Help. Repeat.</b><div className="small muted">Did you ask for help? How many people have you helped? (Inspired by workplace culture, not an official rule.)</div></div>
        <button className="btn primary" onClick={() => navigate("/discover")}>Start exploring <Icon name="arrow" size={16} /></button>
      </div>
    </div>
  );
}
