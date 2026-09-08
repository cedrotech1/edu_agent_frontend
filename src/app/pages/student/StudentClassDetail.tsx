import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { BookOpen, Play, Eye, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AppShell } from "../../components/AppShell";
import { Breadcrumb } from "../../components/Breadcrumb";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";

interface ActiveQuiz {
  id: number;
  title: string;
  subject: string;
  deadline: string;
  questions?: number;
  timeLimit?: number;
  status: string;
}

interface CompletedQuiz {
  id: number;
  title: string;
  subject: string;
  dateTaken: string;
  score: number;
}

interface ClassView {
  id: number;
  name: string;
  subject: string;
  grade: string;
  teacher: string;
  teacherInitials: string;
}

const scoreBadge = (s: number) =>
  s >= 70 ? "bg-[#10B981]/10 text-[#10B981]" : s >= 50 ? "bg-[#F59E0B]/15 text-yellow-600" : "bg-red-50 text-red-500";

function formatDeadline(value?: string | null) {
  if (!value) return "No deadline";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function StudentClassDetail() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [cls, setCls] = useState<ClassView | null>(null);
  const [activeQuizzes, setActiveQuizzes] = useState<ActiveQuiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const [classRes, completedRes] = await Promise.all([
        api.classes.get(classId),
        api.quizzes.studentCompleted(),
      ]);
      const data: any = classRes.data || {};
      const teacherName = data.teacher?.names || data.teacherName || data.teacher || "Teacher";
      setCls({
        id: data.id,
        name: data.name || "Class",
        subject: data.subject || "",
        grade: data.subLevel || data.grade || data.educationLevel || "",
        teacher: typeof teacherName === "string" ? teacherName : "Teacher",
        teacherInitials: initials(typeof teacherName === "string" ? teacherName : "T"),
      });

      const quizzes: any[] = Array.isArray(data.quizzes) ? data.quizzes : [];
      const quizIds = new Set(quizzes.map((q) => Number(q.id)));

      const completedRows = ((completedRes.data as any[]) || []).filter((r: any) =>
        quizIds.has(Number(r.id || r.quizId)),
      );
      const completedIdSet = new Set(completedRows.map((r: any) => Number(r.id || r.quizId)));

      setActiveQuizzes(
        quizzes
          .filter((q) => {
            if (completedIdSet.has(Number(q.id))) return false;
            const s = String(q.status || "").toLowerCase();
            return s === "active" || s === "published" || s === "open" || s === "scheduled";
          })
          .map((q) => ({
            id: q.id,
            title: q.title || "Quiz",
            subject: q.subject || data.subject || "",
            deadline: formatDeadline(q.deadline),
            questions: q.questionCount ?? q.questions,
            timeLimit: q.timeLimit,
            status: q.status,
          })),
      );

      setCompletedQuizzes(
        completedRows.map((r: any) => ({
          id: r.id || r.quizId,
          title: r.title || "Quiz",
          subject: r.subject || "",
          dateTaken: r.date || (r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"),
          score: Number(r.score ?? 0),
        })),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load class");
      setCls(null);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AppShell role="student" pageTitle="Class Detail">
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
          <p className="text-sm">Loading class…</p>
        </div>
      </AppShell>
    );
  }

  if (!cls) {
    return (
      <AppShell role="student" pageTitle="Class Detail">
        <div className="py-16 text-center text-gray-500">
          <p className="mb-3">Class not found</p>
          <Button onClick={() => navigate("/student/classes")} className="bg-[#272757] text-white rounded-xl">
            Back to My Classes
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="student" pageTitle={cls.name}>
      <Breadcrumb items={[
        { label: "Dashboard", path: "/student" },
        { label: "My Classes", path: "/student/classes" },
        { label: cls.name },
      ]} />

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#0F0E47]">{cls.name}</h2>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#EDE9FE] rounded-xl flex items-center justify-center text-[#272757] font-bold text-lg">
            {cls.teacherInitials}
          </div>
          <p className="text-sm text-gray-500">
            {[cls.subject, cls.grade, cls.teacher].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Card>

      <div className="flex items-center gap-2 mb-5">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? "bg-[#272757] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:border-[#272757]/40"
            }`}
          >
            {t === "active"
              ? `Active Quizzes (${activeQuizzes.length})`
              : `Completed (${completedQuizzes.length})`}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {activeQuizzes.length === 0 ? (
            <Card className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100">
              No active quizzes in this class
            </Card>
          ) : (
            activeQuizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5 text-[#272757]" style={{ strokeWidth: 1.75 }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F0E47] text-sm">{quiz.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{quiz.subject}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {quiz.questions != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <CheckCircle className="w-3 h-3" /> {quiz.questions} questions
                        </span>
                      )}
                      {quiz.timeLimit != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> {quiz.timeLimit} min
                        </span>
                      )}
                      <span className="text-xs text-gray-400">Due: {quiz.deadline}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/student/quiz/${quiz.id}/lobby`)}
                  className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm gap-1.5 shrink-0"
                >
                  <Play className="w-3.5 h-3.5" style={{ strokeWidth: 1.75 }} /> Start Quiz
                </Button>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "completed" && (
        <div className="space-y-3">
          {completedQuizzes.length === 0 ? (
            <Card className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100">
              No completed quizzes yet
            </Card>
          ) : (
            completedQuizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#10B981]/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4.5 h-4.5 text-[#10B981]" style={{ strokeWidth: 1.75 }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F0E47] text-sm">{quiz.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{quiz.subject} · Taken {quiz.dateTaken}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={`${scoreBadge(quiz.score)} rounded-full text-sm font-bold px-3 py-1`}>
                    {quiz.score}%
                  </Badge>
                  <Button
                    onClick={() => navigate(`/student/results/${quiz.id}`)}
                    variant="outline"
                    className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-9 px-3 text-sm gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" style={{ strokeWidth: 1.75 }} /> View Results
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}
