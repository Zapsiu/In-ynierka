import { useEffect, useState } from 'react';
import { ChatAPI } from '../../api/chat';

function ChatWidget({ conversation, role }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      const list = await ChatAPI.listMessages(conversation._id);
      if (live) setMessages(list);
    })();
    return () => { live = false; };
  }, [conversation]);

  const send = async () => {
    const v = text.trim(); if (!v) return;
    const m = await ChatAPI.sendMessage(conversation._id, v);
    setMessages(prev => [...prev, m]); 
    setText('');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:10, borderBottom:'1px solid #eee', display:'flex', gap:8, alignItems:'center' }}>
        <strong>{conversation.title || 'Rozmowa'}</strong>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:12, background:'#fcfcfc' }}>
        <div style={{ display:'grid', gap:10 }}>
          {messages.map(m => {
            const name = m?.sender?.username || 'nieznany';
            const roleLabel = m?.sender?.role ? String(m.sender.role).toUpperCase() : '';
            return (
              <div key={m._id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:10 }}>
                <div style={{ color:'#000000ff', display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <div style={{ fontWeight:600 }}>
                    {name}
                    {roleLabel && (
                      <span style={{ fontSize:11, color:'#000000ff', marginLeft:6, padding:'2px 6px',
                                     border:'1px solid #ddd', borderRadius:8 }}>
                        {roleLabel}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:'#777' }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{color:'#000000ff', whiteSpace:'pre-wrap' }}>{m.body}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop:'1px solid #eee', padding:10, display:'flex', gap:8 }}>
        <textarea
          rows={2}
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }}
          placeholder="Napisz wiadomość…"
          style={{ flex:1, resize:'none', border:'1px solid #000000ff', borderRadius:10, padding:10 }}
        />
        <button onClick={send} style={{ padding:'8px 16px', borderRadius:10, border:'1px solid #ddd' }}>
          Wyślij
        </button>
      </div>
    </div>
  );
}

export default function ChatModal({ role = 'user', initialStaffUsernames = [] }) {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      if (role === 'user') {
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
        <div role="dialog" aria-modal="true"
             onClick={(e)=>{ if(e.target===e.currentTarget) setOpen(false); }}
             style={{ position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,.35)', zIndex:9999 }}>
          <div style={{ width:'min(100%, 920px)', height:'min(90vh, 720px)', background:'#fff', borderRadius:16, overflow:'hidden', display:'grid', gridTemplateRows:'auto 1fr' }}>
            <div style={{ padding:12,color:'#000000ff', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between' }}>
              <strong>Komunikator</strong>
              <button onClick={()=>setOpen(false)} style={{ border:'none', background:'transparent', fontSize:18, cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns: role==='user' ? '1fr' : '280px 1fr', minHeight:0 }}>
              {role !== 'user' && (
                <div style={{ color:'#000000ff',borderRight:'1px solid #eee', padding:8, overflowY:'auto' }}>
                  <h4>Rozmowy</h4>
                  {conversations.map(c => (
                    <div key={c._id} onClick={()=>setConversation(c)}
                         style={{ padding:8, marginBottom:6, cursor:'pointer', borderRadius:8, background: conversation && c._id===conversation._id ? '#f4f4f4' : 'transparent' }}>
                      {c.title} <small style={{ color:'#000000ff' }}>#{c._id.slice(-6)}</small>
                    </div>
                  ))}
                  {!conversations.length && <div style={{ color:'#000000ff' }}>Brak rozmów</div>}
                </div>
              )}

              <div style={{ minWidth:0 }}>
                {conversation
                  ? <ChatWidget conversation={conversation} role={role} />
                  : <div style={{ padding:16 }}>Ładowanie…</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
