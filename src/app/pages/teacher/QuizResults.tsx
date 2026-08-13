import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ArrowLeft, Sparkles, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";
import { AppShell } from "../../components/AppShell";

export function QuizResults() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [mockStudents, setMockStudents] = useState<any[]>([]);
  const [mockQuestionStats, setMockQuestionStats] = useState<any[]>([]);
  const [quizMeta, setQuizMeta] = useState({ title: "Quiz Results", className: "" });
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.quizzes.results(quizId);
        const d: any = res.data || {};
        const classLabel =
          typeof d.className === "string"
            ? d.className
            : typeof d.class === "string"
              ? d.class
              : d.class?.name || d.quiz?.className || "";
        setQuizMeta({
          title: d.title || d.quizTitle || d.quiz?.title || "Quiz Results",
          className: classLabel,
        });
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
            };
          })
        );
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
        toast.error(err instanceof ApiError ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const averageScore = mockStudents.length
    ? Math.round(mockStudents.reduce((sum, s) => sum + s.score, 0) / mockStudents.length)
    : 0;

  const handleExportResults = () => {
    toast.success("Results exported successfully!", {
      description: "The quiz results have been downloaded as CSV.",
    });
  };

  if (loading) {
    return (
      <AppShell role="teacher" pageTitle="Quiz Results">
        <div className="flex items-center justify-center text-gray-600 py-16">Loading results…</div>
      </AppShell>
    );
  }

  return (
    <AppShell role="teacher" pageTitle="Quiz Results">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/teacher")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#6C63FF]" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Quiz Results</h2>
              <p className="text-sm text-gray-600">{quizMeta.title}{quizMeta.className ? ` - ${quizMeta.className}` : ""}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleExportResults}
          className="bg-[#43E6B5] hover:bg-[#2DD49E] text-white rounded-xl px-6 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Results
        </Button>
      </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Total Students</p>
            <h3 className="text-3xl font-bold text-gray-800">{mockStudents.length}</h3>
          </Card>

          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Average Score</p>
            <h3 className="text-3xl font-bold text-[#6C63FF]">{averageScore}%</h3>
          </Card>

          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Pass Rate</p>
            <h3 className="text-3xl font-bold text-[#43E6B5]">
              {mockStudents.length
                ? Math.round(
                    (mockStudents.filter((s) => s.status === "pass").length /
                      mockStudents.length) *
                      100
                  )
                : 0}
              %
            </h3>
          </Card>

          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Needs Review</p>
            <h3 className="text-3xl font-bold text-[#FFD166]">{flaggedCount}</h3>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Results */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Student Results</h2>
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <div className="space-y-4">
                {mockStudents.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No submissions yet</p>
                )}
                {mockStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#6C63FF] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {initials(student.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          Time: {student.timeTaken} • AI Confidence: {student.aiConfidence}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-800">{student.score}%</span>
                      {student.status === "pass" ? (
                        <CheckCircle className="w-6 h-6 text-[#43E6B5]" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Question Analytics */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Question Analytics</h2>
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              {mockQuestionStats.length === 0 ? (
                <p className="text-gray-500 text-center py-16">
                  Analytics appear after students submit
                </p>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockQuestionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="question" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="correct" fill="#43E6B5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="incorrect" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#43E6B5] rounded"></div>
                  <span className="text-sm text-gray-600">Correct answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#FF6B6B] rounded"></div>
                  <span className="text-sm text-gray-600">Incorrect answers</span>
                </div>
              </div>
            </Card>

            {/* AI Grading Review */}
            <Card className="bg-white rounded-2xl p-6 shadow-md mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6C63FF]" />
                AI Grading Overview
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#43E6B5]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#43E6B5]" />
                    <span className="text-gray-700">Submissions graded</span>
                  </div>
                  <span className="font-semibold text-gray-800">{mockStudents.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FFD166]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#FFD166]" />
                    <span className="text-gray-700">Needs review (flagged)</span>
                  </div>
                  <span className="font-semibold text-gray-800">{flaggedCount}</span>
                </div>

                <Button
                  onClick={() => navigate(`/teacher/results/${quizId}/flagged`)}
                  className="w-full mt-4 bg-[#6C63FF] hover:bg-[#5851E6] text-white py-3 rounded-xl"
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