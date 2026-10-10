import { useEffect, useRef, useState } from "react";
import { Avatar, Icon, Empty } from "../components/ui.jsx";
import RequestModal from "../components/RequestModal.jsx";
import { useStore, threadKey } from "../lib/store.jsx";
import { useRoute, navigate } from "../lib/router.js";

const when = (iso) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function Messages() {
  const { query } = useRoute();
  const { state, me, byId, dispatch } = useStore();
  const [text, setText] = useState("");
  const [ask, setAsk] = useState(false);
  const endRef = useRef(null);

  const partnerIds = Object.keys(state.threads)
    .filter((k) => k.split("|").includes(me.id))
    .map((k) => k.split("|").find((x) => x !== me.id));
  const withId = query.get("with");
  const contacts = withId && byId[withId] && withId !== me.id && !partnerIds.includes(withId) ? [withId, ...partnerIds] : partnerIds;
  const active = withId && byId[withId] ? withId : contacts[0];
  const thread = active ? state.threads[threadKey(me.id, active)] || [] : [];

  useEffect(() => { endRef.current?.scrollIntoView?.({ block: "end" }); }, [thread.length, active]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    dispatch({ type: "sendMessage", toId: active, text: text.trim() });
    setText("");
  };

  if (!active) {
    return (
      <div className="page"><h1>Messages</h1>
        <Empty icon="message" title="No conversations yet" action={<button className="btn primary" onClick={() => navigate("/discover")}>Find someone to message</button>}>
          Asking is easy: find a person in Discover and say hello.
        </Empty>
      </div>
    );
  }
  const partner = byId[active];
  const last = (id) => { const t = state.threads[threadKey(me.id, id)] || []; return t[t.length - 1]; };

  return (
    <div className="page">
      <h1>Messages</h1>
      <div className="chat card">
        <aside className="chat-list" aria-label="Conversations">
          {contacts.map((id) => (
            <button key={id} className={`chat-item ${id === active ? "on" : ""}`} onClick={() => navigate(`/messages?with=${id}`)}>
              <Avatar person={byId[id]} size={38} />
              <span><b>{byId[id].name}</b><small className="muted clip">{last(id)?.text || "Say hello"}</small></span>
            </button>
          ))}
        </aside>
        <section className="chat-pane">
          <header className="chat-head">
            <Avatar person={partner} size={38} /><b>{partner.name}</b>
            <button className="btn outline sm push" onClick={() => setAsk(true)}>Propose a session</button>
          </header>
          <div className="chat-body" aria-live="polite">
            {thread.length === 0 && <p className="muted small center">No messages yet. Say what you'd like help with.</p>}
            {thread.map((m, i) => (
              <div key={i} className={`bubble ${m.from === me.id ? "mine" : ""}`}>{m.text}<small>{when(m.at)}</small></div>
            ))}
            <div ref={endRef} />
          </div>
          <form className="chat-input" onSubmit={send}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${partner.name.split(" ")[0]}`} aria-label="Message" />
            <button className="btn primary" type="submit" aria-label="Send"><Icon name="send" size={16} /></button>
          </form>
          <p className="small muted note-demo">Demo: messages are stored on this device only. Other people can't reply automatically. Use “viewing as” to answer as them.</p>
        </section>
      </div>
      {ask && <RequestModal teacher={partner} onClose={() => setAsk(false)} />}
    </div>
  );
}
