// Demo data for the Tech Expo. All people are fictional.
// Days: Mon=0 ... Sun=6. Hours are 24h numbers.

export const SKILLS = [
  "Python", "Guitar", "Video Editing", "Excel", "Public Speaking", "Design",
  "Machine Learning", "Data Analysis", "Web Development", "Photography",
];

const at = (days, start, end) => days.map((day) => ({ day, start, end }));

export const STUDENTS = [
  {
    id: "ananya", name: "Ananya Singh", dept: "B.Tech CSE (AI)", year: 1,
    bio: "First-year CSE-AI student. Happy to explain Python; trying to finally learn guitar.",
    teach: [{ skill: "Python", level: "Advanced" }],
    learn: [{ skill: "Guitar", level: "Beginner" }],
    slots: [...at([0, 2, 4], 16, 19), ...at([3], 18, 20)],
    helped: 12, asked: 8,
  },
  {
    id: "rohan", name: "Rohan Mehta", dept: "B.Tech CSE", year: 2,
    bio: "Competitive programmer. Python and data work are my thing.",
    teach: [{ skill: "Python", level: "Advanced" }, { skill: "Data Analysis", level: "Intermediate" }],
    learn: [{ skill: "Guitar", level: "Beginner" }],
    slots: [...at([0, 2, 4], 16, 19), ...at([3], 17, 21)],
    helped: 15, asked: 6,
  },
  {
    id: "priya", name: "Priya Sharma", dept: "B.Com", year: 2,
    bio: "Spreadsheet nerd. I would love to edit videos for our club reels.",
    teach: [{ skill: "Python", level: "Intermediate" }, { skill: "Excel", level: "Advanced" }],
    learn: [{ skill: "Video Editing", level: "Beginner" }, { skill: "Public Speaking", level: "Intermediate" }],
    slots: [...at([1, 3], 14, 17), ...at([5], 14, 17)],
    helped: 8, asked: 10,
  },
  {
    id: "arjun", name: "Arjun Patel", dept: "B.Tech IT", year: 3,
    bio: "ML projects by day, trying to learn guitar by night.",
    teach: [{ skill: "Python", level: "Advanced" }, { skill: "Machine Learning", level: "Intermediate" }],
    learn: [{ skill: "Guitar", level: "Beginner" }, { skill: "Design", level: "Beginner" }],
    slots: [...at([0, 2], 10, 13), ...at([2], 17, 19)],
    helped: 20, asked: 4,
  },
  {
    id: "rahul", name: "Rahul Verma", dept: "BBA", year: 2,
    bio: "Play guitar in the college band. Want to cut better reels.",
    teach: [{ skill: "Guitar", level: "Intermediate" }],
    learn: [{ skill: "Video Editing", level: "Beginner" }],
    slots: [...at([0], 17, 20), ...at([2], 17, 19), ...at([5], 13, 17)],
    helped: 9, asked: 5,
  },
  {
    id: "meera", name: "Meera Kapoor", dept: "B.Des", year: 2,
    bio: "Edit film-club videos. Python looks scary; I would like to try.",
    teach: [{ skill: "Video Editing", level: "Intermediate" }],
    learn: [{ skill: "Python", level: "Beginner" }],
    slots: [...at([2], 16, 18), ...at([3], 18, 20), ...at([5], 14, 16)],
    helped: 11, asked: 7,
  },
  {
    id: "sneha", name: "Sneha Iyer", dept: "BA English", year: 3,
    bio: "Debate captain. Need Excel for my dissertation data.",
    teach: [{ skill: "Public Speaking", level: "Advanced" }, { skill: "Design", level: "Intermediate" }],
    learn: [{ skill: "Excel", level: "Beginner" }, { skill: "Video Editing", level: "Beginner" }],
    slots: [...at([1], 15, 18), ...at([3], 14, 16), ...at([5], 14, 18)],
    helped: 14, asked: 9,
  },
  {
    id: "dev", name: "Dev Malhotra", dept: "B.Tech ECE", year: 2,
    bio: "Web dev and photography. Learning ML and video editing.",
    teach: [{ skill: "Web Development", level: "Advanced" }, { skill: "Photography", level: "Intermediate" }],
    learn: [{ skill: "Video Editing", level: "Beginner" }, { skill: "Machine Learning", level: "Beginner" }],
    slots: [...at([5], 12, 16), ...at([6], 11, 14)],
    helped: 7, asked: 8,
  },
  {
    id: "kabir", name: "Kabir Joshi", dept: "B.Arch", year: 1,
    bio: "Design and photography. Want to automate boring things with Python.",
    teach: [{ skill: "Design", level: "Advanced" }, { skill: "Photography", level: "Advanced" }],
    learn: [{ skill: "Python", level: "Beginner" }, { skill: "Web Development", level: "Beginner" }],
    slots: [...at([0], 16, 18), ...at([2], 17, 19), ...at([3], 17, 20)],
    helped: 6, asked: 3,
  },
  {
    id: "isha", name: "Isha Nair", dept: "B.Sc Statistics", year: 1,
    bio: "Excel is my comfort zone. Python next.",
    teach: [{ skill: "Excel", level: "Intermediate" }],
    learn: [{ skill: "Python", level: "Beginner" }, { skill: "Public Speaking", level: "Beginner" }],
    slots: [...at([0], 17, 19), ...at([3], 18, 21)],
    helped: 4, asked: 6,
  },
  {
    id: "aditya", name: "Aditya Rao", dept: "M.Tech AI", year: 4,
    bio: "Teaching assistant for ML lab. Learning web dev for my portfolio.",
    teach: [{ skill: "Machine Learning", level: "Advanced" }, { skill: "Data Analysis", level: "Advanced" }],
    learn: [{ skill: "Web Development", level: "Beginner" }, { skill: "Public Speaking", level: "Beginner" }],
    slots: [...at([1, 3], 18, 21)],
    helped: 22, asked: 2,
  },
  {
    id: "nisha", name: "Nisha Gupta", dept: "B.Sc Physics", year: 2,
    bio: "Acoustic guitar since school. Numbers are not my strong side.",
    teach: [{ skill: "Guitar", level: "Advanced" }, { skill: "Photography", level: "Intermediate" }],
    learn: [{ skill: "Excel", level: "Beginner" }, { skill: "Data Analysis", level: "Beginner" }],
    slots: [...at([0, 2], 17, 19), ...at([4], 16, 18)],
    helped: 10, asked: 4,
  },
  {
    id: "zoya", name: "Zoya Khan", dept: "B.Des", year: 1,
    bio: "Illustration and UI design. Python is on my wishlist.",
    teach: [{ skill: "Design", level: "Intermediate" }],
    learn: [{ skill: "Python", level: "Beginner" }],
    slots: [...at([0], 16, 18), ...at([3], 18, 20)],
    helped: 3, asked: 2,
  },
  {
    id: "harsh", name: "Harsh Vardhan", dept: "B.Tech Mech", year: 3,
    bio: "CAD and Excel macros. Want to speak better in interviews.",
    teach: [{ skill: "Excel", level: "Advanced" }],
    learn: [{ skill: "Public Speaking", level: "Beginner" }],
    slots: [...at([1], 17, 19), ...at([4], 17, 19)],
    helped: 5, asked: 3,
  },
];

const day = (n) => new Date(Date.now() - n * 86400000).toISOString();

/** Past + upcoming sessions so the dashboard is not empty on first load. */
export function makeSeedSessions() {
  const soon = new Date();
  soon.setDate(soon.getDate() + ((7 - ((soon.getDay() + 6) % 7)) % 7 || 7)); // next Monday
  const soonIso = new Date(soon.getFullYear(), soon.getMonth(), soon.getDate()).toISOString();
  return [
    {
      id: "s-seed-1", kind: "group", skill: "Python", level: "Beginner",
      teacherId: "ananya", learnerIds: ["kabir", "isha", "zoya"],
      slot: { day: 3, start: 18, end: 20 }, date: day(2), location: "Online (Google Meet)",
      status: "completed", accepted: ["ananya", "kabir", "isha", "zoya"], completedAt: day(2),
      feedback: [
        { fromId: "kabir", toId: "ananya", rating: 5, comment: "Super clear explanations. Loops finally make sense!" },
        { fromId: "isha", toId: "ananya", rating: 5, comment: "Patient and organised. Learned a lot." },
      ],
    },
    {
      id: "s-seed-2", kind: "pair", skill: "Excel", level: "Beginner",
      teacherId: "priya", learnerIds: ["ananya"],
      slot: { day: 2, start: 16, end: 18 }, date: day(3), location: "Library, Study Room 2",
      status: "completed", accepted: ["priya", "ananya"], completedAt: day(3),
      feedback: [{ fromId: "ananya", toId: "priya", rating: 5, comment: "Pivot tables explained in 20 minutes. Thank you!" }],
    },
    {
      id: "s-seed-3", kind: "pair", skill: "Design", level: "Beginner",
      teacherId: "sneha", learnerIds: ["ananya"],
      slot: { day: 3, start: 18, end: 20 }, date: day(5), location: "Online (Google Meet)",
      status: "completed", accepted: ["sneha", "ananya"], completedAt: day(5),
      feedback: [{ fromId: "ananya", toId: "sneha", rating: 4, comment: "Great layout tips for my poster." }],
    },
    {
      id: "s-seed-4", kind: "pair", skill: "Python", level: "Beginner",
      teacherId: "ananya", learnerIds: ["kabir"],
      slot: { day: 0, start: 16, end: 18 }, date: soonIso, location: "Online (Google Meet)",
      status: "confirmed", accepted: ["ananya", "kabir"], feedback: [],
    },
    {
      id: "s-seed-5", kind: "pair", skill: "Python", level: "Beginner",
      teacherId: "ananya", learnerIds: ["isha"],
      slot: { day: 3, start: 18, end: 20 }, date: soonIso, location: "Online (Google Meet)",
      status: "pending", accepted: ["isha"], requestedBy: "isha", feedback: [],
    },
  ];
}

export const SEED_THREADS = {
  "ananya|rohan": [
    { from: "rohan", text: "Hey Ananya! Saw you teach Python. Could you look at my pandas script sometime?", at: day(1) },
    { from: "ananya", text: "Sure! Wednesday evening works for me.", at: day(1) },
  ],
  "ananya|meera": [
    { from: "meera", text: "Hi! I'm a total Python beginner. Is the Thursday group still on?", at: day(0) },
  ],
  "ananya|priya": [
    { from: "ananya", text: "Thanks again for the Excel session, Priya!", at: day(3) },
    { from: "priya", text: "Anytime. Asking is half the learning :)", at: day(3) },
  ],
};

export const LOCATIONS = ["Online (Google Meet)", "Library, Study Room 2", "Canteen Lawn", "Innovation Lab"];
