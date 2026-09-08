import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Loader2,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { api, ApiError, type UserRole } from "@/lib/api";

export function SubmissionDetailPage({ role }: { role: UserRole }) {
  const { submissionId, quizId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const backPath =
    role === "admin"
      ? quizId
        ? `/admin/quiz/${quizId}/submissions`
        : "/admin/quiz-oversight"
      : role === "teacher"
        ? quizId
          ? `/teacher/results/${quizId}`
          : "/teacher/results"
        : `/student/results/${quizId || data?.quizId || ""}`;

  useEffect(() => {
    if (!submissionId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.quizzes.submissionDetail(submissionId);
        setData(res.data || null);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load submission");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId]);

  if (loading) {
    return (
      <AppShell role={role} pageTitle="Submission details">
        <div className="flex items-center gap-2 text-gray-500 py-16 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell role={role} pageTitle="Submission details">
        <p className="text-gray-500">Submission not found.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate(backPath)}>
          Back
        </Button>
      </AppShell>
    );
  }

  const score = Number(data.score ?? 0);
  const questions = Array.isArray(data.questions) ? data.questions : [];

  return (
    <AppShell role={role} pageTitle="Submission details">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button variant="ghost" onClick={() => navigate(backPath)} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-[#0F0E47]">{data.quizTitle || data.title}</h1>
          <p className="text-xs text-gray-500">
            {data.studentName}
            {data.studentEmail ? ` · ${data.studentEmail}` : ""}
            {data.className ? ` · ${data.className}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Score
          </p>
          <p className="text-2xl font-semibold text-[#0F0E47]">{score}%</p>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Correct</p>
          <p className="text-2xl font-semibold text-[#0F0E47]">
            {data.correctAnswers ?? data.correctCount ?? 0}/{data.totalQuestions ?? questions.length}
          </p>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Time
          </p>
          <p className="text-lg font-semibold text-[#0F0E47]">{data.timeTaken || "—"}</p>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Access</p>
          <Badge
            className={`rounded-full text-xs ${
              data.accessMethod === "quiz_code"
                ? "bg-amber-50 text-amber-700"
                : "bg-[#EDE9FE] text-[#272757]"
            }`}
          >
            {data.accessLabel || "—"}
          </Badge>
          {data.submittedAt && (
            <p className="text-[11px] text-gray-400 mt-2">
              {new Date(data.submittedAt).toLocaleString()}
            </p>
          )}
        </Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#0F0E47]">Answers</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {questions.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">No answers recorded</p>
          ) : (
            questions.map((q: any, i: number) => {
              const ok = !!(q.correct ?? q.isCorrect);
              return (
                <div key={q.id || i} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {ok ? (
                        <CheckCircle className="w-4 h-4" strokeWidth={1.75} />
                      ) : (
                        <XCircle className="w-4 h-4" strokeWidth={1.75} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium text-[#0F0E47]">
                          Q{i + 1}. {q.question}
                        </p>
                        {q.flagged && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                            <Flag className="w-3 h-3" /> Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Student answer:{" "}
                        <span className="text-gray-800 font-medium">{q.yourAnswer || "—"}</span>
                      </p>
                      {q.correctAnswer && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Correct: <span className="text-emerald-700">{q.correctAnswer}</span>
                        </p>
                      )}
                      {q.aiFeedback && (
                        <p className="text-xs text-[#272757] mt-2 bg-[#EDE9FE]/50 rounded-lg px-3 py-2">
                          {q.aiFeedback}
                          {q.confidence != null ? ` · confidence ${q.confidence}%` : ""}
                          {q.aiScore != null ? ` · AI score ${q.aiScore}%` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </AppShell>
  );
}

export function AdminSubmissionDetail() {
  return <SubmissionDetailPage role="admin" />;
}

export function TeacherSubmissionDetail() {
  return <SubmissionDetailPage role="teacher" />;
}
