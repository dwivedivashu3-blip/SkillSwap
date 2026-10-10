import test from "node:test";
import assert from "node:assert/strict";
import { STUDENTS } from "../src/data/seed.js";
import {
  directMatches, chainSwaps, groupProposals, findCycles, overlapSlots,
  summarizeSlots, levelFit, badgeFor, nextOccurrence, directionScore,
} from "../src/lib/matching.js";

const get = (id) => STUDENTS.find((s) => s.id === id);

test("overlapSlots finds shared windows and ignores <1h", () => {
  const a = [{ day: 0, start: 16, end: 19 }];
  assert.deepEqual(overlapSlots(a, [{ day: 0, start: 17, end: 20 }]), [{ day: 0, start: 17, end: 19 }]);
  assert.equal(overlapSlots(a, [{ day: 0, start: 18.5, end: 20 }]).length, 0);
  assert.equal(overlapSlots(a, [{ day: 1, start: 16, end: 19 }]).length, 0);
});

test("levelFit rewards a teacher who is ahead", () => {
  assert.equal(levelFit("Advanced", "Beginner"), 1);
  assert.equal(levelFit("Beginner", "Beginner"), 0.7);
  assert.equal(levelFit("Beginner", "Advanced"), 0.3);
});

test("score is skill x schedule x level fit", () => {
  const d = directionScore(get("ananya"), get("rahul"));
  assert.equal(d.skill, "Guitar");
  assert.equal(d.skillOverlap, 1);
  assert.equal(d.scheduleScore, 1);
  assert.equal(d.levelFit, 1);
  assert.equal(d.score, 1);
});

test("Ananya has NO direct match but has chain swaps (deck slide 5)", () => {
  assert.equal(directMatches("ananya", STUDENTS).length, 0);
  const chains = chainSwaps("ananya", STUDENTS);
  assert.ok(chains.length >= 1);
  const rahulChain = chains.find((c) => c.members.join() === "ananya,rahul,meera");
  assert.ok(rahulChain, "Ananya -> Rahul -> Meera cycle must be detected");
  // every edge in the cycle is a real learn-from relationship
  assert.deepEqual(rahulChain.edges.map((e) => e.skill), ["Guitar", "Video Editing", "Python"]);
});

test("every detected cycle is a closed loop of valid edges, with no duplicates", () => {
  const ids = new Set();
  for (const s of STUDENTS) {
    for (const c of chainSwaps(s.id, STUDENTS)) {
      c.edges.forEach((e, i) => {
        assert.equal(e.learnerId, c.members[i]);
        assert.equal(e.teacherId, c.members[(i + 1) % c.members.length]);
      });
      assert.equal(new Set(c.members).size, c.members.length);
      assert.ok(c.members.length >= 3);
    }
  }
  const all = findCycles(
    new Map(STUDENTS.map((s) => [s.id, []])), STUDENTS.map((s) => s.id)
  );
  assert.deepEqual(all, []);
});

test("findCycles on a hand-built graph finds exactly the triangle", () => {
  const g = new Map([["a", [{ to: "b" }]], ["b", [{ to: "c" }]], ["c", [{ to: "a" }]], ["d", [{ to: "a" }]]]);
  assert.deepEqual(findCycles(g, ["a", "b", "c", "d"]), [["a", "b", "c"]]);
});

test("direct matches are two-way: Priya <-> Sneha, Arjun <-> Kabir", () => {
  assert.ok(directMatches("priya", STUDENTS).some((m) => m.partnerId === "sneha"));
  assert.ok(directMatches("arjun", STUDENTS).some((m) => m.partnerId === "kabir"));
});

test("group sessions need 3+ learners and a shared window with a teacher", () => {
  const groups = groupProposals(STUDENTS);
  const ve = groups.find((g) => g.skill === "Video Editing");
  assert.equal(ve.teacherId, "meera");
  assert.ok(ve.learnerIds.length >= 3);
  assert.deepEqual(ve.slot, { day: 5, start: 14, end: 16 }); // Sat 2-4 PM
  for (const g of groups) assert.ok(g.learnerIds.length >= 3);
  assert.equal(groupProposals(STUDENTS.slice(0, 2)).length, 0);
});

test("summarizeSlots groups days with identical times", () => {
  assert.equal(summarizeSlots([{ day: 0, start: 16, end: 19 }, { day: 2, start: 16, end: 19 }]), "Mon, Wed 4:00 PM - 7:00 PM");
});

test("nextOccurrence is always in the future and on the right weekday", () => {
  const from = new Date(2026, 9, 10); // Sat 10 Oct 2026
  const d = nextOccurrence(5, from);
  assert.equal((d.getDay() + 6) % 7, 5);
  assert.ok(d > from);
  assert.equal(d.getDate(), 17);
});

test("badges", () => {
  assert.equal(badgeFor(160).name, "Contributor");
  assert.equal(badgeFor(0).name, "Newcomer");
});
