import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface QuizRow {
  id: number;
  title: string;
  className: string;
  status: string;
  submissions: number;
  createdAt?: string;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusCls(status: string) {
  const s = status.toLowerCase();
  if (s === "active" || s === "published" || s === "open") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (s === "draft") return "bg-gray-100 text-gray-500";
  if (s === "closed" || s === "completed") return "bg-[#EDE9FE] text-[#272757]";
  return "bg-amber-50 text-amber-700";
}

export function TeacherResults() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.list();
      const rows = (res.data as any[]) || [];
      setQuizzes(
        (Array.isArray(rows) ? rows : []).map((q) => ({
          id: q.id,
          title: q.title || "Untitled quiz",
          className: q.className || q.class || "—",
          status: q.status || "draft",
          submissions: Number(q.submissions ?? q.submissionCount ?? 0),
          createdAt: q.createdAt || q.deadline,
        }))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalSubs = quizzes.reduce((sum, q) => sum + q.submissions, 0);

  return (
    <AppShell role="teacher" pageTitle="Results and Analytics">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-[#0F0E47]">Results and Analytics</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Open a quiz to review scores, submissions, and question analytics
            </p>
          </div>
          <Button
            onClick={() => navigate("/teacher/quiz-builder")}
            className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Create quiz
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Your quizzes</p>
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[#272757]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#0F0E47]">{loading ? "—" : quizzes.length}</p>
          </Card>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Total submissions</p>
              <div className="w-8 h-8 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#272757]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#0F0E47]">{loading ? "—" : totalSubs}</p>
          </Card>
        </div>

        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#272757]" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-[#0F0E47]">Select a quiz</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin mb-3" />
              <p className="text-sm">Loading your quizzes…</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No quizzes yet</h3>
              <p className="text-xs text-gray-500 mb-5 max-w-sm">
                Create a quiz and share it with your class. Results will appear here once students submit.
              </p>
              <Button
                onClick={() => navigate("/teacher/quiz-builder")}
                className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Create your first quiz
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {quizzes.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/teacher/results/${q.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4 text-[#272757]" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#0F0E47] truncate">{q.title}</p>
                        <Badge className={`rounded-full text-[11px] capitalize ${statusCls(q.status)}`}>
                          {q.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {q.className} · {q.submissions} submission{q.submissions === 1 ? "" : "s"} ·{" "}
                        {formatDate(q.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
