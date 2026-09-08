import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  CheckCheck,
  Flag,
  UserPlus,
  Sparkles,
  Trash2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type Filter = "all" | "unread" | "read";

interface UiNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  absoluteTime: string;
  read: boolean;
  link?: string;
  type: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function formatAbsolute(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function relativeTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatAbsolute(iso);
}

function styleForType(type?: string, message?: string) {
  const t = `${type || ""} ${message || ""}`.toLowerCase();
  if (t.includes("flag") || t.includes("review")) {
    return { icon: Flag, iconBg: "bg-amber-50", iconColor: "text-amber-600" };
  }
  if (t.includes("error") || t.includes("alert") || t.includes("danger")) {
    return { icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500" };
  }
  if (t.includes("join") || t.includes("student") || t.includes("enroll")) {
    return { icon: UserPlus, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" };
  }
  if (t.includes("submit") || t.includes("result") || t.includes("success")) {
    return { icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" };
  }
  if (t.includes("deadline") || t.includes("due")) {
    return { icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" };
  }
  if (t.includes("message") || t.includes("feedback")) {
    return { icon: MessageSquare, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" };
  }
  if (t.includes("ai") || t.includes("generat") || t.includes("quiz")) {
    return { icon: Sparkles, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" };
  }
  if (t.includes("class") || t.includes("book")) {
    return { icon: BookOpen, iconBg: "bg-gray-50", iconColor: "text-[#272757]" };
  }
  return { icon: Bell, iconBg: "bg-gray-50", iconColor: "text-[#272757]" };
}

function mapRow(n: any): UiNotification {
  const title = n.title || "Notification";
  const message = n.message || "";
  const style = styleForType(n.type, `${title} ${message}`);
  const created = n.createdAt || n.updatedAt;
  return {
    id: n.id,
    title,
    message,
    time: relativeTime(created),
    absoluteTime: formatAbsolute(created),
    read: Boolean(n.isRead ?? n.read),
    link: n.link || undefined,
    type: n.type || "info",
    ...style,
  };
}

export function TeacherNotifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
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

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [filter, notifications]);

  const markAllRead = async () => {
    if (!unreadCount) return;
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
    if (!notifications.length) return;
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
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
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

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: notifications.length - unreadCount },
  ];

  return (
    <AppShell role="teacher" pageTitle="Notifications">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-[#0F0E47]">Notifications</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading
                ? "Loading…"
                : unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                  : "You're all caught up"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={!notifications.length}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-9 px-3 text-sm gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </Button>
            <Button
              onClick={markAllRead}
              disabled={!unreadCount}
              className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total",
              value: String(notifications.length),
              icon: Inbox,
              iconBg: "bg-gray-50",
              iconColor: "text-[#272757]",
            },
            {
              label: "Unread",
              value: String(unreadCount),
              icon: Bell,
              iconBg: "bg-[#EDE9FE]",
              iconColor: "text-[#272757]",
            },
            {
              label: "Read",
              value: String(notifications.length - unreadCount),
              icon: CheckCircle2,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
            },
          ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <Card
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <div
                  className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-[#0F0E47] tracking-tight">{value}</p>
            </Card>
          ))}
        </div>

        {/* List */}
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {filters.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === key
                      ? "bg-[#272757] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                  <span
                    className={`ml-1.5 tabular-nums ${
                      filter === key ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin mb-3" />
              <p className="text-sm">Loading notifications…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">
                {filter === "unread"
                  ? "No unread notifications"
                  : filter === "read"
                    ? "No read notifications"
                    : "No notifications yet"}
              </h3>
              <p className="text-xs text-gray-500 max-w-xs">
                {filter === "all"
                  ? "Updates about quizzes, class joins, and flagged answers will show up here."
                  : "Try another filter to see more."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filtered.map((n) => {
                const Icon = n.icon;
                return (
                  <li key={n.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleClick(n)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleClick(n);
                        }
                      }}
                      className={`flex items-start gap-3.5 px-5 py-4 transition-colors cursor-pointer hover:bg-gray-50/80 ${
                        n.read ? "bg-white" : "bg-[#FAFAFE]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 ${n.iconBg} rounded-xl flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-4 h-4 ${n.iconColor}`} strokeWidth={1.75} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className={`text-sm leading-snug ${
                                n.read
                                  ? "text-gray-600 font-medium"
                                  : "text-[#0F0E47] font-semibold"
                              }`}
                            >
                              {n.title}
                            </p>
                            {n.message && n.message !== n.title ? (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                                {n.message}
                              </p>
                            ) : null}
                            <p
                              className="text-[11px] text-gray-400 mt-1.5"
                              title={n.absoluteTime}
                            >
                              {n.time}
                              {n.absoluteTime && n.time !== n.absoluteTime
                                ? ` · ${n.absoluteTime}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 pt-0.5">
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-[#272757]" title="Unread" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(n.id);
                              }}
                              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
