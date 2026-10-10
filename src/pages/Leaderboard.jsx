import { useMemo } from "react";
import { Avatar } from "../components/ui.jsx";
import { useStore } from "../lib/store.jsx";
import { giveAskPoints, badgeFor, POINTS_PER_ASK, POINTS_PER_HELP } from "../lib/matching.js";
import { navigate } from "../lib/router.js";

export default function Leaderboard() {
  const { state, me } = useStore();
  const rows = useMemo(
    () => [...state.students].map((s) => ({ s, pts: giveAskPoints(s) })).sort((a, b) => b.pts - a.pts || b.s.helped - a.s.helped),
    [state.students]
  );
  const max = rows[0]?.pts || 1;
  return (
    <div className="page">
      <h1>Leaderboard</h1>
      <p className="muted">Give &amp; Ask score = {POINTS_PER_HELP} points for each person you help + {POINTS_PER_ASK} points each time you ask for help. Asking is rewarded too.</p>
      <div className="card table-card">
        <table className="lb">
          <thead><tr><th>#</th><th>Student</th><th>Helped</th><th>Asked</th><th>Score</th><th>Level</th></tr></thead>
          <tbody>
            {rows.map(({ s, pts }, i) => (
              <tr key={s.id} className={s.id === me.id ? "me" : ""}>
                <td className="rank">{i + 1}</td>
                <td><button className="who-btn" onClick={() => navigate(`/discover?q=${encodeURIComponent(s.name)}`)}><Avatar person={s} size={32} /> {s.name}{s.id === me.id && <span className="you">You</span>}</button></td>
                <td>{s.helped}</td>
                <td>{s.asked}</td>
                <td><div className="bar"><span style={{ width: `${(pts / max) * 100}%` }} /></div><b>{pts}</b></td>
                <td><span className="tag">{badgeFor(pts).name}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
