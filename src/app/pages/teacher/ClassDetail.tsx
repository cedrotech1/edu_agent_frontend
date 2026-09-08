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
import { AppShell } from "../../components/AppShell";

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
      <AppShell role="teacher" pageTitle="Class Detail">
        <div className="flex items-center justify-center text-gray-600 py-16">
          Loading class…
        </div>
      </AppShell>
    );
  }

  if (!cls) {
    return (
      <AppShell role="teacher" pageTitle="Class Detail">
        <div className="flex items-center justify-center py-16">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">Class not found</p>
            <Button onClick={() => navigate("/teacher")} className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl">
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </AppShell>
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
    <AppShell role="teacher" pageTitle="Class Detail">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/teacher")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-[#0F0E47]">{cls.name}</h2>
            <p className="text-sm text-gray-500">{cls.subject} · {cls.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
            <span className="font-mono font-semibold text-[#272757] text-sm tracking-wide">{cls.code}</span>
            <button onClick={copyCode} className="text-gray-400 hover:text-[#272757]">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Students
          </Button>
        </div>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Students</p>
                <p className="text-3xl font-semibold text-[#0F0E47] tracking-tight">{students.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <Users className="w-[18px] h-[18px] text-[#272757]" strokeWidth={1.75} />
              </div>
            </div>
          </Card>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Quizzes</p>
                <p className="text-3xl font-semibold text-[#0F0E47] tracking-tight">{quizzes.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                <BookOpen className="w-[18px] h-[18px] text-[#272757]" strokeWidth={1.75} />
              </div>
            </div>
          </Card>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Class Avg</p>
                <p className="text-3xl font-semibold text-emerald-600 tracking-tight">{classAvg}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-[18px] h-[18px] text-emerald-600" strokeWidth={1.75} />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          {(["students", "quizzes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t
                  ? "bg-[#272757] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t === "students" ? `Students (${students.length})` : `Quizzes (${quizzes.length})`}
            </button>
          ))}
        </div>

        {tab === "students" && (
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {students.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No students yet</h3>
                <p className="text-xs text-gray-500 mb-5">Share the join code or invite by email</p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 text-sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add Students
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const avg = s.avg ?? s.avgScore ?? 0;
                    return (
                      <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#272757] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {s.initials || initials(s.name)}
                            </div>
                            <span className="text-sm font-medium text-[#0F0E47]">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 text-sm">{s.email}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-semibold text-[#0F0E47] text-sm">{s.completed ?? 0}</span>
                          <span className="text-gray-400 text-sm"> / {quizzes.length}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`font-semibold text-sm ${avg >= 80 ? "text-emerald-600" : avg >= 65 ? "text-[#272757]" : "text-amber-600"}`}>
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
          <div className="space-y-3">
            {quizzes.length === 0 ? (
              <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">No quizzes yet</h3>
                <p className="text-xs text-gray-500 mb-5">Create your first quiz for this class</p>
                <Button
                  onClick={() => navigate("/teacher/quiz-builder")}
                  className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 text-sm"
                >
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
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-gray-200 hover:shadow transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-[#272757]" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#0F0E47] truncate">{q.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due {formatDateTime(q.deadline)}</span>
                            <span>·</span>
                            <span>{submissions} submitted</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {avg > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Class avg</p>
                            <p className="text-sm font-semibold text-[#272757]">{avg}%</p>
                          </div>
                        )}
                        <Badge className={`rounded-full text-[11px] ${
                          q.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {q.status === "active" ? "Active" : q.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-7 w-full max-w-md">
            <h3 className="text-base font-semibold text-[#0F0E47] mb-1">Add Students</h3>
            <p className="text-xs text-gray-500 mb-5">Invite by email or share the class code</p>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
              <p className="text-xs font-medium text-gray-500 mb-2">Share class code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-lg px-3 py-2.5 font-mono text-lg font-semibold text-[#272757] tracking-widest text-center border border-gray-100">
                  {cls.code}
                </div>
                <button
                  onClick={copyCode}
                  className="p-2.5 bg-[#272757] hover:bg-[#505081] text-white rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or invite by email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-2 mb-5">
              <Label className="text-sm text-gray-700">Student Email</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className="rounded-xl border border-gray-200"
                  onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                />
                <Button
                  onClick={sendInvite}
                  disabled={emailSent}
                  className={`rounded-xl px-4 ${emailSent ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#272757] hover:bg-[#505081]"} text-white`}
                >
                  {emailSent ? <CheckCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setShowAddModal(false)}
              variant="outline"
              className="w-full border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl"
            >
              Done
            </Button>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
