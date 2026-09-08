import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Copy,
  CheckCircle,
  X,
  AlignLeft,
  List,
  ToggleLeft,
  Save,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { AppShell } from "../../components/AppShell";

const educationLevels: Record<string, { name: string; subLevels: string[] }> = {
  nursery: { name: "Nursery", subLevels: ["Baby Class", "Middle Class", "Top Class"] },
  primary: { name: "Primary", subLevels: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  olevel: { name: "O-Level (Secondary)", subLevels: ["S1", "S2", "S3"] },
  alevel: { name: "A-Level (Secondary)", subLevels: ["S4", "S5", "S6"] },
  tvet: { name: "TVET", subLevels: ["Certificate", "Diploma"] },
  university: { name: "University", subLevels: ["Year 1", "Year 2", "Year 3", "Year 4"] },
};

type QuestionType = "mcq" | "short" | "truefalse";
type Step = "ai" | "edit";

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correct?: number | boolean;
  modelAnswer?: string;
  points: number;
}

const TYPE_META: Record<QuestionType, { label: string; badge: string; icon: React.ElementType }> = {
  mcq: { label: "Multiple Choice", badge: "MCQ", icon: List },
  short: { label: "Short Answer", badge: "Short", icon: AlignLeft },
  truefalse: { label: "True & False", badge: "T&F", icon: ToggleLeft },
};

function QuestionEditorModal({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Question | null;
  onSave: (q: Omit<Question, "id">) => void;
  onCancel: () => void;
}) {
  const [qType, setQType] = useState<QuestionType>(initial?.type || "mcq");
  const [questionText, setQuestionText] = useState(initial?.question || "");
  const [options, setOptions] = useState<string[]>(
    initial?.options?.length ? [...initial.options] : ["", "", "", ""]
  );
  const [correctMCQ, setCorrectMCQ] = useState<number | null>(
    typeof initial?.correct === "number" ? initial.correct : null
  );
  const [modelAnswer, setModelAnswer] = useState(initial?.modelAnswer || "");
  const [correctTF, setCorrectTF] = useState<boolean | null>(
    typeof initial?.correct === "boolean" ? initial.correct : null
  );
  const [points, setPoints] = useState(initial?.points || 1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateOption = (i: number, val: string) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  };

  const addOption = () => {
    if (options.length < 6) setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    if (correctMCQ === i) setCorrectMCQ(null);
    else if (correctMCQ !== null && correctMCQ > i) setCorrectMCQ(correctMCQ - 1);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!questionText.trim()) e.question = "Question text is required";
    if (qType === "mcq") {
      const filled = options.filter((o) => o.trim());
      if (filled.length < 2) e.options = "Add at least 2 options";
      else if (options.some((o) => !o.trim())) e.options = "Fill in all options or remove empty ones";
      if (correctMCQ === null) e.correct = "Select the correct answer";
    }
    if (qType === "short" && !modelAnswer.trim()) {
      e.modelAnswer = "Add a model answer or keywords for grading";
    }
    if (qType === "truefalse" && correctTF === null) e.correct = "Select True or False";
    if (points < 1) e.points = "Points must be at least 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (qType === "mcq") {
      onSave({
        type: "mcq",
        question: questionText.trim(),
        options: options.map((o) => o.trim()),
        correct: correctMCQ!,
        points,
      });
    } else if (qType === "short") {
      onSave({
        type: "short",
        question: questionText.trim(),
        modelAnswer: modelAnswer.trim(),
        points,
      });
    } else {
      onSave({
        type: "truefalse",
        question: questionText.trim(),
        correct: correctTF!,
        points,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-lg my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#0F0E47]">
            {initial ? "Edit Question" : "Add Question"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <Label className="mb-2 block text-xs font-medium text-gray-600">Question Type</Label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TYPE_META) as QuestionType[]).map((value) => {
                const Icon = TYPE_META[value].icon;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setQType(value);
                      setErrors({});
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      qType === value
                        ? "border-[#272757] bg-[#272757] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {TYPE_META[value].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium text-gray-600">Question</Label>
            <Textarea
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                setErrors((p) => ({ ...p, question: "" }));
              }}
              placeholder="Type your question here…"
              className={`rounded-xl border px-3 py-2.5 min-h-[90px] resize-none text-sm ${
                errors.question ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question}</p>}
          </div>

          {qType === "mcq" && (
            <div>
              <Label className="mb-2 block text-xs font-medium text-gray-600">
                Answer options (select the correct one)
              </Label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCorrectMCQ(i);
                        setErrors((p) => ({ ...p, correct: "" }));
                      }}
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        correctMCQ === i
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-300 hover:border-emerald-400"
                      }`}
                    >
                      {correctMCQ === i && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                    <span className="w-6 h-6 rounded-md bg-gray-100 text-[11px] font-bold text-gray-500 flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        updateOption(i, e.target.value);
                        setErrors((p) => ({ ...p, options: "" }));
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="rounded-xl border border-gray-200 h-9 text-sm flex-1"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.options && <p className="text-red-500 text-xs mt-1">{errors.options}</p>}
              {errors.correct && <p className="text-red-500 text-xs mt-1">{errors.correct}</p>}
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 flex items-center gap-1 text-[#272757] text-xs font-medium hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add option
                </button>
              )}
            </div>
          )}

          {qType === "short" && (
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                Model answer / keywords
              </Label>
              <Textarea
                value={modelAnswer}
                onChange={(e) => {
                  setModelAnswer(e.target.value);
                  setErrors((p) => ({ ...p, modelAnswer: "" }));
                }}
                placeholder="Expected answer or keywords AI should look for"
                className={`rounded-xl border px-3 py-2.5 min-h-[80px] resize-none text-sm ${
                  errors.modelAnswer ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.modelAnswer && (
                <p className="text-red-500 text-xs mt-1">{errors.modelAnswer}</p>
              )}
            </div>
          )}

          {qType === "truefalse" && (
            <div>
              <Label className="mb-2 block text-xs font-medium text-gray-600">Correct answer</Label>
              <div className="grid grid-cols-2 gap-3">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => {
                      setCorrectTF(val);
                      setErrors((p) => ({ ...p, correct: "" }));
                    }}
                    className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      correctTF === val
                        ? val
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-red-400 bg-red-50 text-red-500"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {val ? "True" : "False"}
                  </button>
                ))}
              </div>
              {errors.correct && <p className="text-red-500 text-xs mt-1">{errors.correct}</p>}
            </div>
          )}

          <div>
            <Label className="mb-1.5 block text-xs font-medium text-gray-600">Points</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPoints((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 font-bold text-gray-600"
              >
                −
              </button>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 rounded-xl border border-gray-200 h-9 text-center font-semibold"
                min={1}
              />
              <button
                type="button"
                onClick={() => setPoints((p) => p + 1)}
                className="w-9 h-9 rounded-xl border border-gray-200 font-bold text-gray-600"
              >
                +
              </button>
            </div>
            {errors.points && <p className="text-red-500 text-xs mt-1">{errors.points}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border border-gray-200 rounded-xl h-9 px-4 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-5 text-sm"
          >
            {initial ? "Update Question" : "Save Question"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function QuizBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [step, setStep] = useState<Step>(editId ? "edit" : "ai");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [quizCode, setQuizCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState<"draft" | "active" | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [nextId, setNextId] = useState(1);
  const [saving, setSaving] = useState(false);
  const [quizId, setQuizId] = useState<number | null>(editId ? Number(editId) : null);
  const [loadingQuiz, setLoadingQuiz] = useState(Boolean(editId));

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [subLevel, setSubLevel] = useState("");
  const [numQuestions, setNumQuestions] = useState("10");
  const [questionType, setQuestionType] = useState("mcq");

  const [quizTitle, setQuizTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [lockAfterDeadline, setLockAfterDeadline] = useState(true);
  const [antiAI, setAntiAI] = useState(false);
  const [instantResults, setInstantResults] = useState(true);

  useEffect(() => {
    api.classes
      .list()
      .then((res) => {
        const data = (res.data as { id: number; name: string }[]) || [];
        setClasses(Array.isArray(data) ? data : []);
      })
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      setLoadingQuiz(true);
      try {
        const res = await api.quizzes.get(editId);
        const d: any = res.data || {};
        setQuizId(d.id);
        setQuizTitle(d.title || "");
        setSubject(d.subject || "");
        setSelectedClass(d.classId ? String(d.classId) : "");
        setTimeLimit(String(d.timeLimit || 30));
        setLockAfterDeadline(d.lockAfterDeadline !== false);
        setAntiAI(Boolean(d.antiAI));
        setInstantResults(d.instantResults !== false);
        if (d.deadline) {
          const dt = new Date(d.deadline);
          if (!Number.isNaN(dt.getTime())) {
            setDeadline(dt.toISOString().slice(0, 10));
            setDeadlineTime(dt.toTimeString().slice(0, 5));
          }
        }
        const qs = (d.questions || []).map((q: any, i: number) => ({
          id: q.id || i + 1,
          type: (q.type || "mcq") as QuestionType,
          question: q.question || "",
          options: q.options || undefined,
          correct: q.correct,
          modelAnswer: q.modelAnswer || "",
          points: Number(q.points || 1),
        }));
        setQuestions(qs);
        setNextId(qs.reduce((m: number, q: Question) => Math.max(m, q.id), 0) + 1);
        setStep("edit");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load quiz");
        navigate("/teacher/quizzes");
      } finally {
        setLoadingQuiz(false);
      }
    })();
  }, [editId, navigate]);

  const handleGenerate = async () => {
    if (!topic.trim() || !subject) {
      toast.error("Please enter a topic and subject");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.quizzes.generate({
        topic,
        subject,
        educationLevel,
        subLevel,
        numQuestions,
        questionType,
        description: description.trim() || undefined,
      });
      const data = res.data as {
        questions?: Question[];
        title?: string;
        source?: string;
      } | Question[];
      const qs = Array.isArray(data) ? data : data.questions || [];
      const mapped = qs.map((q, i) => ({
        ...q,
        id: q.id ?? i + 1,
        points: q.points ?? 1,
        type: (q.type || "mcq") as QuestionType,
      }));
      setQuestions(mapped);
      setNextId(mapped.length + 1);
      setQuizTitle((!Array.isArray(data) && data.title) || `${topic} - ${subject} Quiz`);
      setQuizId(null);
      setStep("edit");
      const source = !Array.isArray(data) ? data.source : undefined;
      if (source === "stub" || (res as any).warning) {
        toast.message("Generated with templates", {
          description:
            (res as any).warning ||
            "Add CURSOR_API_KEY on the server for real AI questions.",
        });
      } else {
        toast.success("AI quiz ready — review and edit before saving");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPayload = (status: "draft" | "active") => {
    let deadlineIso: string | undefined;
    if (deadline) {
      deadlineIso = deadlineTime
        ? new Date(`${deadline}T${deadlineTime}`).toISOString()
        : new Date(`${deadline}T23:59:00`).toISOString();
    }
    return {
      title: quizTitle.trim(),
      subject: subject || undefined,
      classId: selectedClass ? Number(selectedClass) : null,
      timeLimit: Number(timeLimit) || 30,
      deadline: deadlineIso || null,
      lockAfterDeadline,
      antiAI,
      instantResults,
      status,
      questions: questions.map((q, order) => ({
        type: q.type,
        question: q.question,
        options: q.options,
        correct: q.correct,
        modelAnswer: q.modelAnswer,
        points: q.points,
        order,
      })),
    };
  };

  const saveQuiz = async (status: "draft" | "active") => {
    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    if (status === "active" && !questions.length) {
      toast.error("Add at least one question before publishing");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(status);
      let created: any;
      if (quizId) {
        const res = await api.quizzes.update(quizId, payload);
        created = res.data;
      } else {
        const res = await api.quizzes.create(payload);
        created = res.data;
        if (created?.id) setQuizId(created.id);
      }
      setQuizCode(created?.code || `QZ-${created?.id || ""}`);
      setShowSuccess(status);
      toast.success(status === "draft" ? "Draft saved" : "Quiz published!");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : status === "draft"
            ? "Failed to save draft"
            : "Failed to publish quiz"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuestion = (q: Omit<Question, "id">) => {
    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((item) => (item.id === editingQuestion.id ? { ...q, id: item.id } : item))
      );
      setEditingQuestion(null);
      toast.success("Question updated");
    } else {
      setQuestions((prev) => [...prev, { ...q, id: nextId }]);
      setNextId((n) => n + 1);
      setShowAddModal(false);
      toast.success("Question added");
    }
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (loadingQuiz) {
    return (
      <AppShell role="teacher" pageTitle="Quiz Builder">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin mb-3" />
          <p className="text-sm">Loading quiz…</p>
        </div>
      </AppShell>
    );
  }

  /* ───────── AI form ───────── */
  if (step === "ai") {
    return (
      <AppShell role="teacher" pageTitle="Quiz Builder">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/teacher")} className="rounded-xl h-9 px-3">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-[#0F0E47]">Generate Quiz with AI</h2>
              <p className="text-xs text-gray-500">
                Describe what students should be tested on — AI will draft serious exam questions you can refine
              </p>
            </div>
          </div>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Topic</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                  placeholder="e.g. Java OOP, Photosynthesis"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="rounded-xl border border-gray-200 h-10 text-sm">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="computer">Computer Science</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Description / AI instructions
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border border-gray-200 min-h-[96px] text-sm resize-none"
                  placeholder="Extra guidance for the AI, e.g. Focus on Java classes, inheritance, and exception handling. Include code-snippet style MCQs. Difficulty: intermediate. Avoid trivia."
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  This is sent as an additional prompt so the AI generates more specific, high-quality questions.
                </p>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Grade level</Label>
                <Select value={educationLevel} onValueChange={(v) => { setEducationLevel(v); setSubLevel(""); }}>
                  <SelectTrigger className="rounded-xl border border-gray-200 h-10 text-sm">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(educationLevels).map((key) => (
                      <SelectItem key={key} value={key}>{educationLevels[key].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Sub level</Label>
                <Select value={subLevel} onValueChange={setSubLevel}>
                  <SelectTrigger className="rounded-xl border border-gray-200 h-10 text-sm">
                    <SelectValue placeholder="Select sub level" />
                  </SelectTrigger>
                  <SelectContent>
                    {(educationLevels[educationLevel]?.subLevels || []).map((sl) => (
                      <SelectItem key={sl} value={sl}>{sl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Number of questions</Label>
                <Input
                  type="number"
                  min={3}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Question type</Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger className="rounded-xl border border-gray-200 h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="short">Short Answer</SelectItem>
                    <SelectItem value="truefalse">True / False</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-11 text-sm gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> AI is thinking… this can take a minute
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate with AI
                </>
              )}
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  /* ───────── Editor ───────── */
  return (
    <AppShell role="teacher" pageTitle="Quiz Builder">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            onClick={() => (editId ? navigate("/teacher/quizzes") : setStep("ai"))}
            className="rounded-xl h-9 px-3 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#0F0E47] truncate">
              {quizTitle || "Untitled quiz"}
            </h2>
            <p className="text-xs text-gray-500">
              {questions.length} question{questions.length === 1 ? "" : "s"} · {totalPoints} pts
              {quizId ? " · Editing saved quiz" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => saveQuiz("draft")}
            className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-9 px-4 text-sm gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button
            disabled={saving}
            onClick={() => saveQuiz("active")}
            className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {saving ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {(showAddModal || editingQuestion) && (
        <QuestionEditorModal
          initial={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowAddModal(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-7 w-full max-w-md text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-600" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold text-[#0F0E47] mb-1">
              {showSuccess === "draft" ? "Draft saved" : "Quiz published"}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {showSuccess === "draft"
                ? "You can keep editing and publish when you're ready."
                : "Students in the assigned class see this quiz automatically—no code needed. Share the quiz code only with others outside the class."}
            </p>
            {showSuccess === "active" && quizCode && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
                <p className="text-xs text-gray-500 mb-2">Quiz join code (optional for class members)</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-xl font-bold text-[#272757] tracking-widest">
                    {quizCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(quizCode);
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                    className={`p-2.5 rounded-xl text-white ${
                      codeCopied ? "bg-emerald-600" : "bg-[#272757] hover:bg-[#505081]"
                    }`}
                  >
                    {codeCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              {showSuccess === "draft" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuccess(null)}
                    className="flex-1 border border-gray-200 rounded-xl h-10 text-sm"
                  >
                    Keep editing
                  </Button>
                  <Button
                    onClick={() => navigate("/teacher/quizzes")}
                    className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10 text-sm"
                  >
                    My quizzes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate("/teacher")}
                  className="w-full bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10 text-sm"
                >
                  Back to dashboard
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[#0F0E47]">Questions</h3>
            <Button
              onClick={() => {
                setEditingQuestion(null);
                setShowAddModal(true);
              }}
              variant="outline"
              className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-9 px-3 text-sm gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="bg-white rounded-xl border border-dashed border-gray-200 shadow-sm p-10 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-gray-300" />
              </div>
              <h4 className="text-sm font-semibold text-[#0F0E47] mb-1">No questions yet</h4>
              <p className="text-xs text-gray-500 mb-4">
                Generate with AI first, then add or edit questions here.
              </p>
              <Button
                onClick={() => setStep("ai")}
                className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate with AI
              </Button>
            </Card>
          ) : (
            questions.map((q, index) => {
              const meta = TYPE_META[q.type] || TYPE_META.mcq;
              return (
                <Card
                  key={q.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#272757] text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F0E47] leading-snug mb-2">
                        {q.question}
                      </p>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className="rounded-full text-[11px] bg-gray-100 text-gray-600">
                          {meta.badge}
                        </Badge>
                        <Badge className="rounded-full text-[11px] bg-gray-100 text-gray-600">
                          {q.points} pt{q.points !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {q.type === "mcq" && q.options && (
                        <div className="space-y-1">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`px-2.5 py-1.5 rounded-lg text-xs ${
                                i === q.correct
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              <span className="font-mono mr-1.5 opacity-60">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              {opt}
                              {i === q.correct ? " ✓" : ""}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "truefalse" && (
                        <div className="flex gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                              q.correct === true
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-50 text-gray-500"
                            }`}
                          >
                            True{q.correct === true ? " ✓" : ""}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                              q.correct === false
                                ? "bg-red-50 text-red-600"
                                : "bg-gray-50 text-gray-500"
                            }`}
                          >
                            False{q.correct === false ? " ✓" : ""}
                          </span>
                        </div>
                      )}

                      {q.type === "short" && (
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2 text-xs text-gray-500">
                          Model answer: {q.modelAnswer || "—"}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg p-2 text-gray-400 hover:text-[#272757]"
                        onClick={() => setEditingQuestion(q)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg p-2 text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#0F0E47]">Quiz settings</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Title</Label>
                <Input
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                  placeholder="e.g. Biology Chapter 3 Quiz"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Time limit (minutes)
                </Label>
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Deadline date</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Deadline time</Label>
                <Input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Assign to class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="rounded-xl border border-gray-200 h-10 text-sm">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-[#0F0E47]">Lock after deadline</p>
                  <p className="text-[11px] text-gray-400">Block late submissions</p>
                </div>
                <Switch checked={lockAfterDeadline} onCheckedChange={setLockAfterDeadline} />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-[#0F0E47]">Anti-AI cheating</p>
                  <p className="text-[11px] text-gray-400">Flag suspicious answers</p>
                </div>
                <Switch checked={antiAI} onCheckedChange={setAntiAI} />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-[#0F0E47]">Instant results</p>
                  <p className="text-[11px] text-gray-400">Show scores after submit</p>
                </div>
                <Switch checked={instantResults} onCheckedChange={setInstantResults} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
