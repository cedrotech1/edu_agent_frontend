import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { ArrowLeft, Sparkles, Filter, Edit, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

interface GradingLog {
  id: number; quiz: string; student: string; question: string;
  aiScore: number; confidence: number; override: boolean; date: string;
  manualScore: number | null;
}

const initialLogs: GradingLog[] = [
  { id: 1, quiz: "Algebra Fundamentals", student: "Alice Johnson", question: "Explain variables in algebra.", aiScore: 88, confidence: 92, override: false, date: "Jul 10, 2026", manualScore: null },
  { id: 2, quiz: "Algebra Fundamentals", student: "Eve Wilson", question: "What is a linear equation?", aiScore: 55, confidence: 62, override: true, date: "Jul 10, 2026", manualScore: 70 },
  { id: 3, quiz: "Physics Chapter 3", student: "Bob Smith", question: "Describe Newton's 3rd law.", aiScore: 72, confidence: 74, override: false, date: "Jul 9, 2026", manualScore: null },
  { id: 4, quiz: "Biology Basics", student: "Charlie Brown", question: "How does photosynthesis work?", aiScore: 81, confidence: 85, override: false, date: "Jul 8, 2026", manualScore: null },
  { id: 5, quiz: "Algebra Fundamentals", student: "Diana Prince", question: "What is the order of operations?", aiScore: 60, confidence: 58, override: true, date: "Jul 10, 2026", manualScore: 75 },
  { id: 6, quiz: "Chemistry Reactions", student: "Grace Lee", question: "What is oxidation?", aiScore: 90, confidence: 95, override: false, date: "Jul 6, 2026", manualScore: null },
];

type ConfFilter = "all" | "high" | "medium" | "low";

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
          (Array.isArray(rows) ? rows : []).map((l: any) => ({
            id: l.id,
            quiz: l.quiz || l.quizTitle || "—",
            student: l.student || l.studentName || "—",
            question: l.question || l.questionText || "—",
            aiScore: l.aiScore ?? 0,
            confidence: l.confidence ?? 0,
            override: Boolean(l.override || l.overridden),
            date: l.date || l.createdAt || "—",
            manualScore: l.manualScore ?? null,
          }))
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
    c >= 85 ? "bg-[#43E6B5]/10 text-[#43E6B5]" : c >= 65 ? "bg-[#FFD166]/10 text-[#FFD166]" : "bg-red-50 text-red-500";

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" /> Admin Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Grading Logs</h1>
              <p className="text-sm text-gray-500">{loading ? "Loading…" : `${logs.length} graded answers · ${logs.filter((l) => l.override).length} overridden`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white rounded-2xl p-5 shadow-md text-center">
            <p className="text-gray-500 text-sm mb-1">High Confidence (85%+)</p>
            <p className="text-3xl font-bold text-[#43E6B5]">{logs.filter((l) => l.confidence >= 85).length}</p>
          </Card>
          <Card className="bg-white rounded-2xl p-5 shadow-md text-center">
            <p className="text-gray-500 text-sm mb-1">Needs Review (&lt;65%)</p>
            <p className="text-3xl font-bold text-red-500">{logs.filter((l) => l.confidence < 65).length}</p>
          </Card>
          <Card className="bg-white rounded-2xl p-5 shadow-md text-center">
            <p className="text-gray-500 text-sm mb-1">Human Overrides</p>
            <p className="text-3xl font-bold text-[#6C63FF]">{logs.filter((l) => l.override).length}</p>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          {([
            { v: "all", label: "All" },
            { v: "high", label: "High (85%+)" },
            { v: "medium", label: "Medium (65–84%)" },
            { v: "low", label: "Low (<65%)" },
          ] as { v: ConfFilter; label: string }[]).map(({ v, label }) => (
            <button key={v} onClick={() => setConfFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                confFilter === v ? "bg-[#6C63FF] text-white" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-[#6C63FF]"
              }`}>{label}
            </button>
          ))}
        </div>

        <Card className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
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
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{l.quiz}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{l.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{l.question}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-gray-800">{l.override ? l.manualScore : l.aiScore}%</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge className={`rounded-full text-xs ${confBadge(l.confidence)}`}>
                      {l.confidence}%
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {l.override ? (
                      <Badge className="rounded-full bg-[#6C63FF]/10 text-[#6C63FF] text-xs">
                        <CheckCircle className="w-3 h-3 mr-1 inline" /> Yes
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">No</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{l.date}</td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => { setOverrideTarget(l.id); setOverrideScore(""); setOverrideError(""); }}
                      className="p-2 text-[#6C63FF] hover:bg-[#6C63FF]/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Override Modal */}
      {overrideTarget !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Override Grade</h3>
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
                className={`rounded-xl border-2 px-4 py-3 text-center text-2xl font-bold ${overrideError ? "border-red-400" : "border-gray-200"}`}
                placeholder="e.g. 80" min={0} max={100}
              />
              {overrideError && <p className="text-red-500 text-sm mt-1">{overrideError}</p>}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOverrideTarget(null)} className="flex-1 border-2 border-gray-200 rounded-xl py-3">Cancel</Button>
              <Button onClick={saveOverride} className="flex-1 bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl py-3">Save</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
