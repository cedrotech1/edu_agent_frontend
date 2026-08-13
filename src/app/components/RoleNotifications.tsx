import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Flag,
  UserPlus,
  Sparkles,
  Trash2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AppShell } from "./AppShell";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type Role = "teacher" | "student" | "admin" | "parent";
type Filter = "All" | "Unread" | "Read";

interface UiNotification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
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

function styleForType(type?: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("flag") || t.includes("alert")) {
    return { icon: Flag, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#92400E]" };
  }
  if (t.includes("error") || t.includes("danger")) {
    return { icon: AlertTriangle, iconBg: "bg-[#FEE2E2]", iconColor: "text-[#991B1B]" };
  }
  if (t.includes("user") || t.includes("join")) {
    return { icon: UserPlus, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" };
  }
  if (t.includes("quiz") || t.includes("book") || t.includes("class")) {
    return { icon: BookOpen, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" };
  }
  if (t.includes("deadline") || t.includes("clock")) {
    return { icon: Clock, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#92400E]" };
  }
  if (t.includes("message") || t.includes("feedback")) {
    return { icon: MessageSquare, iconBg: "bg-[#D1FAE5]", iconColor: "text-[#065F46]" };
  }
  if (t.includes("ai") || t.includes("generat") || t.includes("spark")) {
    return { icon: Sparkles, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#92400E]" };
  }
  if (t.includes("success") || t.includes("result") || t.includes("submit")) {
    return { icon: CheckCircle2, iconBg: "bg-[#D1FAE5]", iconColor: "text-[#065F46]" };
  }
  return { icon: Bell, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" };
}

function mapRow(n: any): UiNotification {
  const style = styleForType(n.type);
  return {
    id: n.id,
    message: n.message || n.title || "Notification",
    time: relativeTime(n.createdAt || n.updatedAt),
    read: Boolean(n.isRead ?? n.read),
    link: n.link || undefined,
    ...style,
  };
}

export function RoleNotifications({ role }: { role: Role }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("All");
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.notifications.list();
      const rows = (res.data as any[]) || [];
      setNotifications(Array.isArray(rows) ? rows.map(mapRow) : []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "All"
      ? notifications
      : filter === "Unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.read);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.notifications.markAllRead();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to mark all read");
      load();
    }
  };

  const clearAll = async () => {
    const prev = notifications;
    setNotifications([]);
    try {
      await api.notifications.deleteAll();
      toast.success("Notifications cleared");
    } catch (err) {
      setNotifications(prev);
      toast.error(err instanceof ApiError ? err.message : "Failed to clear notifications");
    }
  };

  const handleClick = async (n: UiNotification) => {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      try {
        await api.notifications.markRead(n.id);
      } catch {
        /* ignore */
      }
    }
    if (n.link) navigate(n.link);
  };

  const handleDelete = async (id: number) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    try {
      await api.notifications.delete(id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
      load();
    }
  };

  return (
    <AppShell role={role} pageTitle="Notifications">
      <div className="max-w-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-[#0F0E47]">Notifications</h2>
          <button
            onClick={markAllRead}
            disabled={!notifications.some((n) => !n.read)}
            className="bg-[#272757] text-white h-9 px-4 rounded-xl text-sm font-medium hover:bg-[#505081] transition-colors disabled:opacity-50"
          >
            Mark All as Read
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(["All", "Unread", "Read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                filter === f
                  ? "bg-[#272757] text-white"
                  : "bg-white border border-[#272757] text-[#272757] hover:bg-[#EDE9FE]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={clearAll}
          disabled={notifications.length === 0}
          className="text-sm text-[#EF4444] hover:underline ml-auto block mb-3 disabled:opacity-40"
        >
          Clear All
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8686AC]">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading notifications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-16 h-16 text-[#8686AC] mb-4" style={{ strokeWidth: 1.25 }} />
            <h3 className="text-lg font-semibold text-[#0F0E47] mb-2">No notifications yet</h3>
            <p className="text-sm text-[#64748B]">You are all caught up. Check back later.</p>
          </div>
        ) : (
          <div>
            {filtered.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border border-[#E2E8F0] mb-2 transition-colors hover:bg-[#EDE9FE] cursor-pointer ${
                    n.read ? "bg-white" : "bg-[#EDE9FE]"
                  }`}
                >
                  <div className={`w-10 h-10 ${n.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${n.iconColor}`} style={{ strokeWidth: 1.75 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? "text-[#64748B]" : "text-[#0F0E47] font-medium"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-[#8686AC] mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && <div className="w-2.5 h-2.5 bg-[#272757] rounded-full shrink-0" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                    className="p-1.5 text-[#CBD5E1] hover:text-[#EF4444] rounded-lg hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" style={{ strokeWidth: 1.75 }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
