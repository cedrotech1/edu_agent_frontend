import { useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  BookOpen,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Sparkles,
  Copy,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { AppShell } from "../../components/AppShell";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const educationLevels = [
  { value: "nursery", label: "Nursery", sublevels: ["Baby Class", "Middle Class", "Top Class"] },
  { value: "primary", label: "Primary", sublevels: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { value: "o-level", label: "O-Level", sublevels: ["S1", "S2", "S3"] },
  { value: "a-level", label: "A-Level", sublevels: ["S4", "S5", "S6"] },
  { value: "tvet", label: "TVET", sublevels: ["Certificate", "Diploma"] },
  { value: "university", label: "University", sublevels: ["Year 1", "Year 2", "Year 3", "Year 4"] },
];

interface ClassItem {
  id: number;
  name: string;
  students?: number;
  studentCount?: number;
  code: string;
  subject: string;
  level?: string;
  educationLevel?: string;
  subLevel?: string;
}

interface QuizItem {
  id: number;
  title: string;
  class?: string;
  className?: string;
  status: string;
  submitted?: number;
  submissionCount?: number;
  total?: number;
  totalStudents?: number;
  date?: string;
  deadline?: string;
  createdAt?: string;
}

function formatLevel(cls: ClassItem) {
  if (cls.level) return cls.level;
  const parts = [cls.educationLevel, cls.subLevel].filter(Boolean);
  return parts.join(" ") || "";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusMeta: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  completed: "bg-[#EDE9FE] text-[#272757]",
  draft: "bg-amber-50 text-amber-700",
};

export function TeacherDashboard() {
  const navigate = useNavigate();
  const [showClassModal, setShowClassModal] = useState(false);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [sublevel, setSublevel] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [classesRes, quizzesRes] = await Promise.all([
        api.classes.list(),
        api.quizzes.list(),
      ]);
      const classData = (classesRes.data as ClassItem[]) || [];
      const quizData = (quizzesRes.data as QuizItem[]) || [];
      setClasses(Array.isArray(classData) ? classData : []);
      setQuizzes(Array.isArray(quizData) ? quizData : []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateClass = async () => {
    if (!className || !subject || !educationLevel || !sublevel) {
      toast.error("Please fill in all fields");
      return;
    }
    setCreating(true);
    try {
      const schoolsRes = await api.schools.mine();
      const schools = (schoolsRes.data as any[]) || [];
      if (!schools.length) {
        toast.error("Join a school first (admin must add schools, then select them on signup/settings)");
        return;
      }
      await api.classes.create({
        name: className,
        subject,
        educationLevel,
        subLevel: sublevel,
        schoolId: Number(schools[0].id),
      });
      toast.success("Class created successfully!", {
        description: `${className} is ready for students to join.`,
      });
      setShowClassModal(false);
      setClassName("");
      setSubject("");
      setEducationLevel("");
      setSublevel("");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create class");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Join code copied!", {
      description: "Share this code with your students.",
    });
  };

  const stats = [
    {
      label: "Total Quizzes",
      value: loading ? "—" : String(quizzes.length),
      icon: BookOpen,
    },
    {
      label: "Active Classes",
      value: loading ? "—" : String(classes.length),
      icon: GraduationCap,
    },
    {
      label: "Avg. Score",
      value: "—",
      icon: TrendingUp,
    },
  ];

  return (
    <AppShell role="teacher" pageTitle="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
                <p className="text-3xl font-semibold text-[#0F0E47] tracking-tight">{value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-[#272757]" strokeWidth={1.75} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/teacher/quiz-builder")}
            className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10 px-5 text-sm gap-2"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            Create New Quiz with AI
          </Button>
          <Button
            variant="outline"
            className="border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-10 px-5 text-sm gap-2"
            onClick={() =>
              quizzes[0]
                ? navigate(`/teacher/results/${quizzes[0].id}`)
                : navigate("/teacher/results")
            }
          >
            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
            View All Results
          </Button>
        </div>
      </div>

      {/* Classes + Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F0E47]">My Classes</h2>
            <button
              onClick={() => setShowClassModal(true)}
              className="text-xs font-medium text-[#272757] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New class
            </button>
          </div>

          <div className="space-y-3">
            {!loading && classes.length === 0 ? (
              <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No classes yet</h3>
                <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                  Create your first class and invite students with a join code.
                </p>
                <Button
                  onClick={() => setShowClassModal(true)}
                  className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create First Class
                </Button>
              </Card>
            ) : (
              classes.map((cls) => (
                <Card
                  key={cls.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-gray-200 hover:shadow transition-all cursor-pointer"
                  onClick={() => navigate(`/teacher/class/${cls.id}`)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#0F0E47] truncate">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cls.subject}
                        {formatLevel(cls) ? ` · ${formatLevel(cls)}` : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {cls.students ?? cls.studentCount ?? 0} students enrolled
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 font-mono text-xs text-[#272757] tracking-wide">
                      {cls.code}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-gray-200 text-gray-600 h-8 w-8 p-0"
                      onClick={() => handleCopyCode(cls.code)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}

            {classes.length > 0 && (
              <button
                onClick={() => setShowClassModal(true)}
                className="w-full border border-dashed border-gray-200 text-gray-500 hover:border-[#272757]/40 hover:text-[#272757] py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Class
              </button>
            )}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F0E47]">Recent Quizzes</h2>
            <button
              onClick={() => navigate("/teacher/quizzes")}
              className="text-xs font-medium text-[#272757] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {!loading && quizzes.length === 0 && (
              <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No quizzes yet</h3>
                <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                  Use AI to create your first quiz in under a minute.
                </p>
                <Button
                  onClick={() => navigate("/teacher/quiz-builder")}
                  className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Create First Quiz
                </Button>
              </Card>
            )}

            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-gray-200 hover:shadow transition-all cursor-pointer"
                onClick={() => navigate(`/teacher/results/${quiz.id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[#0F0E47] truncate">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {quiz.className || quiz.class || "—"}
                    </p>
                  </div>
                  <Badge
                    className={`rounded-full text-[11px] font-medium px-2.5 py-0.5 capitalize shrink-0 ${
                      statusMeta[quiz.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {quiz.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                    {formatDateTime(quiz.date || quiz.deadline || quiz.createdAt)}
                  </span>
                  <span className="text-gray-600 font-medium">
                    {quiz.submitted ?? quiz.submissionCount ?? 0}/
                    {quiz.total ?? quiz.totalStudents ?? "—"} submitted
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {showClassModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-gray-100">
            <h3 className="text-base font-semibold text-[#0F0E47] mb-5">Create New Class</h3>

            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Class Name
                </Label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                  placeholder="e.g. S3 Biology 2026"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Subject
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10 text-sm"
                  placeholder="e.g. Biology"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Education Level
                </Label>
                <Select
                  value={educationLevel}
                  onValueChange={(value) => {
                    setEducationLevel(value);
                    setSublevel("");
                  }}
                >
                  <SelectTrigger className="rounded-xl border border-gray-200 h-10 text-sm">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {educationLevel && (
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Grade / Year
                  </Label>
                  <Select value={sublevel} onValueChange={setSublevel}>
                    <SelectTrigger className="rounded-xl border border-gray-200 h-10 text-sm">
                      <SelectValue placeholder="Select grade/year" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels
                        .find((l) => l.value === educationLevel)
                        ?.sublevels.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <p className="text-xs text-gray-400">
                A join code will be generated automatically when you create the class.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClassModal(false)}
                className="flex-1 border border-gray-200 rounded-xl h-10 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={creating}
                className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10 text-sm"
              >
                {creating ? "Creating…" : "Create Class"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
