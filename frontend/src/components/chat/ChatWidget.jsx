import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/chat";
import ChatWidget from "./ChatWidget";
import "../AppStyles.css";
export default function ChatModal({ role = "user", initialStaffUsernames = [] }) {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      if (role === "user") {
        const conv = await ChatAPI.createOrGetConversation(initialStaffUsernames);
        setConversation(conv);
      } else {
        const list = await ChatAPI.listMyConversations();
        setConversations(list);
        setConversation(list[0] || null);
      }
    })();
  }, [open, role, initialStaffUsernames]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="nav-button" title="Czat">💬 Czat</button>

      {open && (
        <>
          <div className="chat-overlay" onClick={() => setOpen(false)} />
          <div className="chat-modal" role="dialog" aria-modal="true" aria-label="Komunikator">
            <div className="chat-header">
              <div>Komunikator</div>
              <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {role !== "user" && (
              <aside className="chat-sidebar">
                {conversations.length === 0 && (
                  <div className="hint" style={{ padding: 12 }}>Brak rozmów</div>
                )}
                {conversations.map(c => (
                  <div
                    key={c._id}
                    className={`chat-thread ${conversation && c._id === conversation._id ? "active" : ""}`}
                    onClick={() => setConversation(c)}
                    title={c.title}
                  >
                    <span className="black">{c.title || "Wiadomość do obsługi"}</span>
                    <small className="hint">#{c._id.slice(-6)}</small>
                  </div>
                ))}
              </aside>
            )}

            <div style={{ minWidth: 0 }}>
              {conversation ? (
                <ChatWidget conversation={conversation} role={role} />
              ) : (
                <div className="chat-main"><div className="chat-messages" /></div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
