import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/chat";
import ChatWidget from "./ChatWidget";
import "../../AppStyles.css";

function getFromLabel(c) {
  if (!c) return "Wiadomość do obsługi";

  const u = c.ownerUserId; 
  if (!u) return c.title || "Wiadomość do obsługi";

  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
  if (fullName && u.username) return `${fullName} (${u.username})`;
  return fullName || u.username || "Wiadomość do obsługi";
}

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

  const fromLabel = conversation ? getFromLabel(conversation) : "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nav-button"
        title="Czat"
      >
        💬 Czat
      </button>

      {open && (
        <>
          <div className="chat-overlay" onClick={() => setOpen(false)} />

          <div
            className="chat-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Komunikator"
          >
            <div className="chat-header">
              <div>
                <div className="chat-title">Komunikator</div>
                <div className="chat-subtitle">
                  {role === "user"
                    ? "Rozmowa z obsługą zawodów"
                    : `Od: ${fromLabel}`}
                </div>
              </div>
              <button className="chat-close" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <div className={role === "user" ? "chat-body chat-body-single" : "chat-body"}>
              {role !== "user" && (
                <aside className="chat-sidebar">
                  {conversations.length === 0 && (
                    <div className="hint" style={{ padding: 12 }}>
                      Brak rozmów
                    </div>
                  )}

                  {conversations.map((c) => (
                    <div
                      key={c._id}
                      className={`chat-thread ${
                        conversation && c._id === conversation._id ? "active" : ""
                      }`}
                      onClick={() => setConversation(c)}
                    >
                      <span className="black">{getFromLabel(c)}</span>
                    </div>
                  ))}
                </aside>
              )}

              <div className="chat-main">
                {conversation ? (
                  <ChatWidget conversation={conversation} role={role} />
                ) : (
                  <div className="chat-empty">Wybierz rozmowę</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
