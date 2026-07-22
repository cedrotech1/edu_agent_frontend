import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, X, CheckCheck, AlertCircle, Clock, BookOpen, UserPlus, Flag } from "lucide-react";
import { Button } from "./ui/button";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type Role = "teacher" | "student" | "admin";

interface Notification {
  id: number;
  icon: "flag" | "users" | "clock" | "book" | "user-plus";
  message: string;
  time: string;
  link?: string;
  read: boolean;
}

const iconMap = {
  flag: Flag,
  users: Bell,
  clock: Clock,
  book: BookOpen,
  "user-plus": UserPlus,
};

const iconColors = {
  flag: "text-red-500 bg-red-50",
  users: "text-[#6C63FF] bg-[#6C63FF]/10",
  clock: "text-[#FFD166] bg-[#FFD166]/10",
  book: "text-[#4FC3F7] bg-[#4FC3F7]/10",
  "user-plus": "text-[#43E6B5] bg-[#43E6B5]/10",
};

interface Props { role: Role; }

function mapIcon(type?: string): Notification["icon"] {
  const t = (type || "").toLowerCase();
  if (t.includes("flag")) return "flag";
  if (t.includes("user")) return "user-plus";
  if (t.includes("quiz") || t.includes("book")) return "book";
  if (t.includes("clock") || t.includes("deadline")) return "clock";
  return "users";
}

function relativeTime(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationsPanel({ role }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.notifications.list();
        const rows = (res.data as any[]) || [];
        if (cancelled) return;
        setNotifications(
          rows.map((n: any) => ({
            id: n.id,
            icon: mapIcon(n.type),
            message: n.message || n.title || "Notification",
            time: relativeTime(n.createdAt || n.updatedAt),
            link: n.link,
            read: Boolean(n.isRead ?? n.read),
          }))
        );
      } catch (err) {
        console.error('Failed to load notifications:', err);
        if (cancelled) return;
        setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await api.notifications.markAllRead(); } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to mark all read");
    }
  };

  const handleClick = async (n: Notification) => {
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    try { if (!n.read) await api.notifications.markRead(n.id); } catch { /* ignore */ }
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">Notifications</h3>
                {unread > 0 && <p className="text-xs text-gray-500">{unread} unread</p>}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#6C63FF] hover:underline font-medium">
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="p-10 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3 animate-pulse" />
                  <p className="text-gray-500 text-sm">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.icon];
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.read ? "bg-[#6C63FF]/3" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColors[n.icon]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.read ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-[#6C63FF] rounded-full mt-2 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
