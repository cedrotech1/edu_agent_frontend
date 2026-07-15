import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Logo } from "../../components/Logo";
import {
  Clock,
  TrendingUp,
  Trophy,
  Calendar,
  Target,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { NotificationsPanel } from "../../components/NotificationsPanel";
import { api, initials, ApiError } from "@/lib/api";
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

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setJoinError("Please enter a quiz or class code");
      return;
    }
    setJoining(true);
    setJoinError("");
    try {
      const code = joinCode.trim().toUpperCase();
      if (code.startsWith("QMIND")) {
        await api.classes.join(code);
        toast.success("Joined class!");
        setJoinCode("");
        await load();
        return;
      }
      const res = await api.quizzes.byCode(code);
      const quiz = res.data as { id: number; status?: string; closed?: boolean };
      if (quiz.status === "closed" || quiz.closed) {
        navigate("/student/quiz-closed");
        return;
      }
      navigate(`/student/quiz/${quiz.id}`);
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

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo variant="horizontal" size="sm" color="#4FC3F7" />
              <Badge className="bg-[#4FC3F7]/10 text-[#4FC3F7] rounded-full">
                Student
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsPanel role="student" />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <span className="text-gray-700 font-medium">{displayName}</span>
              <div
                className="w-10 h-10 bg-[#4FC3F7] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-4 hover:ring-[#4FC3F7]/20 transition-all"
                onClick={() => navigate("/student/settings")}
              >
                {initials(displayName)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-gray-500 mb-4">Loading…</p>}

        <Card className="bg-gradient-to-br from-[#4FC3F7] to-[#29B5E8] text-white rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {firstName}! 👋</h2>
              <p className="text-white/90 text-lg">
                You have {upcoming.length} upcoming quizzes
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Average Score</p>
                <h3 className="text-3xl font-bold text-[#6C63FF]">{averageScore || 0}%</h3>
              </div>
              <TrendingUp className="w-10 h-10 text-[#6C63FF]/30" />
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Quizzes Completed</p>
                <h3 className="text-3xl font-bold text-[#43E6B5]">{completed.length}</h3>
              </div>
              <Target className="w-10 h-10 text-[#43E6B5]/30" />
            </div>
          </Card>

          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Upcoming</p>
                <h3 className="text-3xl font-bold text-[#FFD166]">{upcoming.length}</h3>
              </div>
              <Trophy className="w-10 h-10 text-[#FFD166]/30" />
            </div>
          </Card>
        </div>

        <Card className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Join Class or Quiz by Code
          </h3>
          <div className="flex gap-3">
            <Input
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinError("");
              }}
              placeholder="Enter class or quiz code"
              className={`flex-1 rounded-xl border-2 px-4 py-3 font-mono uppercase ${joinError ? "border-red-400" : "border-gray-200"}`}
            />
            <Button
              onClick={handleJoin}
              disabled={joining}
              className="bg-[#6C63FF] hover:bg-[#5851E6] text-white px-6 rounded-xl"
            >
              {joining ? "Joining…" : "Join 🚀"}
            </Button>
          </div>
          {joinError && <p className="text-red-500 text-sm mt-2">{joinError}</p>}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upcoming Quizzes</h2>
            <div className="space-y-4">
              {!loading && upcoming.length === 0 && (
                <Card className="bg-white rounded-2xl p-10 shadow-md text-center">
                  <div className="w-16 h-16 bg-[#4FC3F7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-[#4FC3F7]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No upcoming quizzes</h3>
                  <p className="text-gray-500">Your teacher hasn't assigned any quizzes yet — check back soon!</p>
                </Card>
              )}
              {upcoming.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#4FC3F7]"
                  onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        Class: {asLabel(quiz.className || quiz.class)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {asLabel(quiz.subject)} • {asLabel(quiz.teacherName || quiz.teacher)}
                      </p>
                    </div>
                    <Badge className="bg-[#FFD166]/10 text-[#FFD166] rounded-full">
                      {quiz.countdown || quiz.status || "open"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.timeLimit || "—"} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {quiz.questionCount ?? quiz.questions ?? "—"} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {quiz.dueDate || quiz.deadline || "—"}
                    </div>
                  </div>

                  <Button className="w-full bg-[#4FC3F7] hover:bg-[#29B5E8] text-white py-3 rounded-xl">
                    Start Quiz 🚀
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Completed Quizzes</h2>
            <div className="space-y-4">
              {!loading && completed.length === 0 && (
                <Card className="bg-white rounded-2xl p-10 shadow-md text-center">
                  <div className="w-16 h-16 bg-[#43E6B5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-[#43E6B5]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No results yet</h3>
                  <p className="text-gray-500">Complete your first quiz to see your scores here</p>
                </Card>
              )}
              {completed.map((quiz) => {
                const id = quiz.quizId || quiz.id;
                return (
                  <Card
                    key={`${id}-${quiz.id}`}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/student/results/${id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{quiz.title}</h3>
                        <p className="text-sm text-gray-600">
                          {quiz.subject || "—"} • {quiz.date || quiz.submittedAt || "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-3xl font-bold ${
                            quiz.score >= 90
                              ? "text-[#43E6B5]"
                              : quiz.score >= 80
                              ? "text-[#4FC3F7]"
                              : "text-[#FFD166]"
                          }`}
                        >
                          {quiz.score}%
                        </div>
                        <Badge
                          className={`mt-1 rounded-full ${
                            quiz.score >= 90
                              ? "bg-[#43E6B5]/10 text-[#43E6B5]"
                              : quiz.score >= 80
                              ? "bg-[#4FC3F7]/10 text-[#4FC3F7]"
                              : "bg-[#FFD166]/10 text-[#FFD166]"
                          }`}
                        >
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
      </div>
    </div>
  );
}
