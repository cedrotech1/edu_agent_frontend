import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Edit,
  AlertCircle,
  Filter,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";
import { AppShell } from "../../components/AppShell";

type FilterType = "all" | "low-confidence" | "overridden";

export function FlaggedAnswers() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [filter, setFilter] = useState<FilterType>("all");
  const [answers, setAnswers] = useState<any[]>([]);
  const [quizTitle, setQuizTitle] = useState("Flagged Answers");
  const [loading, setLoading] = useState(true);
  const [overrideTarget, setOverrideTarget] = useState<number | null>(null);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideError, setOverrideError] = useState("");

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.quizzes.flagged(quizId);
        const d: any = res.data || {};
        const rows = Array.isArray(d) ? d : d.answers || d.items || [];
        setQuizTitle(d.quizTitle || d.title || "Flagged Answers");
        setAnswers(
          rows.map((a: any) => ({
            id: a.id,
            student: a.student || a.studentName || "Student",
            initials: a.initials || initials(a.student || a.studentName),
            question: a.question || a.questionText || "",
            answer: a.answer || a.studentAnswer || "",
            aiScore: a.aiScore ?? 0,
            confidence: a.confidence ?? 0,
            overridden: Boolean(a.overridden),
            manualScore: a.manualScore ?? null,
          }))
        );
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load flagged answers");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const filtered = answers.filter((a) => {
    if (filter === "low-confidence") return a.confidence < 70;
    if (filter === "overridden") return a.overridden;
    return true;
  });

  const acceptAIGrade = async (id: number) => {
    try {
      await api.quizzes.acceptAnswer(id);
      setAnswers((prev) =>
        prev.map((a) => (a.id === id ? { ...a, overridden: false, manualScore: null } : a))
      );
      toast.success("AI grade accepted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to accept grade");
    }
  };

  const openOverride = (id: number) => {
    setOverrideTarget(id);
    setOverrideScore("");
    setOverrideError("");
  };

  const saveOverride = async () => {
    const score = parseInt(overrideScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setOverrideError("Enter a score between 0 and 100");
      return;
    }
    if (overrideTarget == null) return;
    try {
      await api.quizzes.overrideAnswer(overrideTarget, score);
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === overrideTarget ? { ...a, overridden: true, manualScore: score } : a
        )
      );
      toast.success("Score overridden");
      setOverrideTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to override");
    }
  };

  const confidenceColor = (c: number) =>
    c >= 80
      ? "bg-emerald-50 text-emerald-700"
      : c >= 65
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-600";

  const stats = [
    {
      label: "Total Flagged",
      value: String(answers.length),
      valueColor: "text-[#0F0E47]",
      icon: Flag,
      iconBg: "bg-gray-50",
      iconColor: "text-[#272757]",
    },
    {
      label: "Low Confidence",
      value: String(answers.filter((a) => a.confidence < 70).length),
      valueColor: "text-amber-700",
      icon: AlertCircle,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Overridden",
      value: String(answers.filter((a) => a.overridden).length),
      valueColor: "text-[#272757]",
      icon: Edit,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#272757]",
    },
  ];

  return (
    <AppShell role="teacher" pageTitle="Flagged Answers">
      {loading && <p className="text-gray-500 mb-4 text-sm">Loading…</p>}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button
          variant="ghost"
          onClick={() => navigate(`/teacher/results/${quizId}`)}
          className="rounded-xl h-9 px-3 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Results
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-[#0F0E47]">Flagged Answers</h2>
          <p className="text-xs text-gray-400 mt-0.5">{quizTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, valueColor, icon: Icon, iconBg, iconColor }) => (
          <Card key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.75} />
              </div>
            </div>
            <p className={`text-3xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {(["all", "low-confidence", "overridden"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-[#272757] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f === "low-confidence" ? "Low Confidence" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">Nothing here</h3>
            <p className="text-xs text-gray-500">No answers match this filter</p>
          </Card>
        )}

        {filtered.map((item) => (
          <Card
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-[#272757] rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#0F0E47]">{item.student}</span>
                    <Badge className={`rounded-full text-[11px] font-medium ${confidenceColor(item.confidence)}`}>
                      {item.confidence}% confident
                    </Badge>
                    {item.overridden && (
                      <Badge className="rounded-full text-[11px] bg-[#EDE9FE] text-[#272757]">
                        Overridden → {item.manualScore}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">{item.question}</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-gray-700 text-sm mb-3">
                    "{item.answer}"
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Sparkles className="w-3.5 h-3.5 text-[#272757]" strokeWidth={1.75} />
                    AI score:{" "}
                    <span className="font-semibold text-[#0F0E47]">{item.aiScore}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  onClick={() => acceptAIGrade(item.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm h-9 px-4"
                  disabled={!item.overridden}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept AI
                </Button>
                <Button
                  onClick={() => openOverride(item.id)}
                  variant="outline"
                  className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl text-sm h-9 px-4"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Override
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {overrideTarget !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm border border-gray-100">
            <h3 className="text-base font-semibold text-[#0F0E47] mb-1">Override Grade</h3>
            <p className="text-gray-500 text-xs mb-5">
              {answers.find((a) => a.id === overrideTarget)?.student}
            </p>
            <div className="mb-4">
              <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                Manual Score (0–100)
              </Label>
              <Input
                type="number"
                value={overrideScore}
                onChange={(e) => {
                  setOverrideScore(e.target.value);
                  setOverrideError("");
                }}
                className={`rounded-xl border h-11 px-4 text-center text-xl font-semibold ${
                  overrideError ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="e.g. 80"
                min={0}
                max={100}
              />
              {overrideError && <p className="text-red-500 text-xs mt-1">{overrideError}</p>}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOverrideTarget(null)}
                className="flex-1 border border-gray-200 rounded-xl h-10 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={saveOverride}
                className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10 text-sm"
              >
                Save Grade
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
