import { useEffect, useRef, useState } from "react";
import { ChatAPI } from "../../api/chat";

export default function ChatWidget({ conversation, role }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const list = await ChatAPI.listMessages(conversation._id);
      if (live) setMessages(list);
    })();
    return () => {
      live = false;
    };
  }, [conversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async () => {
    const v = text.trim();
    if (!v) return;
    const m = await ChatAPI.sendMessage(conversation._id, v);
    setMessages((prev) => [...prev, m]);
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          background: "#fcfcfc",
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {messages.map((m) => {
            const username = m?.sender?.username || "nieznany";
            const firstName = m?.sender?.firstName || m?.sender?.name || "";
            const lastName = m?.sender?.lastName || "";
            const fullName = [firstName, lastName].filter(Boolean).join(" ");
            const roleLabel = m?.sender?.role
              ? String(m.sender.role).toUpperCase()
              : "";
            const whoLabel =
              fullName && username
                ? `${fullName} (${username})`
                : fullName || username;

            return (
              <div
                key={m._id}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{
                    color: "#000000ff",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {whoLabel}
                    {roleLabel && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#000000ff",
                          marginLeft: 6,
                          padding: "2px 6px",
                          border: "1px solid #ddd",
                          borderRadius: 8,
                        }}
                      >
                        {roleLabel}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ color: "#000000ff", whiteSpace: "pre-wrap" }}>
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #eee",
          padding: 10,
          display: "flex",
          gap: 8,
        }}
      >
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Napisz wiadomość…"
          style={{
            flex: 1,
            resize: "none",
            border: "1px solid #000000ff",
            borderRadius: 10,
            padding: 10,
          }}
        />
        <button
          onClick={send}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}
