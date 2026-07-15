import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Copy,
  Users,
  Mail,
  UserPlus,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { api, initials, ApiError } from "@/lib/api";

interface Student {
  id: number;
  name: string;
  initials?: string;
  email: string;
  completed?: number;
  avg?: number;
  avgScore?: number;
}

interface ClassQuiz {
  id: number;
  title: string;
  deadline?: string;
  avg?: number;
  averageScore?: number;
  status: string;
  submissions?: number;
  submissionCount?: number;
}

interface ClassDetailData {
  id: number;
  name: string;
  subject: string;
  level?: string;
  educationLevel?: string;
  subLevel?: string;
  code: string;
  students: Student[];
  quizzes: ClassQuiz[];
}

export function ClassDetail() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [cls, setCls] = useState<ClassDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [tab, setTab] = useState<"students" | "quizzes">("students");

  const load = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await api.classes.get(classId);
      const data = res.data as ClassDetailData;
      setCls({
        ...data,
        students: data.students || [],
        quizzes: data.quizzes || [],
        level:
          data.level ||
          [data.educationLevel, data.subLevel].filter(Boolean).join(" "),
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load class");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  const copyCode = () => {
    if (!cls?.code) return;
    navigator.clipboard.writeText(cls.code);
    toast.success("Join code copied!", { description: "Share this with your students." });
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (!classId) return;
    try {
      await api.classes.invite(classId, inviteEmail.trim());
      setEmailSent(true);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setTimeout(() => {
        setEmailSent(false);
        setInviteEmail("");
      }, 2000);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send invite");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] flex items-center justify-center text-gray-600">
        Loading class…
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] flex items-center justify-center">
        <Card className="p-8 rounded-2xl text-center">
          <p className="text-gray-600 mb-4">Class not found</p>
          <Button onClick={() => navigate("/teacher")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const students = cls.students || [];
  const quizzes = cls.quizzes || [];
  const classAvg = students.length
    ? Math.round(
        students.reduce((s, st) => s + (st.avg ?? st.avgScore ?? 0), 0) / students.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/teacher")} className="rounded-xl">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{cls.name}</h1>
                <p className="text-sm text-gray-500">{cls.subject} · {cls.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#6C63FF]/5 border-2 border-[#6C63FF]/20 rounded-xl px-4 py-2">
                <span className="font-mono font-bold text-[#6C63FF] text-sm">{cls.code}</span>
                <button onClick={copyCode} className="text-[#6C63FF] hover:text-[#5851E6]">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Students
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-5 mb-8">
          <Card className="bg-gradient-to-br from-[#6C63FF] to-[#5851E6] text-white rounded-2xl p-5 shadow-lg">
            <Users className="w-8 h-8 text-white/50 mb-2" />
            <p className="text-white/80 text-sm">Students</p>
            <p className="text-4xl font-bold">{students.length}</p>
          </Card>
          <Card className="bg-gradient-to-br from-[#4FC3F7] to-[#29B5E8] text-white rounded-2xl p-5 shadow-lg">
            <BookOpen className="w-8 h-8 text-white/50 mb-2" />
            <p className="text-white/80 text-sm">Quizzes</p>
            <p className="text-4xl font-bold">{quizzes.length}</p>
          </Card>
          <Card className="bg-gradient-to-br from-[#43E6B5] to-[#2DD49E] text-white rounded-2xl p-5 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white/50 mb-2" />
            <p className="text-white/80 text-sm">Class Avg</p>
            <p className="text-4xl font-bold">{classAvg}%</p>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          {(["students", "quizzes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm capitalize transition-all ${
                tab === t
                  ? "bg-[#6C63FF] text-white shadow"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-[#6C63FF]"
              }`}
            >
              {t === "students" ? `Students (${students.length})` : `Quizzes (${quizzes.length})`}
            </button>
          ))}
        </div>

        {tab === "students" && (
          <Card className="bg-white rounded-2xl shadow-md overflow-hidden">
            {students.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No students yet</h3>
                <p className="text-gray-500 mb-6">Share the join code or invite by email</p>
                <Button onClick={() => setShowAddModal(true)} className="bg-[#6C63FF] text-white rounded-xl">
                  <UserPlus className="w-4 h-4 mr-2" /> Add Students
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Completed</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const avg = s.avg ?? s.avgScore ?? 0;
                    return (
                      <tr key={s.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#6C63FF] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {s.initials || initials(s.name)}
                            </div>
                            <span className="font-medium text-gray-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{s.email}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-800">{s.completed ?? 0}</span>
                          <span className="text-gray-400 text-sm"> / {quizzes.length}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold text-lg ${avg >= 80 ? "text-[#43E6B5]" : avg >= 65 ? "text-[#4FC3F7]" : "text-[#FFD166]"}`}>
                            {avg}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {tab === "quizzes" && (
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <Card className="bg-white rounded-2xl p-12 shadow-md text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No quizzes yet</h3>
                <p className="text-gray-500 mb-6">Create your first quiz for this class</p>
                <Button onClick={() => navigate("/teacher/quiz-builder")} className="bg-[#6C63FF] text-white rounded-xl">
                  <Sparkles className="w-4 h-4 mr-2" /> Create Quiz
                </Button>
              </Card>
            ) : (
              quizzes.map((q) => {
                const avg = q.avg ?? q.averageScore ?? 0;
                const submissions = q.submissions ?? q.submissionCount ?? 0;
                return (
                  <Card
                    key={q.id}
                    onClick={() => navigate(`/teacher/results/${q.id}`)}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#6C63FF]/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-[#6C63FF]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{q.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due {q.deadline || "—"}</span>
                            <span>·</span>
                            <span>{submissions} submitted</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {avg > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Class avg</p>
                            <p className="font-bold text-[#6C63FF]">{avg}%</p>
                          </div>
                        )}
                        <Badge className={`rounded-full ${
                          q.status === "active" ? "bg-[#43E6B5]/10 text-[#43E6B5]" : "bg-gray-100 text-gray-500"
                        }`}>
                          {q.status === "active" ? "✓ Active" : q.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Add Students</h3>
            <p className="text-gray-500 text-sm mb-6">Invite by email or share the class code</p>

            <div className="bg-[#6C63FF]/5 border-2 border-[#6C63FF]/20 rounded-2xl p-5 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Share class code</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-xl px-4 py-3 font-mono text-xl font-bold text-[#6C63FF] tracking-widest text-center border-2 border-[#6C63FF]/20">
                  {cls.code}
                </div>
                <button
                  onClick={copyCode}
                  className="p-3 bg-[#6C63FF] text-white rounded-xl hover:bg-[#5851E6]"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">or invite by email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-3 mb-6">
              <Label className="text-gray-700">Student Email</Label>
              <div className="flex gap-3">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className="rounded-xl border-2 border-gray-200 px-4 py-3"
                  onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                />
                <Button
                  onClick={sendInvite}
                  disabled={emailSent}
                  className={`rounded-xl px-4 ${emailSent ? "bg-[#43E6B5]" : "bg-[#6C63FF] hover:bg-[#5851E6]"} text-white`}
                >
                  {emailSent ? <CheckCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setShowAddModal(false)}
              variant="outline"
              className="w-full border-2 border-gray-200 rounded-xl py-3"
            >
              Done
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
