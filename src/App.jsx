import { StoreProvider } from "./lib/store.jsx";
import { useRoute } from "./lib/router.js";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Discover from "./pages/Discover.jsx";
import Matches from "./pages/Matches.jsx";
import GroupProposal from "./pages/GroupProposal.jsx";
import Profile from "./pages/Profile.jsx";
import Messages from "./pages/Messages.jsx";
import Sessions from "./pages/Sessions.jsx";
import Feedback from "./pages/Feedback.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import About from "./pages/About.jsx";
import { useStore } from "./lib/store.jsx";

function Router() {
  const { parts, query } = useRoute();
  const { me } = useStore();
  const [page, arg] = parts;
  // `key` resets local page state when the person switches or the search changes
  const k = `${me.id}:${query.toString()}`;
  let view;
  switch (page) {
    case undefined: view = <Home />; break;
    case "discover": view = <Discover key={k} />; break;
    case "matches": view = <Matches />; break;
    case "group": view = <GroupProposal key={arg} id={arg} />; break;
    case "profile": view = <Profile key={me.id} />; break;
    case "messages": view = <Messages key={me.id} />; break;
    case "sessions": view = <Sessions />; break;
    case "feedback": view = <Feedback id={arg} />; break;
    case "leaderboard": view = <Leaderboard />; break;
    case "about": view = <About />; break;
    default: view = <Home />;
  }
  return <Layout parts={parts}>{view}</Layout>;
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
