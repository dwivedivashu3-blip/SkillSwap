import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from "react";
import { STUDENTS, SEED_THREADS, makeSeedSessions } from "../data/seed.js";
import { nextOccurrence } from "./matching.js";

const KEY = "skillswap-demo-v1";
const StoreCtx = createContext(null);

export const threadKey = (a, b) => [a, b].sort().join("|");
export const participantsOf = (s) => [s.teacherId, ...s.learnerIds];
const uid = () => "s-" + Math.random().toString(36).slice(2, 9);
const iso = (d) => new Date(d).toISOString();

export function initialState() {
  return {
    currentUserId: "ananya",
    students: STUDENTS,
    bookmarks: { ananya: ["rohan", "meera"] },
    threads: SEED_THREADS,
    sessions: makeSeedSessions(),
    lastResult: null, // result of the most recent completed session (for the feedback screen)
  };
}

function load() {
  try {
    const raw = typeof window !== "undefined" && window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.students && parsed.sessions) return parsed;
    }
  } catch (e) {
    /* storage unavailable or corrupted: fall back to seed data */
  }
  return initialState();
}

function withStatus(session) {
  const everyone = participantsOf(session);
  const all = everyone.every((p) => session.accepted.includes(p));
  if (session.status === "pending" && all) return { ...session, status: "confirmed" };
  return session;
}

export function reducer(state, action) {
  switch (action.type) {
    case "switchUser":
      return { ...state, currentUserId: action.id };

    case "updateStudent":
      return {
        ...state,
        students: state.students.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      };

    case "toggleBookmark": {
      const mine = state.bookmarks[state.currentUserId] || [];
      const next = mine.includes(action.id) ? mine.filter((x) => x !== action.id) : [...mine, action.id];
      return { ...state, bookmarks: { ...state.bookmarks, [state.currentUserId]: next } };
    }

    case "sendMessage": {
      const k = threadKey(state.currentUserId, action.toId);
      const msg = { from: state.currentUserId, text: action.text, at: iso(new Date()) };
      return { ...state, threads: { ...state.threads, [k]: [...(state.threads[k] || []), msg] } };
    }

    case "addSessions":
      return { ...state, sessions: [...state.sessions, ...action.sessions] };

    case "joinSession": {
      // add the current user to an existing session as an acceptor (and as a learner if they are new)
      const me = state.currentUserId;
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          if (s.id !== action.id) return s;
          const learnerIds = s.teacherId === me || s.learnerIds.includes(me) ? s.learnerIds : [...s.learnerIds, me];
          const accepted = s.accepted.includes(me) ? s.accepted : [...s.accepted, me];
          return withStatus({ ...s, learnerIds, accepted });
        }),
      };
    }

    case "acceptSession":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id && !s.accepted.includes(state.currentUserId)
            ? withStatus({ ...s, accepted: [...s.accepted, state.currentUserId] })
            : s
        ),
      };

    case "demoAcceptAll":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? withStatus({ ...s, accepted: participantsOf(s) }) : s
        ),
      };

    case "setSlot":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id
            ? { ...s, slot: action.slot, date: iso(nextOccurrence(action.slot.day)), accepted: [state.currentUserId] , status: "pending" }
            : s
        ),
      };

    case "cancelSession":
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === action.id ? { ...s, status: "cancelled" } : s)),
      };

    case "completeSession": {
      const session = state.sessions.find((s) => s.id === action.id);
      if (!session || session.status !== "confirmed") return state;
      const delta = {};
      delta[session.teacherId] = { helped: session.learnerIds.length, asked: 0 };
      session.learnerIds.forEach((l) => (delta[l] = { helped: 0, asked: 1 }));
      const students = state.students.map((s) =>
        delta[s.id] ? { ...s, helped: s.helped + delta[s.id].helped, asked: s.asked + delta[s.id].asked } : s
      );
      const done = {
        ...session,
        status: "completed",
        completedAt: iso(new Date()),
        feedback: action.feedback,
        delta,
      };
      return {
        ...state,
        students,
        sessions: state.sessions.map((s) => (s.id === done.id ? done : s)),
        lastResult: done.id,
      };
    }

    case "reset":
      return initialState();

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore: demo still works in memory */
    }
  }, [state]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = useCallback((message) => setToast({ message, id: Date.now() }), []);

  const value = useMemo(() => {
    const byId = Object.fromEntries(state.students.map((s) => [s.id, s]));
    const me = byId[state.currentUserId];
    return { state, dispatch, byId, me, toast, notify };
  }, [state, toast, notify]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

/* ---------- session factories (used by the match screens) ---------- */

export function makePairSession({ teacherId, learnerId, skill, level, slot, requestedBy, location = "Online (Google Meet)" }) {
  return {
    id: uid(), kind: "pair", skill, level, teacherId, learnerIds: [learnerId],
    slot, date: iso(nextOccurrence(slot.day)), location,
    status: "pending", accepted: [requestedBy], requestedBy, feedback: [],
  };
}

export function makeGroupSession({ proposal, slot, teacherId, requestedBy, location = "Online (Google Meet)" }) {
  const learnerIds = proposal.learnerIds.filter((l) => l !== teacherId);
  const everyone = [teacherId, ...learnerIds];
  if (!everyone.includes(requestedBy)) learnerIds.push(requestedBy);
  return {
    id: uid(), kind: "group", groupId: proposal.id, skill: proposal.skill, level: proposal.level,
    teacherId, learnerIds, slot, date: iso(nextOccurrence(slot.day)), location,
    status: "pending", accepted: [requestedBy], requestedBy, feedback: [],
  };
}

export function makeChainSessions({ chain, requestedBy }) {
  const chainId = "chain-" + uid();
  return chain.edges.map((e, i) => ({
    id: uid(), kind: "chain", chainId, step: i + 1, steps: chain.edges.length,
    skill: e.skill, level: e.learnerLevel, teacherId: e.teacherId, learnerIds: [e.learnerId],
    slot: { day: e.overlap[0].day, start: e.overlap[0].start, end: e.overlap[0].end },
    date: iso(nextOccurrence(e.overlap[0].day)), location: "Online (Google Meet)",
    status: "pending", accepted: requestedBy === e.teacherId || requestedBy === e.learnerId ? [requestedBy] : [],
    requestedBy, feedback: [],
  }));
}
