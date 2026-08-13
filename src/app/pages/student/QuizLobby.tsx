import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Clock, BookOpen, Users, AlertCircle, CheckCircle, ArrowLeft, Lock, Bot, Loader2,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";

type LobbyStatus = "open" | "completed" | "closed";

interface LobbyQuiz {
  id: number;
  title: string;
  subject: string;
  className: string;
  teacher: string;
  teacherInitials: string;
  questions: number;
  timeLimit: number;
  deadline: string;
  deadlineMs: number;
  status: LobbyStatus;
  antiAI: boolean;
  studentCount: number;
}

function formatCountdown(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

function formatDeadline(iso?: string | null) {
  if (!iso) return "No deadline";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resolveStatus(q: any): LobbyStatus {
  if (q.hasSubmitted) return "completed";
  const s = String(q.status || "").toLowerCase();
  if (s === "closed" || s === "completed" || s === "archived") return "closed";
  if (q.deadline && q.lockAfterDeadline !== false && new Date(q.deadline).getTime() < Date.now()) {
    return "closed";
  }
  return "open";
}

export function QuizLobby() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<LobbyQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.quizzes.get(quizId);
        const q: any = res.data || {};
        let studentCount = 0;
        const classId = q.classId || q.class?.id;
        if (classId) {
          try {
            const clsRes = await api.classes.get(classId);
            const cls: any = clsRes.data || {};
            studentCount = Array.isArray(cls.students)
              ? cls.students.length
              : Array.isArray(cls.members)
                ? cls.members.length
                : Number(cls.studentCount ?? 0);
          } catch {
            /* optional */
          }
        }
        if (cancelled) return;
        const teacherName = q.teacherName || q.teacher || "Teacher";
        const deadlineIso = q.deadline || null;
        setQuiz({
          id: q.id,
          title: q.title || "Quiz",
          subject: q.subject || "",
          className: q.className || q.class || "—",
          teacher: teacherName,
          teacherInitials: initials(teacherName),
          questions: Number(
            q.questionCount ??
              (Array.isArray(q.questions) ? q.questions.length : 0),
          ),
          timeLimit: Number(q.timeLimit ?? 30),
          deadline: formatDeadline(deadlineIso),
          deadlineMs: deadlineIso ? new Date(deadlineIso).getTime() : Date.now() + 86400000,
          status: resolveStatus(q),
          antiAI: Boolean(q.antiAI),
          studentCount,
        });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load quiz");
        if (!cancelled) setQuiz(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8E7FF] to-[#D9F5FF] flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-60" />
          <p className="text-sm">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8E7FF] to-[#D9F5FF] flex items-center justify-center p-4">
        <Card className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <p className="font-semibold text-gray-700 mb-2">Quiz not found</p>
          <Button onClick={() => navigate("/student/quizzes")} className="mt-2 bg-[#272757] text-white rounded-xl">
            Back to My Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  const msLeft = quiz.deadlineMs - Date.now();
  const isClosingSoon = quiz.status === "open" && msLeft > 0 && msLeft < 2 * 3600000;
  const deadlineBannerClass =
    quiz.status === "closed" ? "bg-red-50 border border-red-200 text-red-700"
    : isClosingSoon            ? "bg-orange-50 border border-orange-200 text-orange-700"
    : "bg-[#10B981]/10 border border-[#10B981]/30 text-[#2ca882]";
  const deadlineIcon =
    quiz.status === "closed" ? <Lock className="w-4 h-4 shrink-0" style={{ strokeWidth: 1.75 }} />
    : isClosingSoon          ? <AlertCircle className="w-4 h-4 shrink-0" style={{ strokeWidth: 1.75 }} />
    : <CheckCircle className="w-4 h-4 shrink-0" style={{ strokeWidth: 1.75 }} />;
  const deadlineText =
    quiz.status === "closed" ? `Quiz closed — ${quiz.deadline}`
    : isClosingSoon          ? `Closing soon! ${formatCountdown(quiz.deadlineMs)}`
    : `Open until ${quiz.deadline} · ${formatCountdown(quiz.deadlineMs)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8E7FF] to-[#D9F5FF] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate("/student/quizzes")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#272757] mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Back to My Quizzes
        </button>

        <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#272757] to-[#272757] p-6 text-white">
            <Badge className="bg-white/20 text-white border-white/30 rounded-full text-xs mb-3">{quiz.subject || "Quiz"}</Badge>
            <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
            <p className="text-white/80 text-sm">{quiz.className}</p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#272757] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {quiz.teacherInitials}
              </div>
              <div>
                <p className="text-xs text-gray-400">Your Teacher</p>
                <p className="font-semibold text-[#0F0E47] text-sm">{quiz.teacher}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-[#EDE9FE] rounded-2xl p-4 text-center">
                <BookOpen className="w-5 h-5 text-[#272757] mx-auto mb-1.5" style={{ strokeWidth: 1.75 }} />
                <p className="text-xl font-bold text-[#272757]">{quiz.questions}</p>
                <p className="text-xs text-gray-400">Questions</p>
              </div>
              <div className="bg-[#EDE9FE] rounded-2xl p-4 text-center">
                <Clock className="w-5 h-5 text-[#272757] mx-auto mb-1.5" style={{ strokeWidth: 1.75 }} />
                <p className="text-xl font-bold text-[#272757]">{quiz.timeLimit} min</p>
                <p className="text-xs text-gray-400">Time Limit</p>
              </div>
              <div className="bg-[#F59E0B]/10 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                <Users className="w-5 h-5 text-yellow-600 mx-auto mb-1.5" style={{ strokeWidth: 1.75 }} />
                <p className="text-xl font-bold text-yellow-600">{quiz.studentCount || "—"}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm font-medium ${deadlineBannerClass}`}>
              {deadlineIcon}
              <span>{deadlineText}</span>
            </div>

            {quiz.antiAI && (
              <div className="flex items-start gap-2.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl px-4 py-3 mb-6">
                <Bot className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" style={{ strokeWidth: 1.75 }} />
                <p className="text-sm text-yellow-700">
                  Answer in your own words — AI will review your responses
                </p>
              </div>
            )}

            {quiz.status === "open" && (
              <>
                <Button
                  onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                  className="w-full bg-[#272757] hover:bg-[#505081] text-white py-6 rounded-2xl text-lg font-semibold shadow-md mb-3"
                >
                  Start Quiz
                </Button>
                <button
                  onClick={() => navigate("/student/quizzes")}
                  className="w-full text-sm text-gray-400 hover:text-[#272757] transition-colors py-2"
                >
                  Back to My Quizzes
                </button>
              </>
            )}
            {quiz.status === "completed" && (
              <>
                <Button
                  onClick={() => navigate(`/student/results/${quiz.id}`)}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-6 rounded-2xl text-lg font-semibold shadow-md mb-3"
                >
                  View Your Results
                </Button>
                <button
                  onClick={() => navigate("/student/quizzes")}
                  className="w-full text-sm text-gray-400 hover:text-[#272757] transition-colors py-2"
                >
                  Back to My Quizzes
                </button>
              </>
            )}
            {quiz.status === "closed" && (
              <>
                <Button disabled className="w-full bg-gray-200 text-gray-400 py-6 rounded-2xl text-lg font-semibold cursor-not-allowed mb-3">
                  <Lock className="w-5 h-5 mr-2" style={{ strokeWidth: 1.75 }} /> Quiz Closed
                </Button>
                <button
                  onClick={() => navigate("/student/quizzes")}
                  className="w-full text-sm text-gray-400 hover:text-[#272757] transition-colors py-2"
                >
                  Back to My Quizzes
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
