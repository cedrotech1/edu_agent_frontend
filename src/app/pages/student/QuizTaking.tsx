import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { Clock, Sparkles, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { getQuizAccessCode, clearQuizAccessCode } from "@/lib/quizAccess";

interface QuizQuestion {
  id: number;
  type: "mcq" | "short" | "truefalse";
  question: string;
  options?: string[];
}

interface QuizData {
  id: number;
  title: string;
  class?: string;
  className?: string;
  subject?: string;
  teacher?: string;
  teacherName?: string;
  timeLimit?: number;
  deadline?: string;
  status?: string;
  hasSubmitted?: boolean;
  accessMethod?: string;
  accessLabel?: string;
  questions: QuizQuestion[];
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

export function QuizTaking() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<"lobby" | "taking" | "submitted">("lobby");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      try {
        const accessCode = getQuizAccessCode(quizId);
        const res = await api.quizzes.get(quizId, { accessCode });
        const data = res.data as QuizData & Record<string, unknown>;
        if (data.hasSubmitted) {
          navigate(`/student/results/${quizId}`, { replace: true });
          return;
        }
        setQuiz({
          ...data,
          teacher: asLabel(data.teacherName ?? data.teacher),
          teacherName: asLabel(data.teacherName ?? data.teacher),
          class: asLabel(data.className ?? data.class),
          className: asLabel(data.className ?? data.class),
          questions: Array.isArray(data.questions) ? data.questions : [],
        });
        setTimeLeft((data.timeLimit || 30) * 60);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to load quiz";
        toast.error(message);
        if (err instanceof ApiError && err.status === 403) {
          navigate("/student/quizzes", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, navigate]);

  useEffect(() => {
    if (stage === "taking") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            void submitQuiz(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const isClosed = quiz?.status === "closed" || quiz?.status === "completed";
  const isLow = timeLeft < 5 * 60;

  const submitQuiz = async (auto = false) => {
    if (!quizId || submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const timeTakenSeconds = startedAt
        ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
        : undefined;
      await api.quizzes.submit(quizId, {
        answers,
        timeTakenSeconds,
        accessCode: getQuizAccessCode(quizId),
      });
      clearQuizAccessCode(quizId);
      setStage("submitted");
      if (!auto) toast.success("Quiz submitted!");
      setTimeout(() => navigate(`/student/results/${quizId}`), 1500);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit quiz");
      setStage("taking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = () => {
    setStartedAt(Date.now());
    setStage("taking");
  };

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600">
        Loading quiz…
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF]">
        <Card className="p-8 rounded-2xl text-center">
          <p className="mb-4 text-gray-600">Quiz not found</p>
          <Button onClick={() => navigate("/student")}>Back</Button>
        </Card>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center w-full max-w-lg">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Closed ⏳</h1>
          <p className="text-gray-600 mb-8">This quiz is no longer accepting submissions.</p>
          <button
            onClick={() => navigate("/student")}
            className="bg-[#272757] hover:bg-[#505081] text-white px-8 py-4 rounded-2xl text-lg font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (stage === "lobby") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#272757]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-[#272757]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
            <p className="text-lg text-gray-600 mb-8">
              {asLabel(quiz.subject)} • {asLabel(quiz.teacherName || quiz.teacher)}
              {quiz.className || quiz.class
                ? ` • ${asLabel(quiz.className || quiz.class)}`
                : ""}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-2xl p-6">
                <Clock className="w-8 h-8 text-[#272757] mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Time Limit</p>
                <p className="text-2xl font-bold text-gray-800">{quiz.timeLimit || 30} min</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <Sparkles className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Questions</p>
                <p className="text-2xl font-bold text-gray-800">{quiz.questions.length}</p>
              </div>
            </div>

            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-gray-800 mb-1">Important Reminder</p>
                  <p className="text-sm text-gray-700">
                    Write answers in your own words. AI will detect copied content.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-[#272757] to-[#505081] hover:from-[#505081] hover:to-[#505081] text-white py-6 rounded-2xl text-lg font-semibold shadow-lg"
            >
              Start Quiz 🚀
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "submitted") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-24 h-24 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Sparkles className="w-12 h-12 text-[#10B981]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Submitted! 🎉</h1>
          <p className="text-xl text-gray-600 mb-8">
            {submitting ? "Submitting…" : "Your answers are being reviewed by AI 🤖"}
          </p>
          <Button
            onClick={() => navigate(`/student/results/${quizId}`)}
            className="bg-[#272757] hover:bg-[#505081] text-white px-8 py-6 rounded-2xl text-lg font-semibold"
          >
            View Results
          </Button>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isLow ? "bg-red-50 animate-pulse" : "bg-[#F59E0B]/10"}`}>
              <Clock className={`w-5 h-5 ${isLow ? "text-red-500" : "text-[#F59E0B]"}`} />
              <span className={`font-mono font-semibold ${isLow ? "text-red-500" : "text-gray-800"}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <Badge className="bg-[#272757]/10 text-[#272757] rounded-full mb-4">
            Question {currentQuestion + 1}
          </Badge>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">{question.question}</h2>

          {question.type === "mcq" && (
            <div className="space-y-3">
              {question.options?.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, index)}
                  className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all ${
                    answers[question.id] === index
                      ? "bg-[#272757]/10 border-[#272757] text-[#272757]"
                      : "bg-gray-50 border-gray-200 hover:border-[#272757]/50"
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === "short" && (
            <div>
              <Textarea
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full min-h-[200px] rounded-2xl border border-gray-200 focus:border-[#272757] px-4 py-4"
                placeholder="Type your answer here..."
              />
              <div className="mt-4 bg-[#272757]/10 border border-[#272757]/30 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#272757] mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Write in your own words — AI will review 🤖 No copy-paste allowed!
                  </p>
                </div>
              </div>
            </div>
          )}

          {question.type === "truefalse" && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(question.id, true)}
                className={`px-6 py-4 rounded-2xl border-2 font-semibold transition-all ${
                  answers[question.id] === true
                    ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981]"
                    : "bg-gray-50 border-gray-200 hover:border-[#10B981]/50"
                }`}
              >
                True
              </button>
              <button
                onClick={() => handleAnswer(question.id, false)}
                className={`px-6 py-4 rounded-2xl border-2 font-semibold transition-all ${
                  answers[question.id] === false
                    ? "bg-[#FF6B6B]/10 border-[#FF6B6B] text-[#FF6B6B]"
                    : "bg-gray-50 border-gray-200 hover:border-[#FF6B6B]/50"
                }`}
              >
                False
              </button>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-2 border-gray-300 rounded-xl px-6 py-3"
          >
            Previous
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={() => submitQuiz(false)}
              disabled={submitting}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-semibold"
            >
              {submitting ? "Submitting…" : "Submit Quiz 🎉"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-[#272757] hover:bg-[#505081] text-white px-6 py-3 rounded-xl"
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
