import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Flag, BarChart3, Filter, BookOpen, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

type QuizStatus = "active" | "closed";
type FilterType = "all" | "flagged" | "active" | "closed";

interface OversightQuiz {
  id: number;
  title: string;
  teacher: string;
  class: string;
  created: string;
  deadline: string;
  status: QuizStatus;
  submissions: number;
  flagged: boolean;
}

function formatDateTime(value?: string | null) {
  if (!value || value === "—") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminQuizOversight() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<OversightQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.quizzes();
        const rows = (res.data as any[]) || [];
        setQuizzes(
          (Array.isArray(rows) ? rows : []).map((q: any) => ({
            id: q.id,
            title: q.title,
            teacher:
              typeof q.teacher === "string"
                ? q.teacher
                : q.teacher?.names || q.teacherName || "—",
            class:
              typeof q.class === "string"
                ? q.class
                : q.class?.name || q.className || "—",
            created: q.created || q.createdAt || "—",
            deadline: q.deadline || "—",
            status: (q.status === "closed" || q.status === "completed" ? "closed" : "active") as QuizStatus,
            submissions: Number(
              q.submissionCount ??
                (Array.isArray(q.submissions) ? q.submissions.length : q.submissions) ??
                0
            ),
            flagged: Boolean(q.flagged),
          }))
        );
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = quizzes.filter((q) => {
    if (filter === "flagged") return q.flagged;
    if (filter === "active") return q.status === "active" && !q.flagged;
    if (filter === "closed") return q.status === "closed";
    return true;
  });

  const toggleFlag = async (id: number) => {
    const q = quizzes.find((x) => x.id === id);
    if (!q) return;
    const next = !q.flagged;
    try {
      await api.admin.flagQuiz(id, next);
      setQuizzes((prev) => prev.map((x) => (x.id === id ? { ...x, flagged: next } : x)));
      toast[next ? "warning" : "success"](next ? "Quiz flagged for review" : "Flag removed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update flag");
    }
  };

  const filterCounts = {
    all: quizzes.length,
    flagged: quizzes.filter((q) => q.flagged).length,
    active: quizzes.filter((q) => q.status === "active").length,
    closed: quizzes.filter((q) => q.status === "closed").length,
  };

  const stats = [
    { label: "Total", value: filterCounts.all, valueColor: "text-[#0F0E47]", iconBg: "bg-gray-50", iconColor: "text-[#272757]" },
    { label: "Active", value: filterCounts.active, valueColor: "text-emerald-700", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Closed", value: filterCounts.closed, valueColor: "text-gray-600", iconBg: "bg-gray-50", iconColor: "text-gray-500" },
    { label: "Flagged", value: filterCounts.flagged, valueColor: "text-red-600", iconBg: "bg-red-50", iconColor: "text-red-500" },
  ];

  return (
    <AppShell role="admin" pageTitle="Quiz Oversight">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-xl h-9 px-3 text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Admin Dashboard
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-[#0F0E47]">Quiz Oversight</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "Loading…" : `${quizzes.length} quizzes across platform`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, valueColor, iconBg, iconColor }) => (
          <Card key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                <BookOpen className={`w-4 h-4 ${iconColor}`} strokeWidth={1.75} />
              </div>
            </div>
            <p className={`text-3xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {(["all", "flagged", "active", "closed"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-[#272757] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filter === f ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {filterCounts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-gray-300" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No quizzes in this category</h3>
            <p className="text-xs text-gray-500">Try a different filter</p>
          </Card>
        )}
        {filtered.map((q) => (
          <Card
            key={q.id}
            className={`bg-white rounded-xl border shadow-sm p-5 ${
              q.flagged ? "border-red-200" : "border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {q.flagged && <Flag className="w-4 h-4 text-red-500 mt-1 shrink-0" strokeWidth={1.75} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-[#0F0E47]">{q.title}</h3>
                    {q.flagged && (
                      <Badge className="bg-red-50 text-red-600 rounded-full text-[11px]">
                        Flagged for Review
                      </Badge>
                    )}
                    <Badge
                      className={`rounded-full text-[11px] ${
                        q.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {q.status === "active" ? "Active" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span>{q.teacher}</span>
                    <span>·</span>
                    <span>{q.class}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {q.submissions} submissions
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due {formatDateTime(q.deadline)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => navigate(`/admin/quiz/${q.id}/submissions`)}
                  variant="outline"
                  className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl gap-1 h-9"
                >
                  <BarChart3 className="w-4 h-4" /> View Results
                </Button>
                <Button
                  size="sm"
                  onClick={() => toggleFlag(q.id)}
                  className={`rounded-xl gap-1 h-9 ${
                    q.flagged
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {q.flagged ? "Unflag" : "Flag"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
