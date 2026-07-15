import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ArrowLeft, Sparkles, CheckCircle, Edit, AlertCircle, Filter } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";

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
    c >= 80 ? "bg-[#43E6B5]/10 text-[#43E6B5]" : c >= 65 ? "bg-[#FFD166]/10 text-[#FFD166]" : "bg-red-50 text-red-500";

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/teacher/results/${quizId}`)}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Results
            </Button>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-7 h-7 text-[#FFD166]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Flagged Answers</h1>
                <p className="text-sm text-gray-600">{quizTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white rounded-2xl p-5 shadow-md text-center">
            <p className="text-gray-500 text-sm mb-1">Total Flagged</p>
            <p className="text-3xl font-bold text-gray-800">{answers.length}</p>
          </Card>
          <Card className="bg-white rounded-2xl p-5 shadow-md text-center">
            <p className="text-gray-500 text-sm mb-1">Low Confidence</p>
            <p className="text-3xl font-bold text-[#FFD166]">
              {answers.filter((a) => a.confidence < 70).length}
            </p>
          </Card>
          <Card className="bg-white rounded-2xl p-5 shadow-md text-center">
            <p className="text-gray-500 text-sm mb-1">Overridden</p>
            <p className="text-3xl font-bold text-[#6C63FF]">
              {answers.filter((a) => a.overridden).length}
            </p>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          {(["all", "low-confidence", "overridden"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? "bg-[#6C63FF] text-white"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-[#6C63FF]"
              }`}
            >
              {f === "low-confidence" ? "Low Confidence" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Answer list */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <Card className="bg-white rounded-2xl p-12 shadow-md text-center">
              <CheckCircle className="w-12 h-12 text-[#43E6B5] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nothing here</h3>
              <p className="text-gray-500">No answers match this filter</p>
            </Card>
          )}

          {filtered.map((item) => (
            <Card key={item.id} className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-[#6C63FF] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {item.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{item.student}</span>
                      <Badge className={`rounded-full text-xs font-medium ${confidenceColor(item.confidence)}`}>
                        {item.confidence}% confident
                      </Badge>
                      {item.overridden && (
                        <Badge className="rounded-full text-xs bg-[#6C63FF]/10 text-[#6C63FF]">
                          Overridden → {item.manualScore}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2 font-medium">{item.question}</p>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-gray-700 text-sm mb-3">
                      "{item.answer}"
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Sparkles className="w-4 h-4 text-[#6C63FF]" />
                      AI score: <span className="font-semibold text-gray-800">{item.aiScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    onClick={() => acceptAIGrade(item.id)}
                    className="bg-[#43E6B5] hover:bg-[#2DD49E] text-white rounded-xl text-sm px-4 py-2"
                    disabled={!item.overridden}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept AI
                  </Button>
                  <Button
                    onClick={() => openOverride(item.id)}
                    variant="outline"
                    className="border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/10 rounded-xl text-sm px-4 py-2"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Override
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Override modal */}
      {overrideTarget !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Override Grade</h3>
            <p className="text-gray-600 text-sm mb-6">
              {answers.find((a) => a.id === overrideTarget)?.student}
            </p>
            <div className="mb-4">
              <Label className="mb-2 block text-gray-700">Manual Score (0–100)</Label>
              <Input
                type="number"
                value={overrideScore}
                onChange={(e) => { setOverrideScore(e.target.value); setOverrideError(""); }}
                className={`rounded-xl border-2 px-4 py-3 text-center text-xl font-bold ${overrideError ? "border-red-400" : "border-gray-200"}`}
                placeholder="e.g. 80"
                min={0}
                max={100}
              />
              {overrideError && <p className="text-red-500 text-sm mt-1">{overrideError}</p>}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOverrideTarget(null)}
                className="flex-1 border-2 border-gray-200 rounded-xl py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={saveOverride}
                className="flex-1 bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl py-3"
              >
                Save Grade
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
