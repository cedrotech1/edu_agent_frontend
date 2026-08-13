import { useState } from "react";
import {
  Plus,
  X,
  Search,
  Send,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

interface Message {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
  broadcast?: boolean;
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
    id: 1, name: "Alex Martinez", initials: "AM", role: "Student",
    preview: "Got it, thank you!", time: "5m", unread: 2, avatarBg: "#505081",
    messages: [
      { id: 1, sender: "me",   text: "Hi Alex, just checking in on your biology quiz prep.", time: "Yesterday 9:00 AM" },
      { id: 2, sender: "them", text: "I've been studying the cell division chapter. It's tough!", time: "Yesterday 9:12 AM" },
      { id: 3, sender: "me",   text: "Focus on mitosis vs meiosis. That's usually on the exam.", time: "Yesterday 9:15 AM" },
      { id: 4, sender: "them", text: "Got it, thank you!", time: "5m ago" },
    ],
  },
  {
    id: 2, name: "Sarah Uwera", initials: "SU", role: "Student",
    preview: "When is the deadline?", time: "1h", unread: 1, avatarBg: "#272757",
    messages: [
      { id: 1, sender: "them", text: "Ms. Johnson, when is the deadline for the chemistry quiz?", time: "1h ago" },
      { id: 2, sender: "me",   text: "It's this Friday at 11:59 PM.", time: "58m ago" },
      { id: 3, sender: "them", text: "When is the deadline?", time: "55m ago" },
    ],
  },
  {
    id: 3, name: "David Kagabo", initials: "DK", role: "Student",
    preview: "Understood!", time: "3h", unread: 0, avatarBg: "#8686AC",
    messages: [
      { id: 1, sender: "me",   text: "David, please make sure to submit your assignment before the deadline.", time: "3h ago" },
      { id: 2, sender: "them", text: "Understood!", time: "3h ago" },
    ],
  },
  {
    id: 4, name: "Grace Mutoni", initials: "GM", role: "Student",
    preview: "Thank you for the feedback.", time: "Yesterday", unread: 0, avatarBg: "#505081",
    messages: [
      { id: 1, sender: "me",   text: "Grace, great job on the last quiz! Your score improved a lot.", time: "Yesterday" },
      { id: 2, sender: "them", text: "Thank you for the feedback.", time: "Yesterday" },
    ],
  },
  {
    id: 5, name: "S3 Biology 2026", initials: "SB", role: "Class Broadcast",
    preview: "Reminder: Quiz tomorrow!", time: "2d", unread: 0, avatarBg: "#272757",
    messages: [
      { id: 1, sender: "me", text: "Reminder: Quiz tomorrow at 9AM. Please review chapters 4-6.", time: "2d ago", broadcast: true },
    ],
  },
];

const classes = ["All Classes", "S3 Biology 2026", "Mathematics A"];
const studentsByClass: Record<string, string[]> = {
  "All Classes": ["Alex Martinez", "Sarah Uwera", "David Kagabo", "Grace Mutoni"],
  "S3 Biology 2026": ["Alex Martinez", "Sarah Uwera"],
  "Mathematics A": ["David Kagabo", "Grace Mutoni"],
};

export function TeacherMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<number>(1);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [newMsgText, setNewMsgText] = useState("");

  const active = conversations.find((c) => c.id === activeId)!;

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
    if (!text) return;
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

  function handleNewMsgSend() {
    setNewMsgOpen(false);
    setSelectedClass("All Classes");
    setBroadcastMode(false);
    setSelectedRecipient("");
    setNewMsgText("");
  }

  const recipients = studentsByClass[selectedClass] ?? studentsByClass["All Classes"];

  return (
    <AppShell role="teacher" pending={true} pageTitle="Messages">
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
            <button
              onClick={() => setNewMsgOpen(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
              style={{ background: "#272757" }}
            >
              <Plus size={12} />
              New Message
            </button>
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
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: c.avatarBg }}
                >
                  {c.initials}
                </div>

                {/* Text */}
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
            {active.messages.map((msg) => (
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
            ))}
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
        </div>
      </div>

      {/* NEW MESSAGE MODAL */}
      {newMsgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,14,71,0.4)" }}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: "#0F0E47" }}>New Message</h3>
              <button
                onClick={() => setNewMsgOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-[#F8FAFC]"
              >
                <X size={18} style={{ color: "#8686AC" }} />
              </button>
            </div>

            {/* Class filter */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#505081" }}>Class</label>
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "#E2E8F0", color: "#0F0E47" }}
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedRecipient("");
                }}
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Broadcast checkbox */}
            <div className="mb-3 flex items-center gap-2">
              <input
                id="broadcast"
                type="checkbox"
                checked={broadcastMode}
                onChange={(e) => setBroadcastMode(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "#272757" }}
              />
              <label htmlFor="broadcast" className="text-sm" style={{ color: "#505081" }}>
                Send to entire class
              </label>
            </div>

            {/* Recipient */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#505081" }}>Recipient</label>
              {broadcastMode ? (
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "#EDE9FE", color: "#272757" }}
                >
                  {selectedClass === "All Classes" ? "All Students" : selectedClass}
                </div>
              ) : (
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "#E2E8F0", color: "#0F0E47" }}
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                >
                  <option value="">Select a student…</option>
                  {recipients.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Message */}
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#505081" }}>Message</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                style={{ borderColor: "#E2E8F0", color: "#0F0E47" }}
                placeholder="Type your message…"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNewMsgOpen(false)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#F8FAFC]"
                style={{ borderColor: "#E2E8F0", color: "#505081" }}
              >
                Cancel
              </button>
              <button
                onClick={handleNewMsgSend}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors"
                style={{ background: "#272757" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1A1952")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#272757")}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
