import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Play,
  Eye,
  Lock,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { AppShell } from "../../components/AppShell";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

type QuizStatus = "not-started" | "in-progress" | "completed" | "closed";
type FilterTab = "all" | QuizStatus;

interface StudentQuiz {
  id: number;
  title: string;
  subject: string;
  class: string;
  teacher: string;
  deadline: string;
  status: QuizStatus;
}

const STATUS_META: Record<QuizStatus, { label: string; badgeClass: string }> = {
  "not-started": { label: "Not Started", badgeClass: "bg-[#EDE9FE] text-[#272757]" },
  "in-progress":  { label: "In Progress", badgeClass: "bg-[#F59E0B]/15 text-yellow-600" },
  "completed":    { label: "Completed",   badgeClass: "bg-[#10B981]/10 text-[#10B981]" },
  "closed":       { label: "Closed",      badgeClass: "bg-gray-100 text-gray-400" },
};

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "not-started",  label: "Not Started" },
  { value: "in-progress",  label: "In Progress" },
  { value: "completed",    label: "Completed" },
  { value: "closed",       label: "Closed" },
];

function formatDeadline(value?: string | null) {
  if (!value) return "No deadline";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function StudentQuizzes() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizCode, setQuizCode] = useState("");
  const [joiningCode, setJoiningCode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [upcomingRes, completedRes] = await Promise.all([
        api.quizzes.studentUpcoming(),
        api.quizzes.studentCompleted(),
      ]);
      const upcoming = ((upcomingRes.data as any[]) || []).map((q: any) => ({
        id: q.id,
        title: q.title || "Quiz",
        subject: q.subject || "",
        class: q.className || q.class || "—",
        teacher: q.teacherName || q.teacher || "Teacher",
        deadline: formatDeadline(q.deadline || q.dueDate),
        status: (q.status === "closed" ? "closed" : "not-started") as QuizStatus,
      }));
      const completed = ((completedRes.data as any[]) || []).map((q: any) => ({
        id: q.id || q.quizId,
        title: q.title || "Quiz",
        subject: q.subject || "",
        class: q.className || q.class || "—",
        teacher: q.teacherName || q.teacher || "Teacher",
        deadline: q.date || formatDeadline(q.submittedAt),
        status: "completed" as QuizStatus,
      }));

      const byId = new Map<number, StudentQuiz>();
      for (const q of [...upcoming, ...completed]) {
        if (!byId.has(q.id) || q.status === "completed") byId.set(q.id, q);
      }
      setQuizzes(Array.from(byId.values()));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = quizzes.filter((q) => {
    const matchesFilter = filter === "all" || q.status === filter;
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase()) ||
      q.teacher.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCount = (tab: FilterTab) =>
    tab === "all" ? quizzes.length : quizzes.filter((q) => q.status === tab).length;

  const unlockWithQuizCode = async () => {
    const code = quizCode.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a quiz code (QZ-…)");
      return;
    }
    if (code.startsWith("QMIND")) {
      toast.message("Use My Classes or the dashboard to join a class with QMIND codes.");
      return;
    }
    setJoiningCode(true);
    try {
      const res = await api.quizzes.byCode(code);
      const quiz = res.data as { id: number; accessCode?: string };
      const { rememberQuizAccessCode } = await import("@/lib/quizAccess");
      rememberQuizAccessCode(quiz.id, quiz.accessCode || code);
      toast.success("Quiz unlocked with join code");
      setQuizCode("");
      navigate(`/student/quiz/${quiz.id}/lobby`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid quiz code");
    } finally {
      setJoiningCode(false);
    }
  };

  return (
    <AppShell role="student" pageTitle="My Quizzes">
      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <p className="text-sm font-semibold text-[#0F0E47] mb-1">Quizzes from your classes</p>
        <p className="text-xs text-gray-500 mb-3">
          Assigned class quizzes appear below—no code needed. Use a quiz code (QZ-…) only if you are not in that class.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlockWithQuizCode()}
            placeholder="QZ-1234"
            className="font-mono uppercase qm-input flex-1"
          />
          <Button
            onClick={unlockWithQuizCode}
            disabled={joiningCode}
            className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl"
          >
            {joiningCode ? "Unlocking…" : "Unlock with code"}
          </Button>
        </div>
      </Card>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === value
                ? "bg-[#272757] text-white border-[#272757]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#272757]/40 hover:text-[#272757]"
            }`}
          >
            {label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {getCount(value)}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" style={{ strokeWidth: 1.75 }} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes, subjects, teachers…"
          className="pl-9 qm-input"
        />
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
            <p className="text-sm">Loading quizzes…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" style={{ strokeWidth: 1.75 }} />
            <p className="font-semibold text-gray-400 mb-1">No quizzes from your classes</p>
            <p className="text-sm text-gray-300">Join a class, or unlock a shared quiz with a QZ- code above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="qm-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Subject</th>
                  <th className="hidden md:table-cell">Class</th>
                  <th className="hidden lg:table-cell">Teacher</th>
                  <th className="hidden md:table-cell">Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => {
                  const meta = STATUS_META[q.status];
                  return (
                    <tr key={`${q.id}-${q.status}`} className={i % 2 === 1 ? "bg-gray-50/50" : ""}>
                      <td>
                        <p className="font-medium text-[#0F0E47] text-sm">{q.title}</p>
                      </td>
                      <td><span className="text-sm text-gray-600">{q.subject}</span></td>
                      <td className="hidden md:table-cell"><span className="text-sm text-gray-500">{q.class}</span></td>
                      <td className="hidden lg:table-cell"><span className="text-sm text-gray-500">{q.teacher}</span></td>
                      <td className="hidden md:table-cell"><span className="text-xs text-gray-400">{q.deadline}</span></td>
                      <td>
                        <Badge className={`${meta.badgeClass} rounded-full text-xs px-2.5 py-0.5`}>{meta.label}</Badge>
                      </td>
                      <td>
                        {q.status === "not-started" && (
                          <Button
                            onClick={() => navigate(`/student/quiz/${q.id}/lobby`)}
                            className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-8 px-3 text-xs gap-1.5"
                          >
                            <Play className="w-3 h-3" style={{ strokeWidth: 1.75 }} /> Start Quiz
                          </Button>
                        )}
                        {q.status === "completed" && (
                          <Button
                            onClick={() => navigate(`/student/results/${q.id}`)}
                            variant="outline"
                            className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-8 px-3 text-xs gap-1.5"
                          >
                            <Eye className="w-3 h-3" style={{ strokeWidth: 1.75 }} /> View Results
                          </Button>
                        )}
                        {q.status === "closed" && (
                          <Button
                            disabled
                            className="bg-gray-100 text-gray-400 rounded-xl h-8 px-3 text-xs gap-1.5 cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" style={{ strokeWidth: 1.75 }} /> Closed
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
