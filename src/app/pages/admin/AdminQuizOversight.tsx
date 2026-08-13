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
  id: number; title: string; teacher: string; class: string;
  created: string; deadline: string; status: QuizStatus;
  submissions: number; flagged: boolean;
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
            teacher: q.teacher || q.teacherName || "—",
            class: q.class || q.className || "—",
            created: q.created || q.createdAt || "—",
            deadline: q.deadline || "—",
            status: (q.status === "closed" || q.status === "completed" ? "closed" : "active") as QuizStatus,
            submissions: q.submissions ?? q.submissionCount ?? 0,
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

  return (
    <AppShell role="admin" pageTitle="Quiz Oversight">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Admin Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz Oversight</h1>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${quizzes.length} quizzes across platform`}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: filterCounts.all, color: "text-gray-800" },
            { label: "Active", value: filterCounts.active, color: "text-[#43E6B5]" },
            { label: "Closed", value: filterCounts.closed, color: "text-gray-500" },
            { label: "Flagged", value: filterCounts.flagged, color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="bg-white rounded-2xl p-5 shadow-md text-center">
              <p className="text-gray-500 text-sm mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          {(["all", "flagged", "active", "closed"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? "bg-[#6C63FF] text-white"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-[#6C63FF]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Quiz list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card className="bg-white rounded-2xl p-12 shadow-md text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">No quizzes in this category</h3>
              <p className="text-gray-500">Try a different filter</p>
            </Card>
          )}
          {filtered.map((q) => (
            <Card key={q.id} className={`bg-white rounded-2xl p-6 shadow-md ${q.flagged ? "border-2 border-red-200" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {q.flagged && <Flag className="w-5 h-5 text-red-500 mt-1 shrink-0" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{q.title}</h3>
                      {q.flagged && (
                        <Badge className="bg-red-100 text-red-600 rounded-full text-xs">Flagged for Review</Badge>
                      )}
                      <Badge className={`rounded-full text-xs ${
                        q.status === "active" ? "bg-[#43E6B5]/10 text-[#43E6B5]" : "bg-gray-100 text-gray-500"
                      }`}>
                        {q.status === "active" ? "✓ Active" : "✕ Closed"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span>{q.teacher}</span>
                      <span>·</span>
                      <span>Class: {q.class}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {q.submissions} submissions</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due {q.deadline}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/teacher/results/${q.id}`)}
                    variant="outline"
                    className="border-2 border-[#6C63FF] text-[#6C63FF] rounded-xl gap-1"
                  >
                    <BarChart3 className="w-4 h-4" /> View Results
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toggleFlag(q.id)}
                    className={`rounded-xl gap-1 ${
                      q.flagged
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
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
