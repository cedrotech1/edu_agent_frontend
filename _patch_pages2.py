from pathlib import Path

root = Path(r"c:\Users\HUAWEI\Desktop\new\tc-ai-agent\edu_agent_frontend\src\app")

# QuizResults
qr = root / "pages/teacher/QuizResults.tsx"
text = qr.read_text(encoding="utf-8")
if "api.quizzes.results" not in text:
    text = text.replace(
        'import { useNavigate, useParams } from "react-router";',
        'import { useEffect, useState } from "react";\nimport { useNavigate, useParams } from "react-router";',
    )
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError, initials } from "@/lib/api";',
    )
    start = text.find("const mockStudents = [")
    end = text.find("export function QuizResults()")
    text = text[:start] + text[end:]
    text = text.replace(
        """export function QuizResults() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const averageScore = Math.round(
    mockStudents.reduce((sum, s) => sum + s.score, 0) / mockStudents.length
  );

  const handleExportResults = () => {
    toast.success("Results exported successfully!", {
      description: "The quiz results have been downloaded as CSV.",
    });
  };""",
        """export function QuizResults() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [mockStudents, setMockStudents] = useState<any[]>([]);
  const [mockQuestionStats, setMockQuestionStats] = useState<any[]>([]);
  const [quizMeta, setQuizMeta] = useState({ title: "Quiz Results", className: "" });
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.quizzes.results(quizId);
        const d: any = res.data || {};
        setQuizMeta({
          title: d.title || d.quizTitle || "Quiz Results",
          className: d.className || d.class || "",
        });
        const students = d.students || d.submissions || [];
        setMockStudents(
          students.map((s: any) => ({
            id: s.id || s.studentId,
            name: s.name || s.studentName || "Student",
            score: s.score ?? 0,
            status: s.status || ((s.score ?? 0) >= 50 ? "pass" : "fail"),
            aiConfidence: s.aiConfidence ?? s.confidence ?? 0,
            timeTaken: s.timeTaken || (s.timeTakenSeconds ? `${Math.round(s.timeTakenSeconds/60)} min` : "—"),
          }))
        );
        setMockQuestionStats(d.questionStats || d.questions || []);
        setFlaggedCount(d.flaggedCount ?? d.needsReview ?? 0);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const averageScore = mockStudents.length
    ? Math.round(mockStudents.reduce((sum, s) => sum + s.score, 0) / mockStudents.length)
    : 0;

  const handleExportResults = () => {
    toast.success("Results exported successfully!", {
      description: "The quiz results have been downloaded as CSV.",
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600">Loading results…</div>;""",
    )
    text = text.replace(
        '<p className="text-sm text-gray-600">Algebra Fundamentals - Math 101</p>',
        '<p className="text-sm text-gray-600">{quizMeta.title}{quizMeta.className ? ` - ${quizMeta.className}` : ""}</p>',
    )
    text = text.replace(
        '<h3 className="text-3xl font-bold text-[#FFD166]">2</h3>',
        '<h3 className="text-3xl font-bold text-[#FFD166]">{flaggedCount}</h3>',
    )
    text = text.replace(
        '{student.name.split(" ").map((n) => n[0]).join("")}',
        "{initials(student.name)}",
    )
    qr.write_text(text, encoding="utf-8")
    print("QuizResults patched")
else:
    print("QuizResults already patched")

# FlaggedAnswers
fa = root / "pages/teacher/FlaggedAnswers.tsx"
text = fa.read_text(encoding="utf-8")
if "api.quizzes.flagged" not in text:
    text = text.replace(
        'import { useState } from "react";',
        'import { useEffect, useState } from "react";',
    )
    text = text.replace(
        'import { ArrowLeft, Sparkles, CheckCircle, Edit, AlertCircle, Filter } from "lucide-react";',
        'import { ArrowLeft, Sparkles, CheckCircle, Edit, AlertCircle, Filter } from "lucide-react";\nimport { toast } from "sonner";\nimport { api, ApiError, initials } from "@/lib/api";',
    )
    start = text.find("const mockFlagged = [")
    end = text.find("export function FlaggedAnswers()")
    text = text[:start] + text[end:]
    text = text.replace(
        """export function FlaggedAnswers() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [filter, setFilter] = useState<FilterType>("all");
  const [answers, setAnswers] = useState(mockFlagged);
  const [overrideTarget, setOverrideTarget] = useState<number | null>(null);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideError, setOverrideError] = useState("");""",
        """export function FlaggedAnswers() {
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
  }, [quizId]);""",
    )
    text = text.replace(
        """  const acceptAIGrade = (id: number) => {
    setAnswers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, overridden: false, manualScore: null } : a))
    );
  };""",
        """  const acceptAIGrade = async (id: number) => {
    try {
      await api.quizzes.acceptAnswer(id);
      setAnswers((prev) =>
        prev.map((a) => (a.id === id ? { ...a, overridden: false, manualScore: null } : a))
      );
      toast.success("AI grade accepted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to accept grade");
    }
  };""",
    )
    text = text.replace(
        """  const saveOverride = () => {
    const score = parseInt(overrideScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setOverrideError("Enter a score between 0 and 100");
      return;
    }
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === overrideTarget ? { ...a, overridden: true, manualScore: score } : a
      )
    );
    setOverrideTarget(null);
  };""",
        """  const saveOverride = async () => {
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
  };""",
    )
    text = text.replace(
        '<p className="text-sm text-gray-600">Algebra Fundamentals — Math 101</p>',
        '<p className="text-sm text-gray-600">{quizTitle}</p>',
    )
    # insert loading early return before filtered
    text = text.replace(
        "  const filtered = answers.filter((a) => {",
        "  if (loading) return <div className=\"min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600\">Loading flagged answers…</div>;\n\n  const filtered = answers.filter((a) => {",
    )
    fa.write_text(text, encoding="utf-8")
    print("FlaggedAnswers patched")
else:
    print("FlaggedAnswers already patched")

print("done2")
