import { useCallback, useEffect, useMemo, useState } from "react";
import { Megaphone, Send, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { api, ApiError, type UserRole } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Audience = "all" | "teachers" | "students" | "admins" | "class" | "school" | "users";

interface AnnouncementItem {
  id: number;
  title: string;
  body: string;
  recipients: string;
  status: string;
  sentAt?: string | null;
  createdAt?: string;
  authorName?: string;
}

export function AnnouncementsPage({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const canCreate = role === "admin" || role === "teacher";

  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>(role === "admin" ? "all" : "class");
  const [classId, setClassId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [emailQuery, setEmailQuery] = useState("");
  const [searchHits, setSearchHits] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (role === "admin") {
        const res = await api.admin.announcements.list();
        const rows = (res.data as any[]) || [];
        setItems(
          rows.map((a) => ({
            id: a.id,
            title: a.title,
            body: a.body || a.message || "",
            recipients: a.recipients || a.audienceLabel || a.audience,
            status: a.status,
            sentAt: a.sentAt,
            createdAt: a.createdAt,
            authorName: a.authorName || a.author?.names,
          }))
        );
      } else {
        const res = await api.announcements.list();
        const rows = (res.data as any[]) || [];
        setItems(
          rows.map((a) => ({
            id: a.id,
            title: a.title,
            body: a.body || "",
            recipients: a.recipients || a.audienceLabel || a.audience,
            status: a.status,
            sentAt: a.sentAt,
            createdAt: a.createdAt,
            authorName: a.authorName || a.author?.names,
          }))
        );
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canCreate) return;
    (async () => {
      try {
        if (role === "teacher" || role === "admin") {
          const cls = await api.classes.list();
          setClasses((cls.data as any[]) || []);
        }
        if (role === "admin") {
          const s = await api.admin.schools.list();
          setSchools((s.data as any[]) || []);
        } else {
          const s = await api.schools.mine();
          setSchools((s.data as any[]) || user?.schools || []);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [canCreate, role, user?.schools]);

  useEffect(() => {
    if (audience !== "users" || emailQuery.trim().length < 2) {
      setSearchHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await api.users.search(emailQuery.trim());
        setSearchHits((res.data as any[]) || []);
      } catch {
        setSearchHits([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [audience, emailQuery]);

  const audienceOptions = useMemo(() => {
    if (role === "admin") {
      return [
        { value: "all", label: "All users" },
        { value: "teachers", label: "All teachers" },
        { value: "students", label: "All students" },
        { value: "admins", label: "Admins" },
        { value: "school", label: "Specific school" },
        { value: "class", label: "Specific class" },
        { value: "users", label: "Selected users (email search)" },
      ] as const;
    }
    return [
      { value: "class", label: "One of my classes" },
      { value: "school", label: "One of my schools" },
      { value: "users", label: "Selected users (email search)" },
    ] as const;
  }, [role]);

  const addUser = (u: any) => {
    if (selectedUsers.some((s) => s.id === u.id)) return;
    setSelectedUsers((prev) => [
      ...prev,
      { id: u.id, name: u.name || u.names, email: u.email },
    ]);
    setEmailQuery("");
    setSearchHits([]);
  };

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    const payload: Record<string, unknown> = {
      title: title.trim(),
      body: body.trim(),
      audience,
      sendNow: true,
    };
    if (audience === "class") {
      if (!classId) {
        toast.error("Select a class");
        return;
      }
      payload.classId = Number(classId);
    }
    if (audience === "school") {
      if (!schoolId) {
        toast.error("Select a school");
        return;
      }
      payload.schoolId = Number(schoolId);
    }
    if (audience === "users") {
      if (!selectedUsers.length) {
        toast.error("Select at least one user");
        return;
      }
      payload.userIds = selectedUsers.map((u) => u.id);
    }

    setSending(true);
    try {
      if (role === "admin") {
        await api.admin.announcements.create(payload);
      } else {
        await api.announcements.create(payload);
      }
      toast.success("Announcement sent — recipients were notified");
      setTitle("");
      setBody("");
      setSelectedUsers([]);
      setClassId("");
      setSchoolId("");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell role={role} pageTitle="Announcements">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {canCreate && (
          <Card className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#0F0E47] mb-1 flex items-center gap-2">
              <Send className="w-4 h-4" /> New announcement
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Target everyone, a school, a class, or specific people by email. All targets get an in-app notification.
            </p>

            <label className="text-xs font-medium text-gray-600">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              className="w-full mt-1 mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              {audienceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {audience === "class" && (
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Select class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ""}
                  </option>
                ))}
              </select>
            )}

            {audience === "school" && (
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Select school…</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {audience === "users" && (
              <div className="mb-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    placeholder="Search by email or name…"
                    className="pl-9 qm-input"
                  />
                </div>
                {searchHits.length > 0 && (
                  <div className="mt-1 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    {searchHits.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => addUser(u)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <span className="font-medium text-[#0F0E47]">{u.name || u.names}</span>
                        <span className="text-gray-400 ml-2">{u.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedUsers.map((u) => (
                      <span
                        key={u.id}
                        className="inline-flex items-center gap-1 text-xs bg-[#EDE9FE] text-[#272757] px-2 py-1 rounded-full"
                      >
                        {u.email}
                        <button type="button" onClick={() => setSelectedUsers((p) => p.filter((x) => x.id !== u.id))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mb-2 qm-input"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message"
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-3"
            />
            <Button
              onClick={send}
              disabled={sending}
              className="w-full bg-[#272757] hover:bg-[#505081] text-white rounded-xl"
            >
              {sending ? "Sending…" : "Send & notify"}
            </Button>
          </Card>
        )}

        <Card className={`${canCreate ? "lg:col-span-3" : "lg:col-span-5"} bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#272757]" />
            <h2 className="text-sm font-semibold text-[#0F0E47]">
              {role === "admin" ? "All announcements" : "Your announcements"}
            </h2>
          </div>
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No announcements yet</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[640px] overflow-y-auto">
              {items.map((a) => (
                <div key={a.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0F0E47]">{a.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {a.recipients}
                        {a.authorName ? ` · ${a.authorName}` : ""}
                        {" · "}
                        {a.sentAt || a.createdAt
                          ? new Date(a.sentAt || a.createdAt || "").toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{a.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

export function TeacherAnnouncements() {
  return <AnnouncementsPage role="teacher" />;
}

export function StudentAnnouncements() {
  return <AnnouncementsPage role="student" />;
}

export function AdminAnnouncementsHub() {
  return <AnnouncementsPage role="admin" />;
}
