// SkillSwap matching engine — pure functions, no React, fully unit-tested.
// Match score = skill overlap x schedule overlap x level fit  (from the project deck)

export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const LEVEL_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3 };
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MIN_SESSION_HOURS = 1;
export const GROUP_MIN_LEARNERS = 3;
export const MAX_CHAIN_LENGTH = 4;

/* ---------- time helpers ---------- */

export function fmtHour(h) {
  const hh = Math.floor(h);
  const suffix = hh >= 12 && hh < 24 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:00 ${suffix}`;
}
export const fmtRange = (s) => `${fmtHour(s.start)} - ${fmtHour(s.end)}`;
export const fmtSlot = (s) => `${DAYS[s.day]}, ${fmtRange(s)}`;

/** "Mon, Wed, Fri 4:00 PM - 7:00 PM; Sat 11:00 AM - 2:00 PM" */
export function summarizeSlots(slots) {
  if (!slots || slots.length === 0) return "No free time added";
  const byTime = new Map();
  for (const s of [...slots].sort((a, b) => a.start - b.start || a.day - b.day)) {
    const key = `${s.start}-${s.end}`;
    if (!byTime.has(key)) byTime.set(key, { days: [], slot: s });
    byTime.get(key).days.push(s.day);
  }
  return [...byTime.values()]
    .map((g) => `${g.days.sort((a, b) => a - b).map((d) => DAYS[d]).join(", ")} ${fmtRange(g.slot)}`)
    .join("; ");
}

/** Next calendar date (after today) that falls on `day` (Mon=0). */
export function nextOccurrence(day, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const todayIdx = (d.getDay() + 6) % 7;
  let diff = (day - todayIdx + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  return d;
}
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

/* ---------- schedule overlap ---------- */

/** All windows (>= minHours) where two availability lists overlap. */
export function overlapSlots(a, b, minHours = MIN_SESSION_HOURS) {
  const out = [];
  for (const x of a) {
    for (const y of b) {
      if (x.day !== y.day) continue;
      const start = Math.max(x.start, y.start);
      const end = Math.min(x.end, y.end);
      if (end - start >= minHours) out.push({ day: x.day, start, end });
    }
  }
  return out.sort((p, q) => q.end - q.start - (p.end - p.start) || p.day - q.day || p.start - q.start);
}

/* ---------- pairwise scoring ---------- */

export function levelFit(teacherLevel, learnerLevel) {
  const diff = LEVEL_RANK[teacherLevel] - LEVEL_RANK[learnerLevel];
  if (diff >= 1) return 1; // teacher is clearly ahead
  if (diff === 0) return 0.7; // peers
  return 0.3; // teacher is behind the learner
}

/** Longest shared window of 2h or more scores 1, a 1h window scores 0.5. */
export function scheduleScore(overlaps) {
  if (!overlaps.length) return 0;
  const best = overlaps[0];
  return Math.min(1, (best.end - best.start) / 2);
}

const first = (n) => n.split(" ")[0];

/**
 * How well can `teacher` teach `learner`?  Returns null when there is no skill
 * match or no shared free time.
 */
export function directionScore(learner, teacher) {
  if (!learner.learn.length) return null;
  const matches = [];
  for (const want of learner.learn) {
    const has = teacher.teach.find((t) => t.skill === want.skill);
    if (has) matches.push({ skill: want.skill, learnerLevel: want.level, teacherLevel: has.level });
  }
  if (!matches.length) return null;
  const overlap = overlapSlots(learner.slots, teacher.slots);
  if (!overlap.length) return null;

  const skillOverlap = matches.length / learner.learn.length;
  const sched = scheduleScore(overlap);
  const best = matches
    .map((m) => ({ ...m, fit: levelFit(m.teacherLevel, m.learnerLevel) }))
    .sort((a, b) => b.fit - a.fit)[0];
  const score = skillOverlap * sched * best.fit;
  return {
    learnerId: learner.id,
    teacherId: teacher.id,
    skill: best.skill,
    learnerLevel: best.learnerLevel,
    teacherLevel: best.teacherLevel,
    skillOverlap,
    scheduleScore: sched,
    levelFit: best.fit,
    score,
    overlap,
    reasons: [
      `${first(teacher.name)} teaches ${best.skill} (${best.teacherLevel}); ${first(learner.name)} wants ${best.skill} (${best.learnerLevel}).`,
      `Free time in common: ${overlap.slice(0, 2).map(fmtSlot).join(" and ")}.`,
      best.fit === 1
        ? "Teacher is at a higher level than the learner."
        : best.fit === 0.7
        ? "Teacher and learner are at the same level (peer learning)."
        : "Teacher's level is below the learner's goal, so the score is reduced.",
    ],
  };
}

/* ---------- direct matches ---------- */

export function directMatches(userId, students) {
  const user = students.find((s) => s.id === userId);
  if (!user) return [];
  const out = [];
  for (const other of students) {
    if (other.id === userId) continue;
    const forward = directionScore(user, other); // user learns from other
    const backward = directionScore(other, user); // other learns from user
    if (forward && backward) {
      out.push({
        id: `direct-${userId}-${other.id}`,
        kind: "direct",
        partnerId: other.id,
        forward,
        backward,
        score: (forward.score + backward.score) / 2,
      });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

/** One-way helpers: people who teach something the user wants (no return favour). */
export function helpersFor(userId, students) {
  const user = students.find((s) => s.id === userId);
  if (!user) return [];
  return students
    .filter((s) => s.id !== userId)
    .map((s) => directionScore(user, s))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

/* ---------- chain swaps: genuine directed-cycle detection ---------- */

/** Edge L -> T means "L can learn something from T" (with a shared free slot). */
export function buildLearningGraph(students) {
  const graph = new Map(students.map((s) => [s.id, []]));
  for (const learner of students) {
    for (const teacher of students) {
      if (learner.id === teacher.id) continue;
      const d = directionScore(learner, teacher);
      if (d) graph.get(learner.id).push({ to: teacher.id, detail: d });
    }
  }
  return graph;
}

/**
 * Enumerate every simple directed cycle of length 3..maxLen using DFS.
 * Each cycle is found exactly once: a cycle is only accepted from its
 * lowest-index node, so rotations are never duplicated.
 */
export function findCycles(graph, order, maxLen = MAX_CHAIN_LENGTH) {
  const index = new Map(order.map((id, i) => [id, i]));
  const cycles = [];
  for (const start of order) {
    const path = [start];
    const visit = (node) => {
      for (const edge of graph.get(node) || []) {
        const next = edge.to;
        if (next === start) {
          if (path.length >= 3) cycles.push([...path]);
        } else if (index.get(next) > index.get(start) && !path.includes(next) && path.length < maxLen) {
          path.push(next);
          visit(next);
          path.pop();
        }
      }
    };
    visit(start);
  }
  return cycles;
}

export function chainSwaps(userId, students, maxLen = MAX_CHAIN_LENGTH) {
  const graph = buildLearningGraph(students);
  const order = students.map((s) => s.id);
  const cycles = findCycles(graph, order, maxLen).filter((c) => c.includes(userId));
  return cycles
    .map((cycle) => {
      const k = cycle.indexOf(userId);
      const rotated = [...cycle.slice(k), ...cycle.slice(0, k)];
      const edges = rotated.map((id, i) => {
        const toId = rotated[(i + 1) % rotated.length];
        return graph.get(id).find((e) => e.to === toId).detail;
      });
      return {
        id: `chain-${rotated.join("-")}`,
        kind: "chain",
        members: rotated,
        edges,
        score: edges.reduce((sum, e) => sum + e.score, 0) / edges.length,
      };
    })
    .sort((a, b) => a.members.length - b.members.length || b.score - a.score);
}

/* ---------- group sessions ---------- */

function covers(slots, day, start, end) {
  return slots.some((s) => s.day === day && s.start <= start && s.end >= end);
}

/**
 * Pools demand: when >= 3 students want the same skill at the same level and a
 * teacher shares a window with at least 3 of them, propose a group session.
 */
export function groupProposals(students, minLearners = GROUP_MIN_LEARNERS) {
  const buckets = new Map();
  for (const s of students) {
    for (const w of s.learn) {
      const key = `${w.skill}|${w.level}`;
      if (!buckets.has(key)) buckets.set(key, { skill: w.skill, level: w.level, learners: [] });
      buckets.get(key).learners.push(s);
    }
  }
  const proposals = [];
  for (const { skill, level, learners } of buckets.values()) {
    if (learners.length < minLearners) continue;
    const candidates = [];
    for (const teacher of students) {
      const has = teacher.teach.find((t) => t.skill === skill);
      if (!has || LEVEL_RANK[has.level] < LEVEL_RANK[level]) continue;
      const pool = learners.filter((l) => l.id !== teacher.id);
      if (pool.length < minLearners) continue;
      let best = null;
      for (const duration of [2, 1]) {
        for (const slot of teacher.slots) {
          for (let start = slot.start; start + duration <= slot.end; start++) {
            const available = pool.filter((l) => covers(l.slots, slot.day, start, start + duration));
            if (available.length >= minLearners && (!best || available.length > best.available.length)) {
              best = { day: slot.day, start, end: start + duration, available };
            }
          }
        }
        if (best) break;
      }
      if (best) candidates.push({ teacher, teacherLevel: has.level, window: best });
    }
    if (!candidates.length) continue;
    candidates.sort(
      (a, b) =>
        b.window.available.length - a.window.available.length ||
        LEVEL_RANK[b.teacherLevel] - LEVEL_RANK[a.teacherLevel] ||
        b.teacher.helped - a.teacher.helped
    );
    const top = candidates[0];
    proposals.push({
      id: `group-${skill.replace(/\s+/g, "-").toLowerCase()}-${level.toLowerCase()}`,
      kind: "group",
      skill,
      level,
      teacherId: top.teacher.id,
      teacherLevel: top.teacherLevel,
      learnerIds: top.window.available.map((l) => l.id),
      demand: learners.map((l) => l.id),
      slot: { day: top.window.day, start: top.window.start, end: top.window.end },
      alternatives: candidates.slice(1).map((c) => ({
        teacherId: c.teacher.id,
        teacherLevel: c.teacherLevel,
        slot: { day: c.window.day, start: c.window.start, end: c.window.end },
        learnerCount: c.window.available.length,
      })),
    });
  }
  return proposals.sort((a, b) => b.learnerIds.length - a.learnerIds.length);
}

/** Free windows where the teacher and every given learner are all available. */
export function commonWindows(teacher, learners) {
  let acc = teacher.slots.map((s) => ({ ...s }));
  for (const l of learners) acc = overlapSlots(acc, l.slots);
  return acc;
}

/* ---------- Give & Ask score ---------- */

export const POINTS_PER_HELP = 10;
export const POINTS_PER_ASK = 5;
export const BADGES = [
  { name: "Newcomer", min: 0 },
  { name: "Contributor", min: 100 },
  { name: "Mentor", min: 250 },
  { name: "Campus Guide", min: 500 },
];

export function giveAskPoints(student) {
  return student.helped * POINTS_PER_HELP + student.asked * POINTS_PER_ASK;
}
export function badgeFor(points) {
  let idx = 0;
  BADGES.forEach((b, i) => {
    if (points >= b.min) idx = i;
  });
  const cur = BADGES[idx];
  const next = BADGES[idx + 1];
  return {
    name: cur.name,
    next: next ? next.name : null,
    progress: next ? (points - cur.min) / (next.min - cur.min) : 1,
    toNext: next ? next.min - points : 0,
  };
}
