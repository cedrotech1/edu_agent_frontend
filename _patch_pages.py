from pathlib import Path

root = Path(r"c:\Users\HUAWEI\Desktop\new\tc-ai-agent\edu_agent_frontend\src\app")

# --- StudentResults ---
sr = root / "pages/student/StudentResults.tsx"
text = sr.read_text(encoding="utf-8")
if "api.quizzes.studentResults" not in text:
    text = text.replace(
        'import { useNavigate, useParams } from "react-router";',
        'import { useEffect, useState } from "react";\nimport { useNavigate, useParams } from "react-router";',
    )
    text = text.replace(
        'import { ArrowLeft, CheckCircle, XCircle, Clock, Award, Sparkles } from "lucide-react";',
        'import { ArrowLeft, CheckCircle, XCircle, Clock, Award, Sparkles } from "lucide-react";\nimport { toast } from "sonner";\nimport { api, ApiError } from "@/lib/api";',
    )
    start = text.find("const mockResults = {")
    end = text.find("export function StudentResults()")
    text = text[:start] + text[end:]
    text = text.replace(
        """export function StudentResults() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const getScoreColor""",
        """export function StudentResults() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [mockResults, setMockResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.quizzes.studentResults(quizId);
        const d: any = res.data || {};
        setMockResults({
          quizTitle: d.quizTitle || d.title || "Quiz Results",
          subject: d.subject || "",
          score: d.score ?? 0,
          totalQuestions: d.totalQuestions || d.questions?.length || 0,
          correctAnswers: d.correctAnswers ?? d.correctCount ?? 0,
          timeTaken: d.timeTaken || (d.timeTakenSeconds ? `${Math.floor(d.timeTakenSeconds/60)} min ${d.timeTakenSeconds%60} sec` : "—"),
          classRank: d.classRank || "—",
          classAverage: d.classAverage ?? d.classAvg ?? 0,
          questions: (d.questions || []).map((q: any) => ({
            id: q.id,
            question: q.question || q.questionText,
            yourAnswer: q.yourAnswer ?? q.answer,
            correct: q.correct ?? q.isCorrect,
            correctAnswer: q.correctAnswer,
            aiFeedback: q.aiFeedback || "",
          })),
        });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600">Loading results…</div>;
  if (!mockResults) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600">No results found</div>;

  const getScoreColor""",
    )
    sr.write_text(text, encoding="utf-8")
    print("StudentResults patched")
else:
    print("StudentResults already patched")

# --- NotificationsPanel ---
np = root / "components/NotificationsPanel.tsx"
text = np.read_text(encoding="utf-8")
if "api.notifications" not in text:
    text = text.replace('import { useState } from "react";', 'import { useEffect, useState } from "react";')
    text = text.replace(
        'import { Button } from "./ui/button";',
        'import { Button } from "./ui/button";\nimport { api, ApiError } from "@/lib/api";\nimport { toast } from "sonner";',
    )
    old = """export function NotificationsPanel({ role }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsByRole[role]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleClick = (n: Notification) => {
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    if (n.link) navigate(n.link);
    setOpen(false);
  };"""
    new = """function mapIcon(type?: string): Notification["icon"] {
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
  const [notifications, setNotifications] = useState<Notification[]>(notificationsByRole[role]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.notifications.list();
        const rows = (res.data as any[]) || [];
        if (!Array.isArray(rows) || !rows.length) return;
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
      } catch {
        // keep role mocks as fallback when API unavailable
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
  };"""
    if old not in text:
        print("NotificationsPanel pattern not found")
    else:
        text = text.replace(old, new)
        np.write_text(text, encoding="utf-8")
        print("NotificationsPanel patched")
else:
    print("NotificationsPanel already patched")

print("done")
