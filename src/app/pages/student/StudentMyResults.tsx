import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  BarChart3,
  Eye,
  Trophy,
  Star,
  Zap,
  ClipboardList,
  Share2,
  Link2,
  Download,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface ResultRow {
  id: number;
  title: string;
  subject: string;
  class: string;
  teacher: string;
  dateTaken: string;
  score: number;
  timeTaken: string;
  submittedAt?: string;
}

type FilterTab = "all" | "week" | "month" | "science" | "mathematics" | "english" | "history";

const FILTERS: { value: FilterTab; label: string }[] = [
  { value: "all",         label: "All" },
  { value: "week",        label: "This Week" },
  { value: "month",       label: "This Month" },
  { value: "science",     label: "Science" },
  { value: "mathematics", label: "Mathematics" },
  { value: "english",     label: "English" },
  { value: "history",     label: "History" },
];

const scoreBadgeClass = (s: number) =>
  s >= 70 ? "bg-[#10B981]/10 text-[#10B981]" : s >= 50 ? "bg-[#F59E0B]/15 text-yellow-600" : "bg-red-50 text-red-500";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function StudentMyResults() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<{ title: string; score: number; class_: string; date: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.studentCompleted();
      const rows = (res.data as any[]) || [];
      setResults(
        (Array.isArray(rows) ? rows : []).map((r: any) => ({
          id: r.id || r.quizId,
          title: r.title || "Quiz",
          subject: r.subject || "",
          class: r.className || r.class || "—",
          teacher: r.teacherName || r.teacher || "—",
          dateTaken: r.date || formatDate(r.submittedAt),
          score: Number(r.score ?? 0),
          timeTaken: r.timeTaken || "—",
          submittedAt: r.submittedAt,
        })),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load results");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = results.filter((r) => {
    if (filter === "all") return true;
    if (filter === "week" || filter === "month") {
      const raw = r.submittedAt || r.dateTaken;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return false;
      const now = Date.now();
      const diff = now - d.getTime();
      if (filter === "week") return diff <= 7 * 24 * 3600000;
      return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    }
    return r.subject.toLowerCase() === filter;
  });

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;
  const bestScore = results.length ? Math.max(...results.map((r) => r.score)) : 0;

  const summaryCards = [
    { label: "Average Score", value: results.length ? `${avgScore}%` : "—", icon: BarChart3, color: "#272757", bg: "bg-[#EDE9FE]" },
    { label: "Total Quizzes", value: String(results.length), icon: ClipboardList, color: "#272757", bg: "bg-[#EDE9FE]" },
    { label: "Best Score", value: results.length ? `${bestScore}%` : "—", icon: Trophy, color: "#F59E0B", bg: "bg-[#F59E0B]/10" },
    {
      label: "Most Recent",
      value: results[0]?.title ? `${results[0].title.split(" ")[0]}…` : "—",
      icon: Zap,
      color: "#10B981",
      bg: "bg-[#10B981]/10",
    },
  ];

  return (
    <AppShell role="student" pageTitle="My Results">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-4.5 h-4.5" style={{ color, strokeWidth: 1.75 }} />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === value
                ? "bg-[#272757] text-white border-[#272757]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#272757]/40 hover:text-[#272757]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
            <p className="text-sm">Loading results…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" style={{ strokeWidth: 1.75 }} />
            <p className="font-semibold text-gray-400 mb-1">No results yet</p>
            <p className="text-sm text-gray-300">Take your first quiz! 📝</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="qm-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Subject</th>
                  <th className="hidden md:table-cell">Class</th>
                  <th className="hidden lg:table-cell">Teacher</th>
                  <th className="hidden md:table-cell">Date Taken</th>
                  <th>Score</th>
                  <th className="hidden sm:table-cell">Time Taken</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 1 ? "bg-gray-50/50" : ""}>
                    <td><p className="font-medium text-[#0F0E47] text-sm">{r.title}</p></td>
                    <td><span className="text-sm text-gray-600">{r.subject}</span></td>
                    <td className="hidden md:table-cell"><span className="text-sm text-gray-500">{r.class}</span></td>
                    <td className="hidden lg:table-cell"><span className="text-sm text-gray-500">{r.teacher}</span></td>
                    <td className="hidden md:table-cell"><span className="text-xs text-gray-400">{r.dateTaken}</span></td>
                    <td>
                      <Badge className={`${scoreBadgeClass(r.score)} rounded-full text-xs font-bold px-2.5 py-0.5`}>
                        {r.score}%
                      </Badge>
                    </td>
                    <td className="hidden sm:table-cell"><span className="text-xs text-gray-400">{r.timeTaken}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => navigate(`/student/results/${r.id}`)}
                          variant="outline"
                          className="border border-[#272757]/30 text-[#272757] hover:bg-[#EDE9FE] rounded-xl h-7 px-3 text-xs gap-1"
                        >
                          <Eye className="w-3 h-3" style={{ strokeWidth: 1.75 }} /> View
                        </Button>
                        <button
                          onClick={() => {
                            setShareTarget({ title: r.title || "Quiz Result", score: r.score, class_: r.class || "", date: r.dateTaken || "" });
                            setShareModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#272757] text-[#272757] rounded-lg text-xs font-semibold hover:bg-[#EDE9FE] transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {shareModalOpen && shareTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="bg-white rounded-[12px] w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-[18px] font-bold text-[#0F0E47]">Share Your Result</h3>
              <button onClick={() => { setShareModalOpen(false); setCopied(false); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8686AC] hover:bg-[#F1F5F9]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="border-2 border-[#0F0E47] rounded-2xl p-6 bg-white text-center mb-5">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-[#272757] rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-black">Q</span>
                  </div>
                  <span className="font-bold text-[#0F0E47] text-sm">QuizMind AI</span>
                </div>
                <p className="text-2xl font-bold text-[#0F0E47] mb-1">{user?.name || "Student"}</p>
                <p className="text-sm text-[#505081] font-medium">{shareTarget.title}</p>
                {shareTarget.class_ && <p className="text-xs text-[#8686AC] mb-1">{shareTarget.class_}</p>}
                <div className="my-5">
                  <span className="text-6xl font-black text-[#272757]">{shareTarget.score}%</span>
                </div>
                <p className="text-xs text-[#8686AC]">{shareTarget.date}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/student/results/share`;
                    navigator.clipboard?.writeText(link);
                    setCopied(true);
                    toast.success("Link copied to clipboard!");
                    setTimeout(() => setCopied(false), 3000);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 border border-[#E2E8F0] rounded-xl h-10 text-sm font-semibold text-[#0F0E47] hover:bg-[#F8FAFC] transition-colors"
                >
                  <Link2 className={`w-4 h-4 ${copied ? "text-[#10B981]" : "text-[#272757]"}`} />
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => toast.info("Image export — pending")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#272757] text-white rounded-xl h-10 text-sm font-semibold hover:bg-[#1A1952] transition-colors"
                >
                  <Download className="w-4 h-4" /> Download as Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
