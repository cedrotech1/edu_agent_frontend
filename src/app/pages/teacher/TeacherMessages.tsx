import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  X,
  Search,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError, initials } from "@/lib/api";

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

interface ClassOpt {
  id: number;
  name: string;
}

interface StudentOpt {
  id: number;
  name: string;
}

function mapConv(c: any): Conversation {
  return {
    id: c.id,
    name: c.name || "User",
    initials: c.initials || initials(c.name),
    role: c.role || "Student",
    preview: c.preview || "",
    time: c.time || "",
    unread: Number(c.unread ?? 0),
    avatarBg: c.avatarBg || "#505081",
    messages: [],
  };
}

export function TeacherMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [classes, setClasses] = useState<ClassOpt[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [recipients, setRecipients] = useState<StudentOpt[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | "">("");
  const [newMsgText, setNewMsgText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  const loadThread = useCallback(async (id: number) => {
    setLoadingThread(true);
    try {
      const res = await api.messages.get(id);
      const d: any = res.data || {};
      const msgs = (d.messages || []).map((m: any) => ({
        id: m.id,
        sender: (m.sender === "me" ? "me" : "them") as "me" | "them",
        text: m.text || m.body || "",
        time: m.time || "",
        broadcast: Boolean(m.broadcast),
      }));
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, messages: msgs, unread: 0 } : c))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load conversation");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.messages.list();
      const rows = (res.data as any[]) || [];
      const mapped = (Array.isArray(rows) ? rows : []).map(mapConv);
      setConversations(mapped);
      return mapped;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load messages");
      setConversations([]);
      return [] as Conversation[];
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const mapped = await loadList();
      if (mapped.length) {
        setActiveId(mapped[0].id);
        await loadThread(mapped[0].id);
      }
      try {
        const res = await api.classes.list();
        const list = ((res.data as any[]) || []).map((c: any) => ({
          id: c.id,
          name: c.name || "Class",
        }));
        setClasses(list);
        if (list.length) setSelectedClassId(list[0].id);
      } catch {
        /* optional for modal */
      }
    })();
  }, [loadList, loadThread]);

  useEffect(() => {
    if (!selectedClassId) {
      setRecipients([]);
      return;
    }
    (async () => {
      try {
        const res = await api.classes.get(selectedClassId);
        const d: any = res.data || {};
        const students = (d.students || []).map((s: any) => ({
          id: s.id,
          name: s.name || s.names || "Student",
        }));
        setRecipients(students);
      } catch {
        setRecipients([]);
      }
    })();
  }, [selectedClassId]);

  async function handleSelect(id: number) {
    setActiveId(id);
    await loadThread(id);
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || activeId == null || sending) return;
    setSending(true);
    try {
      await api.messages.send(activeId, text);
      setInputText("");
      await loadThread(activeId);
      const res = await api.messages.list();
      const rows = (res.data as any[]) || [];
      setConversations((prev) => {
        const mapped = (Array.isArray(rows) ? rows : []).map(mapConv);
        return mapped.map((c) => {
          const prevC = prev.find((p) => p.id === c.id);
          return prevC && c.id === activeId ? { ...c, messages: prevC.messages } : c;
        });
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleNewMsgSend() {
    const text = newMsgText.trim();
    if (!text) {
      toast.error("Enter a message");
      return;
    }
    setSending(true);
    try {
      if (broadcastMode) {
        if (!selectedClassId) {
          toast.error("Select a class");
          return;
        }
        await api.messages.broadcast(Number(selectedClassId), text);
        toast.success("Broadcast sent");
      } else {
        if (!selectedRecipientId) {
          toast.error("Select a student");
          return;
        }
        const res = await api.messages.start(Number(selectedRecipientId), text);
        const conv = (res.data as any) || {};
        if (conv.id) setActiveId(conv.id);
        toast.success("Message sent");
      }
      setNewMsgOpen(false);
      setBroadcastMode(false);
      setSelectedRecipientId("");
      setNewMsgText("");
      await loadList();
      if (activeId) await loadThread(activeId);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const active = activeId != null ? conversations.find((c) => c.id === activeId) : null;
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedClassName = classes.find((c) => c.id === selectedClassId)?.name || "Class";

  return (
    <AppShell role="teacher" pageTitle="Messages">
      <div className="-mx-6 -mt-6 flex h-[calc(100vh-64px)]">
        <div
          className="flex flex-col border-r bg-white"
          style={{ width: 300, flexShrink: 0, borderColor: "#E2E8F0" }}
        >
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

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center py-10 text-[#8686AC] gap-2 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-xs text-[#8686AC] py-8 px-4">No conversations yet.</p>
            ) : (
              filtered.map((c) => (
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
              ))
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3" style={{ background: "#F8FAFC" }}>
              <MessageSquare size={48} style={{ color: "#8686AC" }} />
              <p className="font-semibold text-base" style={{ color: "#0F0E47" }}>Select a conversation</p>
              <p className="text-sm" style={{ color: "#8686AC" }}>Or start a new message to a student.</p>
            </div>
          ) : (
            <>
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

              <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: "#F8FAFC" }}>
                {loadingThread ? (
                  <div className="flex items-center justify-center h-full gap-2 text-[#8686AC] text-sm">
                    <Loader2 size={16} className="animate-spin" /> Loading…
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
                  disabled={sending}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ background: "#272757" }}
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

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

            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#505081" }}>Class</label>
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "#E2E8F0", color: "#0F0E47" }}
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value ? Number(e.target.value) : "");
                  setSelectedRecipientId("");
                }}
              >
                {classes.length === 0 && <option value="">No classes</option>}
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

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

            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#505081" }}>Recipient</label>
              {broadcastMode ? (
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "#EDE9FE", color: "#272757" }}
                >
                  {selectedClassName}
                </div>
              ) : (
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "#E2E8F0", color: "#0F0E47" }}
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select a student…</option>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
            </div>

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
                disabled={sending}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ background: "#272757" }}
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
