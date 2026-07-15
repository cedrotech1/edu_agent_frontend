import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
  Sparkles, Plus, Trash2, Edit, ArrowLeft, Copy, CheckCircle, X,
  AlignLeft, List, ToggleLeft,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const educationLevels: Record<string, { name: string; subLevels: string[] }> = {
  nursery: { name: "Nursery", subLevels: ["Baby Class", "Middle Class", "Top Class"] },
  primary: { name: "Primary", subLevels: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  olevel: { name: "O-Level (Secondary)", subLevels: ["S1", "S2", "S3"] },
  alevel: { name: "A-Level (Secondary)", subLevels: ["S4", "S5", "S6"] },
  tvet: { name: "TVET", subLevels: ["Certificate", "Diploma"] },
  university: { name: "University", subLevels: ["Year 1", "Year 2", "Year 3", "Year 4"] },
};

type QuestionType = "mcq" | "short" | "truefalse";

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

function AddQuestionModal({
  onSave,
  onCancel,
}: {
  onSave: (q: Omit<Question, "id">) => void;
  onCancel: () => void;
}) {
  const [qType, setQType] = useState<QuestionType>("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctMCQ, setCorrectMCQ] = useState<number | null>(null);
  const [modelAnswer, setModelAnswer] = useState("");
  const [correctTF, setCorrectTF] = useState<boolean | null>(null);
  const [points, setPoints] = useState(1);
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
    if (correctMCQ !== null && correctMCQ > i) setCorrectMCQ(correctMCQ - 1);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!questionText.trim()) e.question = "Question text is required";
    if (qType === "mcq") {
      if (options.some((o) => !o.trim())) e.options = "All options must be filled in";
      if (correctMCQ === null) e.correct = "Select the correct answer";
    }
    if (qType === "truefalse" && correctTF === null) e.correct = "Select True or False as correct";
    if (points < 1) e.points = "Points must be at least 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (qType === "mcq") {
      onSave({ type: "mcq", question: questionText, options, correct: correctMCQ!, points });
    } else if (qType === "short") {
      onSave({ type: "short", question: questionText, modelAnswer, points });
    } else {
      onSave({ type: "truefalse", question: questionText, correct: correctTF!, points });
    }
  };

  const typeChips: { value: QuestionType; label: string; icon: React.ElementType }[] = [
    { value: "mcq", label: "Multiple Choice", icon: List },
    { value: "short", label: "Short Answer", icon: AlignLeft },
    { value: "truefalse", label: "True & False", icon: ToggleLeft },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add Question</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Question type chips */}
          <div>
            <Label className="mb-3 block text-gray-700 font-medium">Question Type</Label>
            <div className="flex gap-2 flex-wrap">
              {typeChips.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => { setQType(value); setErrors({}); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    qType === value
                      ? "border-[#6C63FF] bg-[#6C63FF] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[#6C63FF]/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div>
            <Label className="mb-2 block text-gray-700 font-medium">Question</Label>
            <Textarea
              value={questionText}
              onChange={(e) => { setQuestionText(e.target.value); setErrors((p) => ({ ...p, question: "" })); }}
              placeholder="Type your question here…"
              className={`rounded-xl border-2 px-4 py-3 min-h-[90px] resize-none ${errors.question ? "border-red-400" : "border-gray-200 focus:border-[#6C63FF]"}`}
            />
            {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question}</p>}
          </div>

          {/* MCQ options */}
          {qType === "mcq" && (
            <div>
              <Label className="mb-3 block text-gray-700 font-medium">Answer Options</Label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button
                      onClick={() => setCorrectMCQ(i)}
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        correctMCQ === i
                          ? "border-[#43E6B5] bg-[#43E6B5]"
                          : "border-gray-300 hover:border-[#43E6B5]"
                      }`}
                    >
                      {correctMCQ === i && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <Input
                      value={opt}
                      onChange={(e) => { updateOption(i, e.target.value); setErrors((p) => ({ ...p, options: "" })); }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm flex-1"
                    />
                    {options.length > 2 && (
                      <button onClick={() => removeOption(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
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
                  onClick={addOption}
                  className="mt-3 flex items-center gap-1.5 text-[#6C63FF] text-sm font-medium hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add option
                </button>
              )}
              <p className="text-xs text-gray-400 mt-2">Click the circle next to an option to mark it as correct</p>
            </div>
          )}

          {/* Short Answer */}
          {qType === "short" && (
            <div>
              <Label className="mb-2 block text-gray-700 font-medium">Model Answer / Keywords AI Should Look For</Label>
              <Textarea
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                placeholder="e.g. photosynthesis, chlorophyll, sunlight, glucose"
                className="rounded-xl border-2 border-gray-200 focus:border-[#6C63FF] px-4 py-3 min-h-[80px] resize-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1.5">AI will compare student answers against these keywords and concepts</p>
            </div>
          )}

          {/* True/False */}
          {qType === "truefalse" && (
            <div>
              <Label className="mb-3 block text-gray-700 font-medium">Mark Correct Answer</Label>
              <div className="grid grid-cols-2 gap-4">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => { setCorrectTF(val); setErrors((p) => ({ ...p, correct: "" })); }}
                    className={`py-6 rounded-2xl border-2 font-bold text-lg transition-all ${
                      correctTF === val
                        ? val
                          ? "border-[#43E6B5] bg-[#43E6B5]/10 text-[#43E6B5]"
                          : "border-red-400 bg-red-50 text-red-500"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {val ? "✓ True" : "✕ False"}
                  </button>
                ))}
              </div>
              {errors.correct && <p className="text-red-500 text-xs mt-1">{errors.correct}</p>}
            </div>
          )}

          {/* Points */}
          <div>
            <Label className="mb-2 block text-gray-700 font-medium">Points</Label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPoints((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#6C63FF] transition-colors font-bold"
              >
                −
              </button>
              <Input
                type="number"
                value={points}
                onChange={(e) => { setPoints(Math.max(1, parseInt(e.target.value) || 1)); setErrors((p) => ({ ...p, points: "" })); }}
                className="w-20 rounded-xl border-2 border-gray-200 px-3 py-2 text-center font-bold text-lg"
                min={1}
              />
              <button
                onClick={() => setPoints((p) => p + 1)}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#6C63FF] transition-colors font-bold"
              >
                +
              </button>
              <span className="text-gray-500 text-sm">point{points !== 1 ? "s" : ""}</span>
            </div>
            {errors.points && <p className="text-red-500 text-xs mt-1">{errors.points}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            className="bg-[#6C63FF] hover:bg-[#5851E6] text-white px-8 py-2.5 rounded-xl font-semibold"
          >
            Save Question
          </Button>
        </div>
      </div>
    </div>
  );
}

export function QuizBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"generate" | "edit">("generate");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [nextId, setNextId] = useState(100);
  const [publishing, setPublishing] = useState(false);

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
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
      });
      const data = res.data as { questions?: Question[]; title?: string } | Question[];
      const qs = Array.isArray(data) ? data : data.questions || [];
      setQuestions(
        qs.map((q, i) => ({
          ...q,
          id: q.id ?? i + 1,
          points: q.points ?? 1,
        }))
      );
      setNextId(qs.length + 1);
      const title =
        (!Array.isArray(data) && data.title) || `${topic} - ${subject} Quiz`;
      setQuizTitle(title);
      setStep("edit");
      toast.success("Quiz generated!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    if (!questions.length) {
      toast.error("Add at least one question");
      return;
    }
    setPublishing(true);
    try {
      let deadlineIso: string | undefined;
      if (deadline) {
        deadlineIso = deadlineTime
          ? new Date(`${deadline}T${deadlineTime}`).toISOString()
          : new Date(`${deadline}T23:59:00`).toISOString();
      }
      const res = await api.quizzes.create({
        title: quizTitle,
        subject,
        classId: selectedClass ? Number(selectedClass) : undefined,
        timeLimit: Number(timeLimit) || 30,
        deadline: deadlineIso,
        lockAfterDeadline,
        antiAI,
        instantResults,
        status: "active",
        questions: questions.map((q, order) => ({
          type: q.type,
          question: q.question,
          options: q.options,
          correct: q.correct,
          modelAnswer: q.modelAnswer,
          points: q.points,
          order,
        })),
      });
      const created = res.data as { code?: string; id?: number };
      setQuizCode(created.code || `QZ-${created.id || ""}`);
      setShowPublishModal(true);
      toast.success("Quiz published!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to publish quiz");
    } finally {
      setPublishing(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleSaveQuestion = (q: Omit<Question, "id">) => {
    setQuestions((prev) => [...prev, { ...q, id: nextId }]);
    setNextId((n) => n + 1);
    setShowAddModal(false);
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (step === "generate") {
    return (
      <div className="min-h-screen bg-[#F9F9FF]">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/teacher")} className="rounded-xl">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </Button>
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#6C63FF]" />
                <h1 className="text-2xl font-bold text-gray-800">AI Quiz Generator</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Generate Quiz with AI ✨</h2>
              <p className="text-gray-600">Tell us what you need, and our AI will create a custom quiz for you</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="topic" className="mb-2 block">Topic</Label>
                  <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
                    className="rounded-xl border-2 px-4 py-3" placeholder="e.g., Algebra, Photosynthesis" />
                </div>
                <div>
                  <Label htmlFor="subject" className="mb-2 block">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="rounded-xl border-2 px-4 py-3"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Grade Level</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel}>
                    <SelectTrigger className="rounded-xl border-2 px-4 py-3"><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(educationLevels).map((key) => (
                        <SelectItem key={key} value={key}>{educationLevels[key].name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Sub Level</Label>
                  <Select value={subLevel} onValueChange={setSubLevel}>
                    <SelectTrigger className="rounded-xl border-2 px-4 py-3"><SelectValue placeholder="Select sub level" /></SelectTrigger>
                    <SelectContent>
                      {educationLevels[educationLevel]?.subLevels.map((sl) => (
                        <SelectItem key={sl} value={sl}>{sl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numQuestions" className="mb-2 block">Number of Questions</Label>
                  <Input id="numQuestions" type="number" value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="rounded-xl border-2 px-4 py-3" min="5" max="50" />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Question Type</Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger className="rounded-xl border-2 px-4 py-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="short">Short Answer</SelectItem>
                    <SelectItem value="truefalse">True / False</SelectItem>
                    <SelectItem value="mixed">Mixed Types</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerate} disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#5851E6] hover:from-[#5851E6] hover:to-[#4842D1] text-white py-6 rounded-2xl text-lg font-semibold shadow-lg disabled:opacity-80">
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    QuizMind is thinking...
                  </span>
                ) : (
                  <><Sparkles className="w-6 h-6 mr-2" />Generate with AI ✨</>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setStep("generate")} className="rounded-xl">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </Button>
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#6C63FF]" />
                <h1 className="text-2xl font-bold text-gray-800">Review & Edit Quiz</h1>
              </div>
            </div>
            <Button onClick={handlePublish} disabled={publishing}
              className="bg-[#43E6B5] hover:bg-[#2DD49E] text-white px-6 py-3 rounded-xl font-semibold">
              {publishing ? "Publishing…" : "Publish Quiz 🚀"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <AddQuestionModal onSave={handleSaveQuestion} onCancel={() => setShowAddModal(false)} />
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
            <div className="w-20 h-20 bg-[#43E6B5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#43E6B5]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Published! 🎉</h2>
            <p className="text-gray-600 mb-6">Share this code with your students so they can join</p>
            <div className="bg-[#6C63FF]/5 border-2 border-[#6C63FF]/20 rounded-2xl p-5 mb-6">
              <p className="text-sm text-gray-500 mb-2">Quiz code</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-xl px-4 py-3 font-mono text-2xl font-bold text-[#6C63FF] tracking-widest border-2 border-[#6C63FF]/20">
                  {quizCode}
                </div>
                <button onClick={copyCode}
                  className={`p-3 rounded-xl transition-all ${codeCopied ? "bg-[#43E6B5] text-white" : "bg-[#6C63FF] text-white hover:bg-[#5851E6]"}`}>
                  {codeCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {codeCopied && <p className="text-[#43E6B5] text-sm mt-2 font-medium">Copied!</p>}
            </div>
            {selectedClass && (
              <p className="text-sm text-gray-500 mb-6">
                Assigned to:{" "}
                <span className="font-semibold text-gray-800">
                  {classes.find((c) => String(c.id) === selectedClass)?.name || "Class"}
                </span>
              </p>
            )}
            <button onClick={() => navigate("/teacher")}
              className="w-full bg-[#6C63FF] hover:bg-[#5851E6] text-white py-4 rounded-2xl font-semibold text-lg transition-colors">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Questions ({questions.length})</h2>
                <p className="text-sm text-gray-500">{totalPoints} total points</p>
              </div>
              <Button onClick={() => setShowAddModal(true)}
                variant="outline"
                className="border-2 border-[#6C63FF] text-[#6C63FF] rounded-xl hover:bg-[#6C63FF]/5">
                <Plus className="w-5 h-5 mr-2" /> Add Question
              </Button>
            </div>

            {questions.length === 0 && (
              <Card className="bg-white rounded-2xl p-12 shadow-md text-center border-2 border-dashed border-gray-200">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-600 mb-2">No questions yet</h3>
                <p className="text-gray-400 text-sm mb-4">Click "Add Question" to build your quiz manually</p>
                <Button onClick={() => setShowAddModal(true)}
                  className="bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl">
                  Add First Question
                </Button>
              </Card>
            )}

            {questions.map((q, index) => {
              const meta = TYPE_META[q.type];
              return (
                <Card key={q.id} className="bg-white rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] text-sm font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium mb-2 leading-snug">{q.question}</p>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Badge className={`rounded-full text-xs px-2 py-0.5 ${
                            q.type === "mcq" ? "bg-[#6C63FF]/10 text-[#6C63FF]"
                            : q.type === "short" ? "bg-[#4FC3F7]/10 text-[#4FC3F7]"
                            : "bg-[#FFD166]/10 text-[#FFD166]"
                          }`}>{meta.badge}</Badge>
                          <Badge className="rounded-full text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                            {q.points} pt{q.points !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {q.type === "mcq" && q.options && (
                          <div className="space-y-1.5">
                            {q.options.map((opt, i) => (
                              <div key={i} className={`px-3 py-1.5 rounded-lg text-sm ${
                                i === q.correct
                                  ? "bg-[#43E6B5]/10 border border-[#43E6B5]/30 text-[#2ca882] font-medium"
                                  : "bg-gray-50 text-gray-600"
                              }`}>
                                <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}</span>
                                {opt}
                                {i === q.correct && <span className="ml-2 text-xs text-[#43E6B5]">✓ Correct</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === "truefalse" && (
                          <div className="flex gap-2">
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${q.correct === true ? "bg-[#43E6B5]/10 text-[#2ca882] border border-[#43E6B5]/30" : "bg-gray-50 text-gray-500"}`}>
                              True {q.correct === true && "✓"}
                            </span>
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${q.correct === false ? "bg-red-50 text-red-500 border border-red-200" : "bg-gray-50 text-gray-500"}`}>
                              False {q.correct === false && "✓"}
                            </span>
                          </div>
                        )}
                        {q.type === "short" && (
                          <div className="bg-[#4FC3F7]/5 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#4FC3F7]" />
                            AI will grade this answer
                            {q.modelAnswer && <span className="text-xs text-gray-400">· Keywords: {q.modelAnswer.slice(0, 40)}{q.modelAnswer.length > 40 ? "…" : ""}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3 shrink-0">
                      <Button size="sm" variant="ghost" className="rounded-lg p-2 text-gray-400 hover:text-[#6C63FF]">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost"
                        className="rounded-lg p-2 text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteQuestion(q.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quiz Settings */}
          <div>
            <Card className="bg-white rounded-2xl p-6 shadow-md sticky top-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Quiz Settings</h3>
              <div className="space-y-5">
                <div>
                  <Label className="mb-2 block">Quiz Title</Label>
                  <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="rounded-xl border-2 px-4 py-3" />
                </div>
                <div>
                  <Label className="mb-2 block">Time Limit (minutes)</Label>
                  <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="rounded-xl border-2 px-4 py-3" />
                </div>
                <div>
                  <Label className="mb-2 block">Deadline Date</Label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="rounded-xl border-2 px-4 py-3" />
                </div>
                <div>
                  <Label className="mb-2 block">Deadline Time</Label>
                  <Input type="time" value={deadlineTime} onChange={(e) => setDeadlineTime(e.target.value)} className="rounded-xl border-2 px-4 py-3" />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Lock After Deadline</p>
                    <p className="text-xs text-gray-500">Prevent late submissions</p>
                  </div>
                  <Switch checked={lockAfterDeadline} onCheckedChange={setLockAfterDeadline} />
                </div>
                <div>
                  <Label className="mb-2 block">Assign to Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="rounded-xl border-2 px-4 py-3"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Anti-AI Cheating</p>
                    <p className="text-xs text-gray-500">Detect AI-generated answers</p>
                  </div>
                  <Switch checked={antiAI} onCheckedChange={setAntiAI} />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Instant Results</p>
                    <p className="text-xs text-gray-500">Show scores immediately</p>
                  </div>
                  <Switch checked={instantResults} onCheckedChange={setInstantResults} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
