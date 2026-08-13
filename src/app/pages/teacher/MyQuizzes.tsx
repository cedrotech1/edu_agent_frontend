import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { AppShell } from "../../components/AppShell";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

type QuizStatus = "active" | "draft" | "closed" | "scheduled";

interface Quiz {
  id: number;
  title: string;
  className: string;
  subject: string;
  grade: string;
  questions: number;
  deadline: string;
  status: QuizStatus;
  submissions: number;
}

const PAGE_SIZE = 10;

const statusMeta: Record<QuizStatus, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "bg-[#10B981]/10 text-[#10B981]" },
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-500" },
  closed:    { label: "Closed",    cls: "bg-red-50 text-red-400" },
  scheduled: { label: "Scheduled", cls: "bg-[#F59E0B]/15 text-yellow-600" },
};

function normalizeStatus(raw?: string): QuizStatus {
  const s = (raw || "draft").toLowerCase();
  if (s === "active" || s === "published" || s === "open") return "active";
  if (s === "scheduled" || s === "upcoming") return "scheduled";
  if (s === "closed" || s === "completed" || s === "archived") return "closed";
  return "draft";
}

function mapQuiz(row: any): Quiz {
  return {
    id: row.id,
    title: row.title || "Untitled quiz",
    className: row.className || row.class || "—",
    subject: row.subject || "",
    grade: row.grade || row.subLevel || "",
    questions: Number(row.questions ?? row.questionCount ?? 0),
    deadline: row.deadline || row.createdAt || new Date().toISOString(),
    status: normalizeStatus(row.status),
    submissions: Number(row.submissions ?? row.submissionCount ?? 0),
  };
}

type SortKey = keyof Pick<Quiz, "title" | "className" | "questions" | "deadline" | "status">;

export function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [deleteBulkOpen, setDeleteBulkOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.list();
      const rows = (res.data as any[]) || [];
      setQuizzes(Array.isArray(rows) ? rows.map(mapQuiz) : []);
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

  const classes = Array.from(new Set(quizzes.map((q) => q.className).filter(Boolean)));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = quizzes.filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.className.toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === "all" || q.className === filterClass;
      const matchStatus = filterStatus === "all" || q.status === filterStatus;
      return matchSearch && matchClass && matchStatus;
    });
    result.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [quizzes, search, filterClass, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds = pageData.map((q) => q.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const toggleRow = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const togglePage = () =>
    setSelected((prev) =>
      allPageSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])],
    );

  const pendingAction = (label: string) => {
    toast.message(`${label} pending`, {
      description: "This action is not wired to an API yet.",
    });
  };

  const SortBtn = ({ col }: { col: SortKey }) => (
    <button onClick={() => handleSort(col)} className="ml-1 inline-flex items-center text-gray-400 hover:text-gray-600">
      <ArrowUpDown className={`w-3 h-3 ${sortKey === col ? "text-[#272757]" : ""}`} />
    </button>
  );

  const resetFilters = () => {
    setSearch("");
    setFilterClass("all");
    setFilterStatus("all");
    setPage(1);
  };

  const formatDeadline = (deadline: string) => {
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <AppShell role="teacher" pageTitle="My Quizzes">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {loading ? "Loading…" : `${quizzes.length} quizzes total`}
        </p>
        <Button
          onClick={() => navigate("/teacher/quiz-builder")}
          className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Quiz
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search quizzes…"
            className="pl-9 rounded-xl border border-gray-200 text-sm h-9"
          />
        </div>
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        <Select
          value={filterClass}
          onValueChange={(v) => {
            setFilterClass(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="rounded-xl border border-gray-200 h-9 text-sm w-40">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(v) => {
            setFilterStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="rounded-xl border border-gray-200 h-9 text-sm w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(statusMeta) as QuizStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {statusMeta[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || filterClass !== "all" || filterStatus !== "all") && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        {selected.length > 0 && (
          <button
            onClick={() => setDeleteBulkOpen(true)}
            className="ml-auto flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 border border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete {selected.length} selected
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(
          [
            { value: "all", label: "All", count: quizzes.length },
            { value: "active", label: "Active", count: quizzes.filter((q) => q.status === "active").length },
            { value: "draft", label: "Drafts", count: quizzes.filter((q) => q.status === "draft").length },
            { value: "scheduled", label: "Scheduled", count: quizzes.filter((q) => q.status === "scheduled").length },
            { value: "closed", label: "Closed", count: quizzes.filter((q) => q.status === "closed").length },
          ] as const
        ).map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => {
              setFilterStatus(value);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filterStatus === value
                ? "bg-[#272757] text-white border-[#272757]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#272757]/40 hover:text-[#272757]"
            }`}
          >
            {label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filterStatus === value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" role="region" aria-label="Quizzes table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px] qm-table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-4 py-3 w-10">
                  <button onClick={togglePage} className="text-gray-400 hover:text-[#272757]">
                    {allPageSelected ? <CheckSquare className="w-4 h-4 text-[#272757]" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Title <SortBtn col="title" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Class <SortBtn col="className" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Q's <SortBtn col="questions" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Deadline <SortBtn col="deadline" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status <SortBtn col="status" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Submitted
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
                    <p className="font-medium">Loading quizzes…</p>
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">
                      {quizzes.length === 0 ? "No quizzes yet" : "No quizzes match your filters"}
                    </p>
                    {quizzes.length === 0 ? (
                      <button
                        onClick={() => navigate("/teacher/quiz-builder")}
                        className="text-[#272757] text-xs mt-1 hover:underline"
                      >
                        Create your first quiz
                      </button>
                    ) : (
                      <button onClick={resetFilters} className="text-[#272757] text-xs mt-1 hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                pageData.map((q) => (
                  <tr
                    key={q.id}
                    className={`border-b border-gray-50 hover:bg-[#EDE9FE] transition-colors ${
                      selected.includes(q.id) ? "bg-[#EDE9FE]" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 w-10">
                      <button onClick={() => toggleRow(q.id)} className="text-gray-400 hover:text-[#272757]">
                        {selected.includes(q.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#272757]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800 max-w-[200px]">
                      <p className="truncate">{q.title}</p>
                      <p className="text-xs text-gray-400">
                        {q.subject}
                        {q.grade ? ` · ${q.grade}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[160px]">
                      <p className="truncate text-sm">{q.className}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-700 font-medium">{q.questions}</td>
                    <td className="px-4 py-3.5 text-center text-gray-600 text-xs whitespace-nowrap">
                      {formatDeadline(q.deadline)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge className={`rounded-full text-[11px] px-2.5 py-0.5 ${statusMeta[q.status].cls}`}>
                        {statusMeta[q.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-600 text-sm">{q.submissions}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="View results"
                          onClick={() => navigate(`/teacher/results/${q.id}`)}
                          className="p-1.5 text-gray-400 hover:text-[#272757] hover:bg-[#EDE9FE] rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Edit quiz"
                          onClick={() => navigate("/teacher/quiz-builder")}
                          className="p-1.5 text-gray-400 hover:text-[#272757] hover:bg-[#EDE9FE] rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Duplicate (pending)"
                          onClick={() => pendingAction("Duplicate quiz")}
                          className="p-1.5 text-gray-400 hover:text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete (pending)"
                          onClick={() => pendingAction("Delete quiz")}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    p === page ? "bg-[#272757] text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {deleteBulkOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl p-7 shadow-2xl w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Delete {selected.length} quizzes?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bulk delete is not available yet (API pending).
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteBulkOpen(false)}
                className="flex-1 border border-gray-200 rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setDeleteBulkOpen(false);
                  pendingAction("Bulk delete");
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm"
              >
                Understood
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
