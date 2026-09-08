import { useCallback, useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError, initials } from "@/lib/api";

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

function mapConv(c: any): Conversation {
  return {
    id: c.id,
    name: c.name || "User",
    initials: c.initials || initials(c.name),
    role: c.role || "User",
    preview: c.preview || "",
    time: c.time || "",
    unread: Number(c.unread ?? 0),
    avatarBg: c.avatarBg || "#505081",
    messages: [],
  };
}

export function StudentMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.messages.list();
      const rows = (res.data as any[]) || [];
      setConversations((Array.isArray(rows) ? rows : []).map(mapConv));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load messages");
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadThread = useCallback(async (id: number) => {
    setLoadingThread(true);
    try {
      const res = await api.messages.get(id);
      const d: any = res.data || {};
      const msgs = (d.messages || []).map((m: any) => ({
        id: m.id,
        sender: m.sender === "me" ? "me" : "them",
        text: m.text || m.body || "",
        time: m.time || "",
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, messages: msgs, unread: 0 } : c
        )
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load conversation");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  async function handleSelect(id: number) {
    setActiveId(id);
    await loadThread(id);
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || activeId === null || sending) return;
    setSending(true);
    try {
      await api.messages.send(activeId, text);
      setInputText("");
      await loadThread(activeId);
      await loadList();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  const active = activeId !== null ? conversations.find((c) => c.id === activeId) ?? null : null;

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="student" pageTitle="Messages">
      <div className="-mx-6 -mt-6 flex h-[calc(100vh-64px)]">
        <div
          className="flex flex-col border-r bg-white"
          style={{ width: 300, flexShrink: 0, borderColor: "#E2E8F0" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#E2E8F0" }}>
            <h2 className="text-base font-bold" style={{ color: "#0F0E47" }}>Messages</h2>
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
          {active === null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3" style={{ background: "#F8FAFC" }}>
              <MessageSquare size={48} style={{ color: "#8686AC" }} />
              <p className="font-semibold text-base" style={{ color: "#0F0E47" }}>No messages yet.</p>
              <p className="text-sm" style={{ color: "#8686AC" }}>Your teacher can send you a message here.</p>
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
                    <Loader2 size={16} className="animate-spin" /> Loading messages…
                  </div>
                ) : active.messages.length === 0 ? (
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
