import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

export function StudentResults() {
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
        // Support both flattened API shape and raw submission payload
        const answerRows = Array.isArray(d.questions)
          ? d.questions
          : Array.isArray(d.answers)
            ? d.answers
            : [];
        setMockResults({
          quizTitle: d.quizTitle || d.title || d.quiz?.title || "Quiz Results",
          subject: d.subject || d.quiz?.subject || "",
          score: Number(d.score ?? 0),
          totalQuestions: d.totalQuestions || answerRows.length || 0,
          correctAnswers: d.correctAnswers ?? d.correctCount ?? 0,
          timeTaken:
            d.timeTaken ||
            (d.timeTakenSeconds != null
              ? `${Math.floor(d.timeTakenSeconds / 60)} min ${d.timeTakenSeconds % 60} sec`
              : "—"),
          classRank: d.classRank || "—",
          classAverage: d.classAverage ?? d.classAvg ?? 0,
          questions: answerRows.map((q: any, index: number) => {
            const question = q.question?.question || q.question || q.questionText || `Question ${index + 1}`;
            const yourAnswer =
              q.yourAnswer ??
              (typeof q.answer === "object" && q.answer !== null
                ? JSON.stringify(q.answer)
                : q.answer);
            return {
              id: q.id || q.questionId || index,
              question: typeof question === "string" ? question : String(question),
              yourAnswer:
                yourAnswer == null || yourAnswer === ""
                  ? "—"
                  : String(yourAnswer),
              correct: !!(q.correct ?? q.isCorrect),
              correctAnswer: q.correctAnswer
                ? String(q.correctAnswer)
                : undefined,
              aiFeedback: q.aiFeedback || "Graded by QuizMind AI.",
            };
          }),
        });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  if (loading) {
    return (
      <AppShell role="student" pageTitle="Quiz Results">
        <div className="text-gray-600">Loading results…</div>
      </AppShell>
    );
  }
  if (!mockResults) {
    return (
      <AppShell role="student" pageTitle="Quiz Results">
        <div className="text-gray-600">No results found</div>
      </AppShell>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-[#272757]";
    if (score >= 70) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", bg: "bg-emerald-50", color: "text-emerald-700" };
    if (score >= 80) return { text: "Great Job", bg: "bg-[#EDE9FE]", color: "text-[#272757]" };
    if (score >= 70) return { text: "Good Effort", bg: "bg-amber-50", color: "text-amber-700" };
    return { text: "Keep Trying", bg: "bg-red-50", color: "text-red-600" };
  };

  const scoreBadge = getScoreBadge(mockResults.score);

  return (
    <AppShell role="student" pageTitle="Quiz Results">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/student")}
          className="rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#272757]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#0F0E47]">Quiz Results</h1>
            <p className="text-xs font-medium text-gray-500">{mockResults.quizTitle} - {mockResults.subject}</p>
          </div>
        </div>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Badge className={`${scoreBadge.bg} ${scoreBadge.color} rounded-full mb-3 text-base px-4 py-1`}>
              {scoreBadge.text}
            </Badge>
            <h2 className="text-5xl font-semibold mb-2">
              <span className={getScoreColor(mockResults.score)}>{mockResults.score}%</span>
            </h2>
            <p className="text-gray-600 text-lg">
              {mockResults.correctAnswers} out of {mockResults.totalQuestions} correct
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-[#272757]" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Time Taken</p>
              <p className="font-semibold text-[#0F0E47]">{mockResults.timeTaken}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Class Rank</p>
              <p className="font-semibold text-[#0F0E47]">{mockResults.classRank}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Class Avg</p>
              <p className="font-semibold text-[#0F0E47]">{mockResults.classAverage}%</p>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-[#0F0E47] mb-4">
          Question Breakdown
        </h2>
        <div className="space-y-4">
          {mockResults.questions.map((q: any, index: number) => (
            <Card key={q.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {q.correct ? (
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Badge className="bg-gray-100 text-gray-600 rounded-full mb-2">
                        Question {index + 1}
                      </Badge>
                      <p className="font-semibold text-[#0F0E47] mb-2">{q.question}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                      <p className="text-[#0F0E47]">{q.yourAnswer}</p>
                    </div>

                    {!q.correct && q.correctAnswer && (
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-sm text-emerald-700 mb-1">Correct Answer:</p>
                        <p className="text-[#0F0E47]">{q.correctAnswer}</p>
                      </div>
                    )}

                    <div className={`${q.correct ? "bg-emerald-50" : "bg-[#EDE9FE]"} rounded-xl p-4`}>
                      <div className="flex items-start gap-2">
                        <Sparkles className={`w-4 h-4 ${q.correct ? "text-emerald-600" : "text-[#272757]"} mt-0.5`} />
                        <div>
                          <p className={`text-sm ${q.correct ? "text-emerald-700" : "text-[#272757]"} font-semibold mb-1`}>
                            AI Feedback:
                          </p>
                          <p className="text-gray-700 text-sm">{q.aiFeedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center mt-8">
        <Button
          onClick={() => navigate("/student")}
          className="bg-[#272757] hover:bg-[#505081] text-white px-8 py-6 rounded-xl text-lg font-semibold"
        >
          Back to Dashboard
        </Button>
        <Button
          variant="outline"
          className="border border-gray-200 text-[#272757] hover:bg-gray-50 px-8 py-6 rounded-xl text-lg font-semibold"
        >
          Try Again
        </Button>
      </div>
    </AppShell>
  );
}
