import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Users,
  TrendingUp,
  Percent,
  Flag,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";
import { AppShell } from "../../components/AppShell";

export function QuizResults() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [mockStudents, setMockStudents] = useState<any[]>([]);
  const [mockQuestionStats, setMockQuestionStats] = useState<any[]>([]);
  const [quizMeta, setQuizMeta] = useState({
    title: "Quiz Results",
    className: "",
    classMemberCount: 0,
    joinCodeCount: 0,
    code: "",
  });
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      setAccessError(null);
      try {
        const res = await api.quizzes.results(quizId);
        const d: any = res.data || {};
        const classLabel =
          typeof d.className === "string"
            ? d.className
            : typeof d.class === "string"
              ? d.class
              : d.class?.name || d.quiz?.className || "";
        const students = d.students || d.submissions || [];
        setMockStudents(
          students.map((s: any) => {
            const name =
              (typeof s.name === "string" && s.name) ||
              s.studentName ||
              s.student?.name ||
              s.student?.names ||
              "Student";
            const score = Number(s.score ?? 0);
            return {
              id: s.id || s.studentId,
              name,
              score,
              status: s.status || (score >= 50 ? "pass" : "fail"),
              aiConfidence: s.aiConfidence ?? s.confidence ?? 0,
              timeTaken:
                s.timeTaken ||
                (s.timeTakenSeconds != null
                  ? `${Math.round(s.timeTakenSeconds / 60)} min`
                  : "—"),
              accessMethod: s.accessMethod || null,
              accessLabel:
                s.accessLabel ||
                (s.accessMethod === "quiz_code"
                  ? "Join code"
                  : s.accessMethod === "class_member"
                    ? "Assigned class"
                    : "—"),
            };
          })
        );
        setQuizMeta({
          title: d.title || d.quizTitle || d.quiz?.title || "Quiz Results",
          className: classLabel,
          classMemberCount: Number(d.classMemberCount || 0),
          joinCodeCount: Number(d.joinCodeCount || 0),
          code: d.code || d.quiz?.code || "",
        });
        const stats = Array.isArray(d.questionStats)
          ? d.questionStats
          : Array.isArray(d.questions)
            ? d.questions.filter(
                (q: any) =>
                  q &&
                  typeof q === "object" &&
                  ("correct" in q || "incorrect" in q) &&
                  typeof q.question === "string" &&
                  q.question.length <= 10
              )
            : [];
        setMockQuestionStats(stats);
        setFlaggedCount(d.flaggedCount ?? d.needsReview ?? 0);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to load results";
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          setAccessError(
            err.status === 403
              ? "You can only view results for quizzes you created."
              : "This quiz was not found."
          );
          toast.error(message);
        } else {
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const averageScore = mockStudents.length
    ? Math.round(mockStudents.reduce((sum, s) => sum + s.score, 0) / mockStudents.length)
    : 0;

  const passRate = mockStudents.length
    ? Math.round(
        (mockStudents.filter((s) => s.status === "pass").length / mockStudents.length) * 100
      )
    : 0;

  const handleExportResults = () => {
    toast.success("Results exported successfully!", {
      description: "The quiz results have been downloaded as CSV.",
    });
  };

  const stats = [
    {
      label: "Total Students",
      value: String(mockStudents.length),
      icon: Users,
      iconBg: "bg-gray-50",
      iconColor: "text-[#272757]",
      valueColor: "text-[#0F0E47]",
    },
    {
      label: "Average Score",
      value: `${averageScore}%`,
      icon: TrendingUp,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#272757]",
      valueColor: "text-[#272757]",
    },
    {
      label: "Pass Rate",
      value: `${passRate}%`,
      icon: Percent,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    {
      label: "Needs Review",
      value: String(flaggedCount),
      icon: Flag,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
    },
  ];

  if (loading) {
    return (
      <AppShell role="teacher" pageTitle="Quiz Results">
        <div className="flex items-center justify-center text-gray-500 py-16 text-sm">
          Loading results…
        </div>
      </AppShell>
    );
  }

  if (accessError) {
    return (
      <AppShell role="teacher" pageTitle="Quiz Results">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm max-w-lg mx-auto p-8 text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600" strokeWidth={1.75} />
          </div>
          <h2 className="text-base font-semibold text-[#0F0E47] mb-1">Can't open these results</h2>
          <p className="text-sm text-gray-500 mb-6">{accessError}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/results")}
              className="border border-gray-200 rounded-xl h-9 px-4 text-sm"
            >
              View my quizzes
            </Button>
            <Button
              onClick={() => navigate("/teacher/quiz-builder")}
              className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm"
            >
              Create a quiz
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell role="teacher" pageTitle="Quiz Results">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/teacher")}
            className="rounded-xl h-9 px-3 text-gray-600 hover:text-[#0F0E47] shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#0F0E47] truncate">{quizMeta.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {quizMeta.className ? `${quizMeta.className} · ` : ""}Quiz Results
            </p>
          </div>
        </div>
        <Button
          onClick={handleExportResults}
          variant="outline"
          className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-9 px-4 text-sm gap-2"
        >
          <Download className="w-4 h-4" strokeWidth={1.75} />
          Export Results
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
          <Card
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <p className="text-xs font-medium text-gray-500 leading-tight">{label}</p>
              <div
                className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.75} />
              </div>
            </div>
            <p className={`text-3xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Student Results */}
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-[#0F0E47]">Student Results</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>
                {mockStudents.length} submission{mockStudents.length === 1 ? "" : "s"}
              </span>
              {quizMeta.classMemberCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#272757]">
                  {quizMeta.classMemberCount} class
                </span>
              )}
              {quizMeta.joinCodeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  {quizMeta.joinCodeCount} via code
                </span>
              )}
            </div>
          </div>

          {mockStudents.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-gray-300" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No submissions yet</p>
              <p className="text-xs text-gray-400">
                Class members can open from My Quizzes. Others use the quiz join code
                {quizMeta.code ? ` (${quizMeta.code})` : ""}.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
              {mockStudents.map((student, i) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors ${
                    i % 2 === 1 ? "bg-[#FAFAFA]" : ""
                  }`}
                >
                  <div className="w-9 h-9 bg-[#272757] rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {initials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F0E47] truncate">{student.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {student.timeTaken} · AI confidence {student.aiConfidence}%
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      student.accessMethod === "quiz_code"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-[#EDE9FE] text-[#272757]"
                    }`}
                  >
                    {student.accessLabel || "—"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-base font-semibold text-[#0F0E47] tabular-nums">
                      {student.score}%
                    </span>
                    {student.status === "pass" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" strokeWidth={1.75} />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/teacher/results/${quizId}/submission/${student.id}`)
                      }
                      className="text-xs font-semibold text-[#272757] border border-gray-200 hover:bg-[#EDE9FE] rounded-lg px-2.5 py-1"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Analytics column */}
        <div className="space-y-5">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#0F0E47]">Question Analytics</h2>
            </div>
            <div className="p-5">
              {mockQuestionStats.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-5 h-5 text-gray-300" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">No analytics yet</p>
                  <p className="text-xs text-gray-400">
                    Charts appear after students submit answers.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mockQuestionStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="question"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #f3f4f6",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="correct" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="incorrect" fill="#F87171" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              <div className="mt-4 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-xs text-gray-500">Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                  <span className="text-xs text-gray-500">Incorrect</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#272757]" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold text-[#0F0E47]">AI Grading Overview</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                  <span className="text-sm text-gray-700">Submissions graded</span>
                </div>
                <span className="text-sm font-semibold text-[#0F0E47] tabular-nums">
                  {mockStudents.length}
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
                  <span className="text-sm text-gray-700">Needs review (flagged)</span>
                </div>
                <span className="text-sm font-semibold text-[#0F0E47] tabular-nums">
                  {flaggedCount}
                </span>
              </div>

              <Button
                onClick={() => navigate(`/teacher/results/${quizId}/flagged`)}
                className="w-full mt-1 bg-[#272757] hover:bg-[#505081] text-white h-10 rounded-xl text-sm"
              >
                Review Flagged Answers
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
