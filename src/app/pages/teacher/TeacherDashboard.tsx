import { useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
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
  LogOut,
} from "lucide-react";
import { NotificationsPanel } from "../../components/NotificationsPanel";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { api, initials, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
      await api.classes.create({
        name: className,
        subject,
        educationLevel,
        subLevel: sublevel,
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

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const displayName = user?.name || "Teacher";
  const avatar = initials(displayName);

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo variant="horizontal" size="sm" color="#6C63FF" />
              <Badge className="bg-[#6C63FF]/10 text-[#6C63FF] rounded-full">
                Teacher
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsPanel role="teacher" />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <span className="text-gray-700 font-medium">{displayName}</span>
              <div
                className="w-10 h-10 bg-[#6C63FF] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-4 hover:ring-[#6C63FF]/20 transition-all"
                onClick={() => navigate("/teacher/settings")}
              >
                {avatar}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-gray-500 mb-4">Loading dashboard…</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#6C63FF] to-[#5851E6] text-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Total Quizzes</p>
                <h3 className="text-4xl font-bold">{quizzes.length}</h3>
              </div>
              <BookOpen className="w-12 h-12 text-white/50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#4FC3F7] to-[#29B5E8] text-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Active Classes</p>
                <h3 className="text-4xl font-bold">{classes.length}</h3>
              </div>
              <Users className="w-12 h-12 text-white/50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#43E6B5] to-[#2DD49E] text-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Avg. Score</p>
                <h3 className="text-4xl font-bold">—</h3>
              </div>
              <TrendingUp className="w-12 h-12 text-white/50" />
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate("/teacher/quiz-builder")}
              className="bg-[#6C63FF] hover:bg-[#5851E6] text-white py-8 rounded-2xl text-lg font-semibold shadow-lg flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" />
              Create New Quiz with AI ✨
            </Button>
            <Button
              variant="outline"
              className="border-2 border-[#4FC3F7] text-[#4FC3F7] hover:bg-[#4FC3F7]/10 py-8 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3"
              onClick={() => quizzes[0] && navigate(`/teacher/results/${quizzes[0].id}`)}
            >
              <BarChart3 className="w-6 h-6" />
              View All Results
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">My Classes</h2>
            <div className="space-y-4">
              {!loading && classes.length === 0 ? (
                <Card className="bg-white rounded-2xl p-10 shadow-md text-center">
                  <div className="w-16 h-16 bg-[#4FC3F7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-[#4FC3F7]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No classes yet ✨</h3>
                  <p className="text-gray-500 mb-6">Create your first class and invite students with a join code</p>
                  <Button
                    onClick={() => setShowClassModal(true)}
                    className="bg-[#4FC3F7] hover:bg-[#29B5E8] text-white rounded-xl px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Class
                  </Button>
                </Card>
              ) : (
                classes.map((cls) => (
                  <Card
                    key={cls.id}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4FC3F7]/30"
                    onClick={() => navigate(`/teacher/class/${cls.id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{cls.name}</h3>
                        <p className="text-gray-500 text-sm">{cls.subject} · {formatLevel(cls)}</p>
                        <p className="text-gray-600 text-sm">
                          {cls.students ?? cls.studentCount ?? 0} students enrolled
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-[#4FC3F7]" />
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm">
                        {cls.code}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-[#6C63FF] text-[#6C63FF]"
                        onClick={() => handleCopyCode(cls.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}

              <Button
                onClick={() => setShowClassModal(true)}
                variant="outline"
                className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#6C63FF] hover:text-[#6C63FF] py-6 rounded-2xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Class
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Quizzes</h2>
            <div className="space-y-4">
              {!loading && quizzes.length === 0 && (
                <Card className="bg-white rounded-2xl p-10 shadow-md text-center">
                  <div className="w-16 h-16 bg-[#6C63FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-[#6C63FF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No quizzes yet ✨</h3>
                  <p className="text-gray-500 mb-6">Use AI to create your first quiz in under a minute</p>
                  <Button
                    onClick={() => navigate("/teacher/quiz-builder")}
                    className="bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl px-6"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create First Quiz
                  </Button>
                </Card>
              )}
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/teacher/results/${quiz.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-gray-600">{quiz.className || quiz.class || "—"}</p>
                    </div>
                    <Badge
                      className={`rounded-full ${
                        quiz.status === "active"
                          ? "bg-[#43E6B5]/10 text-[#43E6B5]"
                          : quiz.status === "completed"
                          ? "bg-[#6C63FF]/10 text-[#6C63FF]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {quiz.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {quiz.date || quiz.deadline || quiz.createdAt || "—"}
                    </div>
                    <div className="text-gray-700 font-medium">
                      {quiz.submitted ?? quiz.submissionCount ?? 0}/
                      {quiz.total ?? quiz.totalStudents ?? "—"} submitted
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showClassModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Create New Class</h3>

            <div className="space-y-5 mb-6">
              <div>
                <Label className="text-gray-700 mb-2 block">Class Name</Label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 px-4 py-3"
                  placeholder="e.g. S3 Biology 2026"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 px-4 py-3"
                  placeholder="e.g. Biology"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Education Level</Label>
                <Select value={educationLevel} onValueChange={(value) => {
                  setEducationLevel(value);
                  setSublevel("");
                }}>
                  <SelectTrigger className="rounded-xl border-2 border-gray-200 px-4 py-3">
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
                  <Label className="text-gray-700 mb-2 block">Grade/Year</Label>
                  <Select value={sublevel} onValueChange={setSublevel}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 px-4 py-3">
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

              <p className="text-xs text-gray-500">
                A join code will be generated automatically when you create the class.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClassModal(false)}
                className="flex-1 border-2 border-gray-200 rounded-xl py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={creating}
                className="flex-1 bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl py-3"
              >
                {creating ? "Creating…" : "Create Class"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
