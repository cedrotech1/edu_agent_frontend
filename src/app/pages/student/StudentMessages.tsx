import { useState } from "react";
import {
  MessageSquare,
  Send,
  Search,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

interface Message {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  initials: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
  avatarBg: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 1, name: "Ms. Johnson", initials: "MJ", role: "Teacher",
    preview: "Focus on mitosis vs meiosis.", time: "5m", unread: 2, avatarBg: "#272757",
    messages: [
      { id: 1, sender: "them", text: "Hi Alex, just checking in on your biology quiz prep.", time: "Yesterday 9:00 AM" },
      { id: 2, sender: "me",   text: "I've been studying the cell division chapter. It's tough!", time: "Yesterday 9:12 AM" },
      { id: 3, sender: "them", text: "Focus on mitosis vs meiosis. That's usually on the exam.", time: "Yesterday 9:15 AM" },
    ],
  },
  {
    id: 2, name: "Mr. Smith", initials: "MS", role: "Teacher",
    preview: "Great work on last week's quiz!", time: "Yesterday", unread: 0, avatarBg: "#505081",
    messages: [
      { id: 1, sender: "them", text: "Great work on last week's quiz! Keep it up.", time: "Yesterday" },
    ],
  },
];

export function StudentMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");

  const active = activeId !== null ? conversations.find((c) => c.id === activeId) ?? null : null;

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(id: number) {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || activeId === null) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              preview: text,
              messages: [
                ...c.messages,
                { id: c.messages.length + 1, sender: "me", text, time: "Just now" },
              ],
            }
          : c
      )
    );
    setInputText("");
  }

  return (
    <AppShell role="student" pending={true} pageTitle="Messages">
      {/* Two-panel layout */}
      <div className="-mx-6 -mt-6 flex h-[calc(100vh-64px)]">

        {/* LEFT PANEL */}
        <div
          className="flex flex-col border-r bg-white"
          style={{ width: 300, flexShrink: 0, borderColor: "#E2E8F0" }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#E2E8F0" }}>
            <h2 className="text-base font-bold" style={{ color: "#0F0E47" }}>Messages</h2>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "#E2E8F0" }}>
              <Search size={14} style={{ color: "#8686AC" }} />
              <input
                className="flex-1 text-sm outline-none bg-transparent"
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ color: "#0F0E47" }}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: c.id === activeId ? "#EDE9FE" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (c.id !== activeId) (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  if (c.id !== activeId) (e.currentTarget as HTMLButtonElement).style.background = "";
                }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: c.avatarBg }}
                >
                  {c.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm truncate"
                      style={{
                        fontWeight: c.unread > 0 ? 600 : 400,
                        color: "#0F0E47",
                      }}
                    >
                      {c.name}
                    </span>
                    <span className="text-[10px] ml-1 flex-shrink-0" style={{ color: "#94A3B8" }}>{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs truncate" style={{ color: "#64748B" }}>{c.preview}</span>
                    {c.unread > 0 && (
                      <span className="w-2 h-2 rounded-full ml-1 flex-shrink-0" style={{ background: "#272757" }} />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {active === null ? (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center gap-3" style={{ background: "#F8FAFC" }}>
              <MessageSquare size={48} style={{ color: "#8686AC" }} />
              <p className="font-semibold text-base" style={{ color: "#0F0E47" }}>No messages yet.</p>
              <p className="text-sm" style={{ color: "#8686AC" }}>Your teacher can send you a message here.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-white border-b" style={{ borderColor: "#E2E8F0" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: active.avatarBg }}
                >
                  {active.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#0F0E47" }}>{active.name}</p>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "#EDE9FE", color: "#272757" }}
                  >
                    {active.role}
                  </span>
                </div>
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: "#F8FAFC" }}>
                {active.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <MessageSquare size={48} style={{ color: "#8686AC" }} />
                    <p className="font-semibold text-base" style={{ color: "#0F0E47" }}>No messages yet.</p>
                    <p className="text-sm" style={{ color: "#8686AC" }}>Your teacher can send you a message here.</p>
                  </div>
                ) : (
                  active.messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                      <div
                        className="px-4 py-2.5 max-w-[70%] text-sm leading-relaxed"
                        style={
                          msg.sender === "me"
                            ? {
                                background: "#272757",
                                color: "#fff",
                                borderRadius: "16px 16px 4px 16px",
                              }
                            : {
                                background: "#fff",
                                color: "#0F0E47",
                                border: "1px solid #E2E8F0",
                                borderRadius: "16px 16px 16px 4px",
                              }
                        }
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>{msg.time}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Input bar */}
              <div className="flex gap-2 px-4 py-3 bg-white border-t" style={{ borderColor: "#E2E8F0" }}>
                <input
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ borderColor: "#E2E8F0", color: "#0F0E47" }}
                  placeholder="Type a message…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  onFocus={(e) => (e.target.style.borderColor = "#272757")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
                <button
                  onClick={handleSend}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ background: "#272757" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1A1952")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#272757")}
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
