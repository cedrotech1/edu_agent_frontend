import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Sparkles, Users, BookOpen, Shield, Activity, TrendingUp,
  Flag, ArrowRight, UserPlus, Settings,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

function formatActivityTime(raw: string) {
  if (!raw) return "";
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return d.toLocaleString();
  }
  return raw;
}

const defaultActivity = [
  { id: 1, type: "quiz", icon: BookOpen, color: "bg-[#EDE9FE] text-[#272757]", message: "Ms. Johnson created 'S3 Biology Quiz 2'", time: "5 min ago" },
  { id: 2, type: "flag", icon: Flag, color: "bg-red-50 text-red-500", message: "Quiz 'Physics Chapter 3' flagged for suspicious activity", time: "1 hour ago" },
  { id: 3, type: "signup", icon: UserPlus, color: "bg-emerald-50 text-emerald-600", message: "New teacher registered: Dr. Mukama from INES Ruhengeri", time: "2 hours ago" },
];

const quickLinks = [
  { label: "User Management", icon: Users, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]", path: "/admin/users", desc: "Manage teachers & students" },
  { label: "Quiz Oversight", icon: BookOpen, iconBg: "bg-gray-50", iconColor: "text-[#272757]", path: "/admin/quiz-oversight", desc: "Monitor all platform quizzes" },
  { label: "AI Grading Logs", icon: Sparkles, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", path: "/admin/grading-logs", desc: "Review AI grades & overrides" },
  { label: "Platform Settings", icon: Settings, iconBg: "bg-amber-50", iconColor: "text-amber-600", path: "/admin/platform-settings", desc: "Configure platform options" },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teachers: 0, students: 0, quizzes: 0, aiGradingsToday: 0 });
  const [activity, setActivity] = useState(defaultActivity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sRes, aRes] = await Promise.all([api.admin.stats(), api.admin.activity()]);
        const s: any = sRes.data || {};
        const teachers = Number(
          s.users?.teachers ?? s.teachers ?? s.totalTeachers ?? 0
        );
        const students = Number(
          s.users?.students ?? s.students ?? s.totalStudents ?? 0
        );
        const quizzes = Number(
          typeof s.quizzes === "object" && s.quizzes != null
            ? s.quizzes.total ?? s.quizzes.active ?? 0
            : s.quizzes ?? s.totalQuizzes ?? 0
        );
        const aiGradingsToday = Number(
          s.aiGradingsToday ??
            s.gradingsToday ??
            s.flaggedAnswers ??
            0
        );
        setStats({
          teachers,
          students,
          quizzes,
          aiGradingsToday,
        });
        const acts = Array.isArray(aRes.data)
          ? (aRes.data as any[])
          : Array.isArray((aRes.data as any)?.activity)
            ? (aRes.data as any).activity
            : [];
        if (acts.length) {
          setActivity(
            acts.map((a: any, i: number) => ({
              id: a.id || i,
              type: a.type || "quiz",
              icon: a.type === "flag" ? Flag : a.type === "signup" ? UserPlus : BookOpen,
              color: a.color || "bg-[#EDE9FE] text-[#272757]",
              message: a.message || a.text || "",
              time: formatActivityTime(a.time || a.at || a.createdAt || ""),
            }))
          );
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: "Total Teachers", value: loading ? "…" : String(stats.teachers), icon: BookOpen, iconBg: "bg-[#EDE9FE]", iconColor: "text-[#272757]" },
    { label: "Total Students", value: loading ? "…" : String(stats.students), icon: Users, iconBg: "bg-gray-50", iconColor: "text-[#272757]" },
    { label: "Total Quizzes", value: loading ? "…" : String(stats.quizzes), icon: Shield, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "AI Gradings Today", value: loading ? "…" : String(stats.aiGradingsToday), icon: Activity, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <AppShell role="admin" pageTitle="Dashboard">
      {loading && <p className="text-gray-500 mb-4">Loading…</p>}
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <Card key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
                <p className="text-3xl font-semibold text-[#0F0E47] tracking-tight">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-[18px] h-[18px] ${iconColor}`} strokeWidth={1.75} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick links */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-[#0F0E47] mb-4">Admin Sections</h2>
          <div className="space-y-3">
            {quickLinks.map(({ label, icon: Icon, iconBg, iconColor, path, desc }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow transition-all text-left flex items-center gap-4 group border border-gray-100 hover:border-gray-200"
              >
                <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F0E47] group-hover:text-[#272757] transition-colors text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#272757] transition-colors shrink-0" />
              </button>
            ))}
          </div>

          {/* Platform health */}
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm mt-5 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#0F0E47] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Platform Health
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "AI Accuracy", value: "94%", color: "bg-emerald-500" },
                { label: "Avg Quiz Score", value: "81%", color: "bg-[#272757]" },
                { label: "Submission Rate", value: "89%", color: "bg-[#505081]" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-[#0F0E47]">{value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-[#0F0E47] mb-4">Recent Activity</h2>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {activity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 p-5 ${i < activity.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0F0E47] text-sm leading-snug">{item.message}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Flagged quizzes quick card */}
          <Card className="bg-white rounded-xl border border-red-100 shadow-sm p-5 mt-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-500" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-semibold text-[#0F0E47] text-sm">2 quizzes flagged for review</p>
                  <p className="text-xs text-gray-500">Suspicious activity detected by AI</p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/admin/quiz-oversight")}
                className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl px-4"
              >
                Review <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
