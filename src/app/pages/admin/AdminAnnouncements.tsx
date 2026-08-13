import { useState } from "react";
import { AppShell } from "../../components/AppShell";
import {
  Users,
  Megaphone,
  List,
  Calendar,
  Send,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("All Users");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Scheduled" | "Sent">("All");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<number | null>(null);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Welcome to New Semester",    recipients: "All Users",    date: "Jul 28, 2026", count: 482, status: "Sent",      message: "Dear students and teachers, welcome back to a new semester..." },
    { id: 2, title: "Quiz Deadline Reminder",     recipients: "All Teachers", date: "Jul 25, 2026", count: 24,  status: "Sent",      message: "Please remind your students of upcoming quiz deadlines..." },
    { id: 3, title: "Maintenance Notice",         recipients: "All Users",    date: "Jul 20, 2026", count: 482, status: "Scheduled", message: "The platform will undergo scheduled maintenance on Saturday..." },
    { id: 4, title: "New Feature: AI Grading",    recipients: "All Students", date: "Jul 15, 2026", count: 456, status: "Sent",      message: "We have launched a new AI grading feature for short answers..." },
  ]);

  const recipientCount =
    recipients === "All Users" ? 482 :
    recipients === "All Teachers" ? 24 :
    recipients === "All Students" ? 456 : 234;

  const filteredAnnouncements =
    filter === "All" ? announcements : announcements.filter(a => a.status === filter);

  const viewItem = announcements.find(a => a.id === showViewModal) ?? null;

  function handleSend() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setAnnouncements(prev => [
      {
        id: Date.now(),
        title: title || "Untitled",
        recipients,
        date: dateStr,
        count: recipientCount,
        status: "Sent",
        message: message || "",
      },
      ...prev,
    ]);
    toast.success("Announcement sent successfully.");
    setShowSendModal(false);
    setTitle("");
    setMessage("");
    setRecipients("All Users");
    setSchoolSearch("");
  }

  function handleSchedule() {
    toast.success("Announcement scheduled.");
    setShowScheduleModal(false);
    setSchedDate("");
    setSchedTime("");
  }

  const inputCls = "w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-sm focus:outline-none focus:border-[#272757] text-[#0F0E47]";
  const labelCls = "block text-xs font-medium text-[#64748B] mb-1";

  return (
    <AppShell role="admin" pending={true} pageTitle="Announcements">
      {/* Compose Card */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[#0F0E47] mb-4">Compose Announcement</h2>
        <div className="grid gap-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input
              className={inputCls}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className={labelCls}>Message *</label>
            <textarea
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#272757] resize-y text-[#0F0E47]"
              style={{ minHeight: "120px" }}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message here…"
            />
          </div>
          <div>
            <label className={labelCls}>Recipients</label>
            <select
              className={inputCls + " bg-white cursor-pointer"}
              value={recipients}
              onChange={e => setRecipients(e.target.value)}
            >
              <option>All Users</option>
              <option>All Teachers</option>
              <option>All Students</option>
              <option>Specific School</option>
            </select>
            {recipients === "Specific School" && (
              <input
                className={inputCls + " mt-2"}
                placeholder="Search school name…"
                value={schoolSearch}
                onChange={e => setSchoolSearch(e.target.value)}
              />
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#272757] text-[#272757] text-sm font-medium hover:bg-[#EDE9FE] transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#272757] text-white text-sm font-medium hover:bg-[#505081] transition-colors"
          >
            <Send className="w-4 h-4" />
            Send Now
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["All", "Scheduled", "Sent"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              filter === tab
                ? "bg-[#272757] text-white border-[#272757]"
                : "bg-white border-[#272757] text-[#272757] hover:bg-[#EDE9FE]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <h3 className="mb-3 font-semibold text-[#0F0E47]">Sent Announcements</h3>
      {filteredAnnouncements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#8686AC]">
          <Megaphone className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No announcements sent yet.</p>
        </div>
      ) : (
        filteredAnnouncements.map(item => (
          <div key={item.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-3 flex items-center gap-4 flex-wrap">
            <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center text-[#272757] shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0F0E47] text-sm truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="bg-[#EDE9FE] text-[#272757] text-xs px-2 py-0.5 rounded-full">
                  {item.recipients}
                </span>
                <span className="text-xs text-[#64748B]">{item.date} · {item.count} users</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                item.status === "Sent"
                  ? "bg-[#D1FAE5] text-[#065F46]"
                  : "bg-[#EDE9FE] text-[#272757]"
              }`}>
                {item.status}
              </span>
              <button
                onClick={() => setShowViewModal(item.id)}
                className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[#272757] text-[#272757] text-xs font-medium hover:bg-[#EDE9FE] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
            </div>
          </div>
        ))
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#0F0E47]">Schedule Announcement</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#64748B] hover:text-[#0F0E47]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={schedDate}
                  onChange={e => setSchedDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Time</label>
                <input
                  type="time"
                  className={inputCls}
                  value={schedTime}
                  onChange={e => setSchedTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="h-9 px-4 rounded-lg border border-[#E2E8F0] text-[#64748B] text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="h-9 px-4 rounded-lg bg-[#272757] text-white text-sm font-medium hover:bg-[#505081] transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Now Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#0F0E47]">Send Announcement?</h3>
              <button onClick={() => setShowSendModal(false)} className="text-[#64748B] hover:text-[#0F0E47]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AlertTriangle className="text-[#F59E0B] mx-auto mb-3 w-10 h-10" />
            <p className="text-sm text-[#64748B]">
              Send this announcement to <span className="font-semibold text-[#0F0E47]">{recipientCount}</span> users? This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowSendModal(false)}
                className="h-9 px-4 rounded-lg border border-[#E2E8F0] text-[#64748B] text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="h-9 px-4 rounded-lg bg-[#272757] text-white text-sm font-medium hover:bg-[#505081] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal !== null && viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#0F0E47]">{viewItem.title}</h3>
              <button onClick={() => setShowViewModal(null)} className="text-[#64748B] hover:text-[#0F0E47]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="bg-[#EDE9FE] text-[#272757] text-xs px-2 py-0.5 rounded-full">{viewItem.recipients}</span>
              <span className="text-xs text-[#64748B]">{viewItem.date} · {viewItem.count} users</span>
            </div>
            <hr className="border-[#E2E8F0] mb-4" />
            <p className="text-sm text-[#64748B] leading-relaxed">{viewItem.message}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(null)}
                className="h-9 px-4 rounded-lg bg-[#272757] text-white text-sm font-medium hover:bg-[#505081] transition-colors"
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
