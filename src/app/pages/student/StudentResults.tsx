import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600">Loading results…</div>;
  if (!mockResults) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600">No results found</div>;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-[#43E6B5]";
    if (score >= 80) return "text-[#4FC3F7]";
    if (score >= 70) return "text-[#FFD166]";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent! 🌟", bg: "bg-[#43E6B5]/10", color: "text-[#43E6B5]" };
    if (score >= 80) return { text: "Great Job! 👏", bg: "bg-[#4FC3F7]/10", color: "text-[#4FC3F7]" };
    if (score >= 70) return { text: "Good Effort! 💪", bg: "bg-[#FFD166]/10", color: "text-[#FFD166]" };
    return { text: "Keep Trying! 📚", bg: "bg-red-100", color: "text-red-600" };
  };

  const scoreBadge = getScoreBadge(mockResults.score);

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/student")}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#4FC3F7]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Quiz Results</h1>
                <p className="text-sm text-gray-600">{mockResults.quizTitle} - {mockResults.subject}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Summary */}
        <Card className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <Badge className={`${scoreBadge.bg} ${scoreBadge.color} rounded-full mb-3 text-base px-4 py-1`}>
                {scoreBadge.text}
              </Badge>
              <h2 className="text-5xl font-bold mb-2 ${getScoreColor(mockResults.score)}">
                <span className={getScoreColor(mockResults.score)}>{mockResults.score}%</span>
              </h2>
              <p className="text-gray-600 text-lg">
                {mockResults.correctAnswers} out of {mockResults.totalQuestions} correct
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <Clock className="w-8 h-8 text-[#6C63FF] mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Time Taken</p>
                <p className="font-semibold text-gray-800">{mockResults.timeTaken}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md">
                <Award className="w-8 h-8 text-[#FFD166] mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Class Rank</p>
                <p className="font-semibold text-gray-800">{mockResults.classRank}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md">
                <Sparkles className="w-8 h-8 text-[#43E6B5] mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Class Avg</p>
                <p className="font-semibold text-gray-800">{mockResults.classAverage}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Question Breakdown */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Question Breakdown
          </h2>
          <div className="space-y-4">
            {mockResults.questions.map((q, index) => (
              <Card key={q.id} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {q.correct ? (
                      <div className="w-10 h-10 bg-[#43E6B5]/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-[#43E6B5]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
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
                        <p className="font-semibold text-gray-800 mb-2">{q.question}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                        <p className="text-gray-800">{q.yourAnswer}</p>
                      </div>

                      {!q.correct && q.correctAnswer && (
                        <div className="bg-[#43E6B5]/10 rounded-xl p-4">
                          <p className="text-sm text-[#43E6B5] mb-1">Correct Answer:</p>
                          <p className="text-gray-800">{q.correctAnswer}</p>
                        </div>
                      )}

                      <div className={`${q.correct ? 'bg-[#43E6B5]/10' : 'bg-[#4FC3F7]/10'} rounded-xl p-4`}>
                        <div className="flex items-start gap-2">
                          <Sparkles className={`w-4 h-4 ${q.correct ? 'text-[#43E6B5]' : 'text-[#4FC3F7]'} mt-0.5`} />
                          <div>
                            <p className={`text-sm ${q.correct ? 'text-[#43E6B5]' : 'text-[#4FC3F7]'} font-semibold mb-1`}>
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

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={() => navigate("/student")}
            className="bg-[#6C63FF] hover:bg-[#5851E6] text-white px-8 py-6 rounded-2xl text-lg font-semibold"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            className="border-2 border-[#4FC3F7] text-[#4FC3F7] hover:bg-[#4FC3F7]/10 px-8 py-6 rounded-2xl text-lg font-semibold"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
