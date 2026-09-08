import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ArrowLeft, Filter, Edit, X, CheckCircle, ShieldCheck, AlertTriangle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

interface GradingLog {
  id: number; quiz: string; student: string; question: string;
  aiScore: number; confidence: number; override: boolean; date: string;
  manualScore: number | null;
}

type ConfFilter = "all" | "high" | "medium" | "low";

function formatDate(raw: string) {
  if (!raw || raw === "—") return "—";
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return d.toLocaleString();
  }
  return raw;
}

export function AdminGradingLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<GradingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [confFilter, setConfFilter] = useState<ConfFilter>("all");
  const [overrideTarget, setOverrideTarget] = useState<number | null>(null);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideError, setOverrideError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.gradingLogs(confFilter);
        const rows = (res.data as any[]) || [];
        setLogs(
          (Array.isArray(rows) ? rows : []).map((l: any) => {
            const quizObj = l.quiz;
            const studentObj = l.student;
            const quizLabel =
              typeof quizObj === "string"
                ? quizObj
                : quizObj?.title || l.quizTitle || "—";
            const studentLabel =
              typeof studentObj === "string"
                ? studentObj
                : studentObj?.name || studentObj?.names || l.studentName || "—";
            const questionLabel =
              typeof l.question === "string"
                ? l.question
                : l.question?.question || l.questionText || "—";
            return {
              id: l.id,
              quiz: quizLabel,
              student: studentLabel,
              question: questionLabel,
              aiScore: Number(l.aiScore ?? 0),
              confidence: Number(l.confidence ?? 0),
              override: Boolean(l.override || l.overridden),
              date: l.date || l.createdAt || "—",
              manualScore: l.manualScore ?? null,
            };
          })
        );
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load grading logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [confFilter]);

  const filtered = logs.filter((l) => {
    if (confFilter === "high") return l.confidence >= 85;
    if (confFilter === "medium") return l.confidence >= 65 && l.confidence < 85;
    if (confFilter === "low") return l.confidence < 65;
    return true;
  });

  const saveOverride = async () => {
    const score = parseInt(overrideScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setOverrideError("Enter a score between 0 and 100");
      return;
    }
    if (overrideTarget == null) return;
    try {
      await api.quizzes.overrideAnswer(overrideTarget, score);
      setLogs((prev) => prev.map((l) =>
        l.id === overrideTarget ? { ...l, override: true, manualScore: score } : l
      ));
      toast.success("Grade overridden successfully");
      setOverrideTarget(null);
      setOverrideScore("");
      setOverrideError("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to override");
    }
  };

  const confBadge = (c: number) =>
    c >= 85 ? "bg-emerald-50 text-emerald-600" : c >= 65 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500";

  const highCount = logs.filter((l) => l.confidence >= 85).length;
  const lowCount = logs.filter((l) => l.confidence < 65).length;
  const overrideCount = logs.filter((l) => l.override).length;

  return (
    <AppShell role="admin" pageTitle="AI Grading Logs">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Admin Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F0E47]">AI Grading Logs</h1>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${logs.length} graded answers · ${overrideCount} overridden`}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "High Confidence (85%+)", value: highCount, icon: ShieldCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Needs Review (<65%)", value: lowCount, icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500" },
          { label: "Human Overrides", value: overrideCount, icon: UserCheck, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <Card key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
                <p className="text-3xl font-semibold text-[#0F0E47] tracking-tight">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-[18px] h-[18px] ${iconColor}`} strokeWidth={1.75} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Filter className="w-5 h-5 text-gray-500" />
        {([
          { v: "all", label: "All" },
          { v: "high", label: "High (85%+)" },
          { v: "medium", label: "Medium (65–84%)" },
          { v: "low", label: "Low (<65%)" },
        ] as { v: ConfFilter; label: string }[]).map(({ v, label }) => (
          <button key={v} onClick={() => setConfFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              confFilter === v
                ? "bg-[#272757] text-white"
                : "bg-white text-[#272757] border border-gray-200 hover:bg-gray-50"
            }`}>{label}
          </button>
        ))}
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Quiz</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Question</th>
              <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">AI Score</th>
              <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Confidence</th>
              <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Override</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[#0F0E47]">{l.quiz}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{l.student}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{l.question}</td>
                <td className="px-4 py-4 text-center">
                  <span className="font-semibold text-[#0F0E47]">{l.override ? l.manualScore : l.aiScore}%</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <Badge className={`rounded-full text-xs ${confBadge(l.confidence)}`}>
                    {l.confidence}%
                  </Badge>
                </td>
                <td className="px-4 py-4 text-center">
                  {l.override ? (
                    <Badge className="rounded-full bg-[#EDE9FE] text-[#272757] text-xs">
                      <CheckCircle className="w-3 h-3 mr-1 inline" /> Yes
                    </Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">No</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{formatDate(l.date)}</td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => { setOverrideTarget(l.id); setOverrideScore(""); setOverrideError(""); }}
                    className="p-2 text-[#272757] hover:bg-[#EDE9FE] rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Override Modal */}
      {overrideTarget !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0F0E47]">Override Grade</h3>
                <p className="text-gray-500 text-sm mt-1">{logs.find((l) => l.id === overrideTarget)?.student}</p>
              </div>
              <button onClick={() => setOverrideTarget(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600 italic">
              "{logs.find((l) => l.id === overrideTarget)?.question}"
            </div>
            <div className="mb-5">
              <Label className="mb-2 block text-gray-700">Manual Score (0–100)</Label>
              <Input
                type="number" value={overrideScore}
                onChange={(e) => { setOverrideScore(e.target.value); setOverrideError(""); }}
                className={`rounded-xl border px-4 py-3 text-center text-2xl font-bold ${overrideError ? "border-red-400" : "border-gray-200"}`}
                placeholder="e.g. 80" min={0} max={100}
              />
              {overrideError && <p className="text-red-500 text-sm mt-1">{overrideError}</p>}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOverrideTarget(null)} className="flex-1 border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl py-3">Cancel</Button>
              <Button onClick={saveOverride} className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl py-3">Save</Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
