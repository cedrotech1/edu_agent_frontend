import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Clock,
  TrendingUp,
  Trophy,
  Calendar,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface UpcomingQuiz {
  id: number;
  title: string;
  class?: string;
  className?: string;
  subject?: string;
  teacher?: string;
  teacherName?: string;
  timeLimit?: number;
  questions?: number;
  questionCount?: number;
  dueDate?: string;
  deadline?: string;
  countdown?: string;
  status?: string;
}

interface CompletedQuiz {
  id: number;
  quizId?: number;
  title: string;
  score: number;
  subject?: string;
  date?: string;
  submittedAt?: string;
}

function asLabel(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o.names === "string") return o.names;
    if (typeof o.name === "string") return o.name;
  }
  return "—";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function scoreTone(score: number) {
  if (score >= 90) return { text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-600" };
  if (score >= 80) return { text: "text-[#272757]", badge: "bg-[#EDE9FE] text-[#272757]" };
  return { text: "text-amber-600", badge: "bg-amber-50 text-amber-600" };
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [upcoming, setUpcoming] = useState<UpcomingQuiz[]>([]);
  const [completed, setCompleted] = useState<CompletedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [upRes, doneRes] = await Promise.all([
        api.quizzes.studentUpcoming(),
        api.quizzes.studentCompleted(),
      ]);
      const up = (upRes.data as UpcomingQuiz[]) || [];
      const done = (doneRes.data as CompletedQuiz[]) || [];
      setUpcoming(
        (Array.isArray(up) ? up : []).map((q) => ({
          ...q,
          teacher: asLabel(q.teacherName ?? q.teacher),
          teacherName: asLabel(q.teacherName ?? q.teacher),
          class: asLabel(q.className ?? q.class),
          className: asLabel(q.className ?? q.class),
        }))
      );
      setCompleted(Array.isArray(done) ? done : []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const averageScore = completed.length
    ? Math.round(completed.reduce((sum, q) => sum + (q.score || 0), 0) / completed.length)
    : 0;

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setJoinError("Enter a class code (QMIND-…) or quiz code (QZ-…)");
      return;
    }
    setJoining(true);
    setJoinError("");
    try {
      const code = joinCode.trim().toUpperCase();
      if (code.startsWith("QMIND")) {
        await api.classes.join(code);
        toast.success("Joined class! Class quizzes will appear in your list.");
        setJoinCode("");
        await load();
        return;
      }
      const res = await api.quizzes.byCode(code);
      const quiz = res.data as {
        id: number;
        status?: string;
        closed?: boolean;
        accessCode?: string;
      };
      if (quiz.status === "closed" || quiz.closed) {
        navigate("/student/quiz-closed");
        return;
      }
      const { rememberQuizAccessCode } = await import("@/lib/quizAccess");
      rememberQuizAccessCode(quiz.id, quiz.accessCode || code);
      toast.success("Quiz unlocked with join code");
      navigate(`/student/quiz/${quiz.id}/lobby`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Code not found. Please check and try again.";
      setJoinError(message);
    } finally {
      setJoining(false);
    }
  };

  const displayName = user?.name || "Student";
  const firstName = displayName.split(" ")[0];

  const stats = [
    { label: "Average Score", value: `${averageScore || 0}%`, icon: TrendingUp, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" },
    { label: "Quizzes Completed", value: String(completed.length), icon: Target, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Upcoming", value: String(upcoming.length), icon: Trophy, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <AppShell role="student" pageTitle="Dashboard">
      {loading && <p className="text-gray-500 mb-4">Loading…</p>}

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#0F0E47]">Welcome back, {firstName}</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            You have {upcoming.length} upcoming quiz{upcoming.length !== 1 ? "zes" : ""}
          </p>
          <div className="hidden md:flex w-12 h-12 bg-gray-50 rounded-lg items-center justify-center">
            <Trophy className="w-6 h-6 text-[#272757]" strokeWidth={1.75} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <Card key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
                <p className="text-3xl font-semibold text-[#0F0E47] tracking-tight">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-[18px] h-[18px] ${iconColor}`} strokeWidth={1.75} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#0F0E47]">Join with a code</h3>
          <p className="text-xs text-gray-500 mt-1">
            Class code (QMIND-…) enrolls you so assigned quizzes appear automatically. Quiz code (QZ-…) unlocks a shared quiz.
          </p>
        </div>
        <div className="p-5">
          <div className="flex gap-3">
            <Input
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinError("");
              }}
              placeholder="QMIND-1234 or QZ-1234"
              className={`flex-1 rounded-xl border px-4 py-3 font-mono uppercase ${joinError ? "border-red-400" : "border-gray-200"}`}
            />
            <Button
              onClick={handleJoin}
              disabled={joining}
              className="bg-[#272757] hover:bg-[#505081] text-white px-6 rounded-xl"
            >
              {joining ? "Joining…" : "Join"}
            </Button>
          </div>
          {joinError && <p className="text-red-500 text-sm mt-2">{joinError}</p>}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold text-[#0F0E47] mb-3">Upcoming Quizzes</h2>
          <div className="space-y-3">
            {!loading && upcoming.length === 0 && (
              <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No upcoming quizzes</h3>
                <p className="text-xs text-gray-500">Your teacher hasn't assigned any quizzes yet — check back soon!</p>
              </Card>
            )}
            {upcoming.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 hover:shadow transition-all cursor-pointer"
                onClick={() => navigate(`/student/quiz/${quiz.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">{quiz.title}</h3>
                    <p className="text-xs text-gray-500">
                      Class: {asLabel(quiz.className || quiz.class)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {asLabel(quiz.subject)} • {asLabel(quiz.teacherName || quiz.teacher)}
                    </p>
                  </div>
                  <Badge className="bg-amber-50 text-amber-600 rounded-full text-xs">
                    {quiz.countdown || quiz.status || "open"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.timeLimit || "—"} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {quiz.questionCount ?? quiz.questions ?? "—"} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateTime(quiz.dueDate || quiz.deadline)}
                  </div>
                </div>

                <Button className="w-full bg-[#272757] hover:bg-[#505081] text-white py-2.5 rounded-xl text-sm">
                  Start Quiz
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#0F0E47] mb-3">Completed Quizzes</h2>
          <div className="space-y-3">
            {!loading && completed.length === 0 && (
              <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No results yet</h3>
                <p className="text-xs text-gray-500">Complete your first quiz to see your scores here</p>
              </Card>
            )}
            {completed.map((quiz) => {
              const id = quiz.quizId || quiz.id;
              const tone = scoreTone(quiz.score);
              return (
                <Card
                  key={`${id}-${quiz.id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 hover:shadow transition-all cursor-pointer"
                  onClick={() => navigate(`/student/results/${id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">{quiz.title}</h3>
                      <p className="text-xs text-gray-500">
                        {quiz.subject || "—"} • {formatDate(quiz.date || quiz.submittedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-semibold ${tone.text}`}>
                        {quiz.score}%
                      </div>
                      <Badge className={`mt-1 rounded-full text-xs ${tone.badge}`}>
                        {quiz.score >= 90 ? "Excellent" : quiz.score >= 80 ? "Good" : "Fair"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
