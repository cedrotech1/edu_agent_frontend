import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Download, Eye, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError, initials } from "@/lib/api";

type FilterTab = "all" | "flagged" | "passed" | "failed";

interface SubmissionRow {
  id: number;
  studentId?: number;
  name: string;
  init: string;
  class: string;
  score: number;
  time: string;
  aiGrade: number;
  flagged: boolean;
  submitted: string;
  accessLabel: string;
  accessMethod?: string | null;
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 70
      ? "bg-[#D1FAE5] text-[#065F46]"
      : score >= 50
      ? "bg-[#FEF3C7] text-[#92400E]"
      : "bg-[#FEE2E2] text-[#991B1B]";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex ${cls}`}>
      {score}%
    </span>
  );
}

function FlaggedBadge({ flagged }: { flagged: boolean }) {
  return flagged ? (
    <span className="bg-[#FEE2E2] text-[#991B1B] rounded-full px-2.5 py-0.5 text-xs font-semibold">Yes</span>
  ) : (
    <span className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2.5 py-0.5 text-xs font-semibold">No</span>
  );
}

export function AdminQuizSubmissions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<FilterTab>("all");
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [quizTitle, setQuizTitle] = useState("Quiz");
  const [loading, setLoading] = useState(true);
  const [quizOptions, setQuizOptions] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    (async () => {
      if (!quizId) {
        setLoading(true);
        try {
          const res = await api.admin.quizzes();
          const rows = (res.data as any[]) || [];
          setQuizOptions(
            (Array.isArray(rows) ? rows : []).map((q: any) => ({
              id: q.id,
              title: q.title || `Quiz #${q.id}`,
            }))
          );
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Failed to load quizzes");
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await api.quizzes.results(quizId);
        const d: any = res.data || {};
        setQuizTitle(d.title || d.quizTitle || d.quiz?.title || "Quiz");
        const students = d.students || d.submissions || [];
        setSubmissions(
          (Array.isArray(students) ? students : []).map((s: any) => {
            const name =
              (typeof s.name === "string" && s.name) ||
              s.studentName ||
              s.student?.name ||
              s.student?.names ||
              "Student";
            const score = Number(s.score ?? 0);
            return {
              id: s.id || s.studentId,
              studentId: s.studentId,
              name,
              init: initials(name),
              class: d.className || d.class || s.class || "—",
              score,
              time:
                s.timeTaken ||
                (s.timeTakenSeconds != null
                  ? `${Math.round(s.timeTakenSeconds / 60)} min`
                  : "—"),
              aiGrade: Number(s.aiConfidence ?? s.aiGrade ?? score),
              flagged: Boolean(s.flaggedAnswers > 0 || s.flagged),
              submitted: s.submittedAt
                ? new Date(s.submittedAt).toLocaleString()
                : s.submitted || "—",
              accessMethod: s.accessMethod || null,
              accessLabel:
                s.accessLabel ||
                (s.accessMethod === "quiz_code"
                  ? "Join code"
                  : s.accessMethod === "class_member"
                    ? "Assigned class"
                    : "—"),
            };
          })
        );
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load submissions");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const filtered = submissions.filter((s) => {
    if (tab === "flagged") return s.flagged;
    if (tab === "passed") return s.score >= 70;
    if (tab === "failed") return s.score < 70;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "flagged", label: "Flagged" },
    { key: "passed", label: "Passed" },
    { key: "failed", label: "Failed" },
  ];

  if (!quizId) {
    return (
      <AppShell role="admin" pageTitle="Submissions">
        <h2 className="text-lg font-bold text-[#0F0E47] mb-4">Select a quiz</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-[#8686AC]"><Loader2 className="w-4 h-4 animate-spin" /> Loading quizzes…</div>
        ) : quizOptions.length === 0 ? (
          <p className="text-sm text-[#8686AC]">No quizzes found.</p>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl divide-y">
            {quizOptions.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate(`/admin/quiz/${q.id}/submissions`)}
                className="w-full text-left px-5 py-3 text-sm font-medium text-[#0F0E47] hover:bg-[#EDE9FE]"
              >
                {q.title}
              </button>
            ))}
          </div>
        )}
      </AppShell>
    );
  }

  return (
    <AppShell role="admin" pageTitle="Submissions">
      <nav className="text-sm flex items-center gap-1 text-[#64748B] mb-5">
        <Link to="/admin" className="text-[#272757] hover:underline">Admin</Link>
        <span>›</span>
        <Link to="/admin/quiz-oversight" className="hover:underline">Quiz Oversight</Link>
        <span>›</span>
        <span>{quizTitle}</span>
        <span>›</span>
        <span>Submissions</span>
      </nav>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-[#0F0E47]">{quizTitle} — Submissions</h2>
        <button
          onClick={async () => {
            if (!quizId) return;
            try {
              const blob = await api.quizzes.exportResults(quizId);
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `quiz-${quizId}-results.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("CSV downloaded");
            } catch (err) {
              toast.error(err instanceof ApiError ? err.message : "Export failed");
            }
          }}
          className="flex items-center gap-2 border border-[#272757] text-[#272757] hover:bg-[#EDE9FE] rounded-xl h-9 px-4 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Export CSV
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === key ? "bg-[#272757] text-white" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#272757]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#8686AC] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#8686AC]">
            <ClipboardList className="w-10 h-10 mb-3" style={{ strokeWidth: 1.5 }} />
            <p className="text-sm">No submissions yet for this quiz.</p>
          </div>
        ) : (
          <table className="qm-table w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Access</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Time Taken</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">AI Grade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Flagged</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Submitted At</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-[#E2E8F0] last:border-0 hover:bg-[#EDE9FE] transition-colors ${i % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-[#272757] rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {s.init}
                      </div>
                      <span className="text-sm font-medium text-[#0F0E47]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.accessMethod === "quiz_code"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-[#EDE9FE] text-[#272757]"
                      }`}
                    >
                      {s.accessLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.class}</td>
                  <td className="px-4 py-3"><ScoreBadge score={s.score} /></td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.time}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.aiGrade}%</td>
                  <td className="px-4 py-3"><FlaggedBadge flagged={s.flagged} /></td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.submitted}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        navigate(`/admin/quiz/${quizId}/submissions/${s.id}`)
                      }
                      className="flex items-center gap-1 border border-[#272757] text-[#272757] rounded-lg h-7 px-3 text-xs hover:bg-[#EDE9FE] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" style={{ strokeWidth: 1.75 }} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
