import { useState } from "react";
import {
  MessageSquare,
  Search,
  Flag,
  X,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

interface ConversationRow {
  id: number;
  teacher: string;
  student: string;
  class: string;
  last: string;
  count: number;
  flagged: boolean;
}

interface ThreadMessage {
  sender: "teacher" | "student";
  text: string;
  time: string;
}

const mockThread: ThreadMessage[] = [
  { sender: "teacher", text: "Please make sure to submit your assignment before the deadline.", time: "4 days ago" },
  { sender: "student", text: "I will, thank you!", time: "4 days ago" },
  { sender: "teacher", text: "Also review chapter 5 for the upcoming quiz.", time: "3 days ago" },
  { sender: "student", text: "Got it!", time: "3 days ago" },
];

const initialRows: ConversationRow[] = [
  { id: 1, teacher: "Ms. Johnson", student: "Alex Martinez",    class: "S3 Biology 2026", last: "5m ago",   count: 4, flagged: false },
  { id: 2, teacher: "Ms. Johnson", student: "Sarah Uwera",      class: "S3 Biology 2026", last: "1h ago",   count: 3, flagged: false },
  { id: 3, teacher: "Mr. Smith",   student: "David Kagabo",     class: "Mathematics A",   last: "3h ago",   count: 2, flagged: false },
  { id: 4, teacher: "Mr. Smith",   student: "Grace Mutoni",     class: "Mathematics A",   last: "Yesterday", count: 2, flagged: false },
  { id: 5, teacher: "Ms. Johnson", student: "Eric Nkurunziza",  class: "S3 Biology 2026", last: "2d ago",   count: 6, flagged: true  },
  { id: 6, teacher: "Dr. Mukama",  student: "Amina Osei",       class: "Physics S4",      last: "3d ago",   count: 1, flagged: false },
  { id: 7, teacher: "Dr. Mukama",  student: "John Mwangi",      class: "Physics S4",      last: "4d ago",   count: 8, flagged: true  },
  { id: 8, teacher: "Ms. Johnson", student: "Claire Habimana",  class: "S3 Biology 2026", last: "1w ago",   count: 3, flagged: false },
];

export function AdminMessages() {
  const [rows, setRows] = useState<ConversationRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [viewRow, setViewRow] = useState<ConversationRow | null>(null);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return r.teacher.toLowerCase().includes(q) || r.student.toLowerCase().includes(q);
  });

  function toggleFlag(id: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, flagged: !r.flagged } : r)));
  }

  return (
    <AppShell role="admin" pending={true} pageTitle="Messages (Moderation)">
      {/* Page heading */}
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#0F0E47" }}>Platform Conversations</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8686AC" }}>Read-only moderation view</p>
      </div>

      {/* White card */}
      <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
        {/* Search */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2 max-w-sm" style={{ borderColor: "#E2E8F0" }}>
            <Search size={14} style={{ color: "#8686AC" }} />
            <input
              className="flex-1 text-sm outline-none bg-transparent"
              placeholder="Search by teacher or student name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: "#0F0E47" }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>Teacher</th>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>Student</th>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>Class</th>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>Last Message</th>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>Messages</th>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>View</th>
                <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "#505081" }}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors cursor-default"
                  style={{
                    borderColor: "#E2E8F0",
                    height: 56,
                    background: "inherit",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#EDE9FE")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "#fff" : "#F8FAFC")}
                >
                  <td className="px-4 py-0 font-medium" style={{ color: "#0F0E47" }}>{row.teacher}</td>
                  <td className="px-4 py-0" style={{ color: "#0F0E47" }}>{row.student}</td>
                  <td className="px-4 py-0" style={{ color: "#505081" }}>{row.class}</td>
                  <td className="px-4 py-0 text-xs" style={{ color: "#8686AC" }}>{row.last}</td>
                  <td className="px-4 py-0 text-center font-semibold" style={{ color: "#272757" }}>{row.count}</td>
                  <td className="px-4 py-0">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={
                        row.flagged
                          ? { background: "#FEE2E2", color: "#991B1B" }
                          : { background: "#D1FAE5", color: "#065F46" }
                      }
                    >
                      {row.flagged ? "Flagged" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-0">
                    <button
                      onClick={() => setViewRow(row)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ background: "#EDE9FE", color: "#272757" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#DDD6FE")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#EDE9FE")}
                    >
                      <MessageSquare size={12} />
                      View
                    </button>
                  </td>
                  <td className="px-4 py-0">
                    <button
                      onClick={() => toggleFlag(row.id)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={
                        row.flagged
                          ? { background: "#FEE2E2", color: "#991B1B" }
                          : { background: "#F1F5F9", color: "#505081" }
                      }
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = "0.8";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                      }}
                    >
                      <Flag size={12} />
                      {row.flagged ? "Unflag" : "Flag"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: "#8686AC" }}>
                    No conversations match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewRow !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,14,71,0.4)" }}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "85vh" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E2E8F0" }}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: "#0F0E47" }}>{viewRow.teacher}</span>
                  <span className="text-xs" style={{ color: "#8686AC" }}>↔</span>
                  <span className="font-bold text-sm" style={{ color: "#0F0E47" }}>{viewRow.student}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "#EDE9FE", color: "#272757" }}
                  >
                    {viewRow.class}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewRow(null)}
                className="rounded-lg p-1.5 transition-colors hover:bg-[#F8FAFC]"
              >
                <X size={18} style={{ color: "#8686AC" }} />
              </button>
            </div>

            {/* Amber banner */}
            <div
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold"
              style={{ background: "#FEF3C7", color: "#92400E" }}
            >
              <Flag size={12} />
              Read-only — moderation view
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: "#F8FAFC" }}>
              {mockThread.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "teacher" ? "items-end" : "items-start"}`}
                >
                  <div
                    className="px-4 py-2.5 max-w-[70%] text-sm leading-relaxed"
                    style={
                      msg.sender === "teacher"
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
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                      {msg.sender === "teacher" ? viewRow.teacher : viewRow.student}
                    </span>
                    <span className="text-[10px]" style={{ color: "#CBD5E1" }}>·</span>
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Close footer */}
            <div className="flex justify-end px-6 py-4 border-t" style={{ borderColor: "#E2E8F0" }}>
              <button
                onClick={() => setViewRow(null)}
                className="rounded-xl border px-5 py-2 text-sm font-semibold transition-colors hover:bg-[#F8FAFC]"
                style={{ borderColor: "#E2E8F0", color: "#505081" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
