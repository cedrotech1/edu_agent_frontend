from pathlib import Path
import re

root = Path(r"c:\Users\HUAWEI\Desktop\new\tc-ai-agent\edu_agent_frontend\src\app")

# AdminUserManagement
um = root / "pages/admin/AdminUserManagement.tsx"
text = um.read_text(encoding="utf-8")
if "api.users.list" not in text:
    text = text.replace(
        'import { useState } from "react";',
        'import { useEffect, useState } from "react";',
    )
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError, initials } from "@/lib/api";',
    )
    # remove initialUsers mock usage by loading from API
    text = text.replace(
        "const [users, setUsers] = useState<User[]>(initialUsers);",
        "const [users, setUsers] = useState<User[]>([]);",
    )
    text = text.replace(
        """  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const filtered = users.filter((u) => {""",
        """  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.list({
        role: roleFilter === "all" ? undefined : roleFilter,
        search: search || undefined,
      });
      const rows = (res.data as any[]) || [];
      setUsers(
        (Array.isArray(rows) ? rows : []).map((u: any) => ({
          id: u.id,
          name: u.name || u.names || "",
          initials: u.initials || initials(u.name || u.names),
          email: u.email,
          role: u.role,
          school: u.school || "",
          status: (u.status === "suspended" || u.active === 0 ? "suspended" : "active") as UserStatus,
          quizzes: u.quizzes ?? u.quizCount ?? 0,
        }))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const filtered = users.filter((u) => {""",
    )
    text = text.replace(
        """  const toggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== id) return u;
      const next: UserStatus = u.status === "active" ? "suspended" : "active";
      toast.success(next === "suspended" ? `${u.name} suspended` : `${u.name} reactivated`);
      return { ...u, status: next };
    }));
  };""",
        """  const toggleStatus = async (id: number) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const next: UserStatus = u.status === "active" ? "suspended" : "active";
    try {
      await api.users.setStatus(id, next);
      setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
      toast.success(next === "suspended" ? `${u.name} suspended` : `${u.name} reactivated`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    }
  };""",
    )
    text = text.replace(
        """  const handleAddUser = () => {
    if (!validateAdd()) return;
    const initials = newUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    setUsers((prev) => [...prev, {
      id: prev.length + 1, ...newUser, initials, status: "active", quizzes: 0,
    }]);
    toast.success(`${newUser.name} added successfully`);
    setShowAddModal(false);
    setNewUser({ name: "", email: "", role: "student", school: "" });
    setAddErrors({});
  };""",
        """  const handleAddUser = async () => {
    if (!validateAdd()) return;
    try {
      await api.users.create(newUser);
      toast.success(`${newUser.name} added successfully`);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", role: "student", school: "" });
      setAddErrors({});
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add user");
    }
  };""",
    )
    text = text.replace(
        '<p className="text-sm text-gray-500">{users.length} total users</p>',
        '<p className="text-sm text-gray-500">{loading ? "Loading…" : `${users.length} total users`}</p>',
    )
    um.write_text(text, encoding="utf-8")
    print("AdminUserManagement patched")
else:
    print("AdminUserManagement already")

# AdminQuizOversight
qo = root / "pages/admin/AdminQuizOversight.tsx"
text = qo.read_text(encoding="utf-8")
if "api.admin.quizzes" not in text:
    text = text.replace('import { useState } from "react";', 'import { useEffect, useState } from "react";')
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError } from "@/lib/api";',
    )
    text = text.replace(
        "const [quizzes, setQuizzes] = useState<OversightQuiz[]>(initialQuizzes);",
        "const [quizzes, setQuizzes] = useState<OversightQuiz[]>([]);\n  const [loading, setLoading] = useState(true);",
    )
    text = text.replace(
        """  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = quizzes.filter((q) => {""",
        """  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.quizzes();
        const rows = (res.data as any[]) || [];
        setQuizzes(
          (Array.isArray(rows) ? rows : []).map((q: any) => ({
            id: q.id,
            title: q.title,
            teacher: q.teacher || q.teacherName || "—",
            class: q.class || q.className || "—",
            created: q.created || q.createdAt || "—",
            deadline: q.deadline || "—",
            status: (q.status === "closed" || q.status === "completed" ? "closed" : "active") as QuizStatus,
            submissions: q.submissions ?? q.submissionCount ?? 0,
            flagged: Boolean(q.flagged),
          }))
        );
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = quizzes.filter((q) => {""",
    )
    text = text.replace(
        """  const toggleFlag = (id: number) => {
    setQuizzes((prev) => prev.map((q) => {
      if (q.id !== id) return q;
      const next = !q.flagged;
      toast[next ? "warning" : "success"](next ? "Quiz flagged for review" : "Flag removed");
      return { ...q, flagged: next };
    }));
  };""",
        """  const toggleFlag = async (id: number) => {
    const q = quizzes.find((x) => x.id === id);
    if (!q) return;
    const next = !q.flagged;
    try {
      await api.admin.flagQuiz(id, next);
      setQuizzes((prev) => prev.map((x) => (x.id === id ? { ...x, flagged: next } : x)));
      toast[next ? "warning" : "success"](next ? "Quiz flagged for review" : "Flag removed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update flag");
    }
  };""",
    )
    text = text.replace(
        '<p className="text-sm text-gray-500">{quizzes.length} quizzes across platform</p>',
        '<p className="text-sm text-gray-500">{loading ? "Loading…" : `${quizzes.length} quizzes across platform`}</p>',
    )
    qo.write_text(text, encoding="utf-8")
    print("AdminQuizOversight patched")
else:
    print("AdminQuizOversight already")

# AdminGradingLogs
gl = root / "pages/admin/AdminGradingLogs.tsx"
text = gl.read_text(encoding="utf-8")
if "api.admin.gradingLogs" not in text:
    text = text.replace('import { useState } from "react";', 'import { useEffect, useState } from "react";')
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError } from "@/lib/api";',
    )
    text = text.replace(
        "const [logs, setLogs] = useState<GradingLog[]>(initialLogs);",
        "const [logs, setLogs] = useState<GradingLog[]>([]);\n  const [loading, setLoading] = useState(true);",
    )
    text = text.replace(
        """  const [overrideError, setOverrideError] = useState("");

  const filtered = logs.filter((l) => {""",
        """  const [overrideError, setOverrideError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.gradingLogs(confFilter);
        const rows = (res.data as any[]) || [];
        setLogs(
          (Array.isArray(rows) ? rows : []).map((l: any) => ({
            id: l.id,
            quiz: l.quiz || l.quizTitle || "—",
            student: l.student || l.studentName || "—",
            question: l.question || l.questionText || "—",
            aiScore: l.aiScore ?? 0,
            confidence: l.confidence ?? 0,
            override: Boolean(l.override || l.overridden),
            date: l.date || l.createdAt || "—",
            manualScore: l.manualScore ?? null,
          }))
        );
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load grading logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [confFilter]);

  const filtered = logs.filter((l) => {""",
    )
    text = text.replace(
        """  const saveOverride = () => {
    const score = parseInt(overrideScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setOverrideError("Enter a score between 0 and 100");
      return;
    }
    setLogs((prev) => prev.map((l) =>
      l.id === overrideTarget ? { ...l, override: true, manualScore: score } : l
    ));
    toast.success("Grade overridden successfully");
    setOverrideTarget(null);
    setOverrideScore("");
    setOverrideError("");
  };""",
        """  const saveOverride = async () => {
    const score = parseInt(overrideScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setOverrideError("Enter a score between 0 and 100");
      return;
    }
    if (overrideTarget == null) return;
    try {
      await api.quizzes.overrideAnswer(overrideTarget, score);
      setLogs((prev) => prev.map((l) =>
        l.id === overrideTarget ? { ...l, override: true, manualScore: score } : l
      ));
      toast.success("Grade overridden successfully");
      setOverrideTarget(null);
      setOverrideScore("");
      setOverrideError("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to override");
    }
  };""",
    )
    text = text.replace(
        '<p className="text-sm text-gray-500">{logs.length} graded answers · {logs.filter((l) => l.override).length} overridden</p>',
        '<p className="text-sm text-gray-500">{loading ? "Loading…" : `${logs.length} graded answers · ${logs.filter((l) => l.override).length} overridden`}</p>',
    )
    gl.write_text(text, encoding="utf-8")
    print("AdminGradingLogs patched")
else:
    print("AdminGradingLogs already")

# AdminPlatformSettings
ps = root / "pages/admin/AdminPlatformSettings.tsx"
text = ps.read_text(encoding="utf-8")
if "api.admin.getSettings" not in text:
    text = text.replace('import { useState } from "react";', 'import { useEffect, useState } from "react";')
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError } from "@/lib/api";',
    )
    text = text.replace(
        """  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Platform settings saved");
    }, 900);
  };""",
        """  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.getSettings();
        const d: any = res.data || {};
        if (d.platformName) setPlatformName(d.platformName);
        if (d.aiGradingSensitivity) setSensitivity(d.aiGradingSensitivity);
        if (d.emailDeadlines != null) setEmailDeadlines(Boolean(d.emailDeadlines));
        if (d.emailResults != null) setEmailResults(Boolean(d.emailResults));
        if (d.emailFlagged != null) setEmailFlagged(Boolean(d.emailFlagged));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.updateSettings({
        platformName,
        aiGradingSensitivity: sensitivity,
        emailDeadlines,
        emailResults,
        emailFlagged,
      });
      toast.success("Platform settings saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };""",
    )
    text = text.replace(
        '<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">',
        '<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">\n        {loading && <p className="text-gray-500">Loading settings…</p>}',
    )
    ps.write_text(text, encoding="utf-8")
    print("AdminPlatformSettings patched")
else:
    print("AdminPlatformSettings already")

print("done4")
