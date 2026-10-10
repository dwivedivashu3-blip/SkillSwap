// Server-render every route with the seeded data and fail on any exception.
import { renderToString } from "react-dom/server";
import App from "../src/App.jsx";
import { reducer, initialState, makePairSession, makeChainSessions, makeGroupSession, participantsOf } from "../src/lib/store.jsx";
import { chainSwaps, groupProposals } from "../src/lib/matching.js";

const mem = {};
globalThis.window = {
  location: { hash: "#/" },
  localStorage: { getItem: (k) => mem[k] ?? null, setItem: (k, v) => (mem[k] = v) },
  addEventListener() {}, removeEventListener() {}, scrollTo() {},
};
globalThis.localStorage = window.localStorage;

const routes = [
  "#/", "#/discover", "#/discover?q=python", "#/discover?q=zzzz", "#/matches", "#/matches?tab=direct",
  "#/matches?tab=chain", "#/matches?tab=group", "#/group/group-video-editing-beginner", "#/group/group-python-beginner",
  "#/group/group-guitar-beginner", "#/group/nope", "#/profile", "#/messages", "#/messages?with=rohan",
  "#/sessions", "#/sessions?tab=pending", "#/sessions?tab=completed", "#/feedback/s-seed-1", "#/feedback/nope",
  "#/leaderboard", "#/about",
];
let failed = 0;
for (const r of routes) {
  window.location.hash = r;
  try {
    const html = renderToString(<App />);
    if (html.length < 500) throw new Error("suspiciously small output");
    console.log("ok  ", r.padEnd(42), html.length, "bytes");
  } catch (e) {
    failed++;
    console.log("FAIL", r, e.stack.split("\n").slice(0, 4).join("\n"));
  }
}
// check a few content facts on specific routes
const text = (r) => { window.location.hash = r; return renderToString(<App />).replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "); };
const must = [
  ["#/", "Welcome back, Ananya!"], ["#/", "Give &amp; Ask Score"],
  ["#/matches?tab=chain", "Cycle detected using graph theory"], ["#/matches?tab=chain", "No direct pairs were available"],
  ["#/matches?tab=group", "Video Editing – Beginner"], ["#/group/group-video-editing-beginner", "4 learners requested the same skill"],
  ["#/feedback/s-seed-1", "Session completed!"], ["#/discover?q=python", "people found"],
];
for (const [r, needle] of must) {
  if (!text(r).includes(needle)) { failed++; console.log("MISSING", r, needle); } else console.log("has ", r.padEnd(42), JSON.stringify(needle));
}

/* ---------- session lifecycle ---------- */
const check = (cond, msg) => { if (!cond) { failed++; console.log("LIFECYCLE FAIL:", msg); } else console.log("ok   lifecycle:", msg); };
let st = initialState();
const before = Object.fromEntries(st.students.map((s) => [s.id, { h: s.helped, a: s.asked }]));
const sess = makePairSession({ teacherId: "rahul", learnerId: "ananya", skill: "Guitar", level: "Beginner", slot: { day: 0, start: 17, end: 19 }, requestedBy: "ananya" });
st = reducer(st, { type: "addSessions", sessions: [sess] });
let cur = () => st.sessions.find((x) => x.id === sess.id);
check(cur().status === "pending", "a new request is PENDING, not confirmed");
st = reducer(st, { type: "completeSession", id: sess.id, feedback: [] });
check(cur().status === "pending", "a pending session cannot be completed");
st = reducer(st, { type: "acceptSession", id: sess.id }); // still Ananya
check(cur().status === "pending", "accepting twice as the requester does not confirm it");
st = reducer(reducer(st, { type: "switchUser", id: "rahul" }), { type: "acceptSession", id: sess.id });
check(cur().status === "confirmed", "teacher accepting makes it CONFIRMED");
st = reducer(st, { type: "completeSession", id: sess.id, feedback: [{ fromId: "rahul", toId: "ananya", rating: 5, comment: "great" }] });
check(cur().status === "completed", "confirmed session can be completed");
const h = (id) => st.students.find((s) => s.id === id);
check(h("rahul").helped === before.rahul.h + 1, "teacher helped +1");
check(h("ananya").asked === before.ananya.a + 1, "learner asked +1");
st = reducer(st, { type: "completeSession", id: sess.id, feedback: [] });
check(h("rahul").helped === before.rahul.h + 1, "completing twice does not double-count");

// chain: three pending sessions, one per edge
const chain = chainSwaps("ananya", initialState().students)[0];
const cs = makeChainSessions({ chain, requestedBy: "ananya" });
check(cs.length === 3 && cs.every((c) => c.status === "pending" && c.chainId === cs[0].chainId), "chain swap creates 3 linked pending sessions");
// group: needs everyone, including a late joiner
const g = groupProposals(initialState().students).find((x) => x.skill === "Video Editing");
const gs = makeGroupSession({ proposal: g, slot: g.slot, teacherId: g.teacherId, requestedBy: "dev" });
check(gs.status === "pending" && gs.accepted.length === 1, "group session starts pending with one acceptance");
st = reducer(initialState(), { type: "addSessions", sessions: [gs] });
st = reducer(st, { type: "demoAcceptAll", id: gs.id });
check(st.sessions.find((x) => x.id === gs.id).status === "confirmed", "all participants accepting confirms the group");

process.exit(failed ? 1 : 0);
