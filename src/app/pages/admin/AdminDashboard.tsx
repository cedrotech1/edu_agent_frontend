import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Logo } from "../../components/Logo";
import {
  Sparkles, Users, BookOpen, Shield, Activity, TrendingUp,
  Flag, LogOut, ArrowRight, UserPlus, Settings,
  Clock,
} from "lucide-react";
import { NotificationsPanel } from "../../components/NotificationsPanel";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const defaultActivity = [
  { id: 1, type: "quiz", icon: BookOpen, color: "bg-[#6C63FF]/10 text-[#6C63FF]", message: "Ms. Johnson created 'S3 Biology Quiz 2'", time: "5 min ago" },
  { id: 2, type: "flag", icon: Flag, color: "bg-red-50 text-red-500", message: "Quiz 'Physics Chapter 3' flagged for suspicious activity", time: "1 hour ago" },
  { id: 3, type: "signup", icon: UserPlus, color: "bg-[#43E6B5]/10 text-[#43E6B5]", message: "New teacher registered: Dr. Mukama from INES Ruhengeri", time: "2 hours ago" },
];

const quickLinks = [
  { label: "User Management", icon: Users, color: "bg-[#6C63FF]", path: "/admin/users", desc: "Manage teachers & students" },
  { label: "Quiz Oversight", icon: BookOpen, color: "bg-[#4FC3F7]", path: "/admin/quiz-oversight", desc: "Monitor all platform quizzes" },
  { label: "AI Grading Logs", icon: Sparkles, color: "bg-[#43E6B5]", path: "/admin/grading-logs", desc: "Review AI grades & overrides" },
  { label: "Platform Settings", icon: Settings, color: "bg-[#FFD166]", path: "/admin/platform-settings", desc: "Configure platform options" },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ teachers: 0, students: 0, quizzes: 0, aiGradingsToday: 0 });
  const [activity, setActivity] = useState(defaultActivity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sRes, aRes] = await Promise.all([api.admin.stats(), api.admin.activity()]);
        const s: any = sRes.data || {};
        setStats({
          teachers: s.teachers ?? s.totalTeachers ?? 0,
          students: s.students ?? s.totalStudents ?? 0,
          quizzes: s.quizzes ?? s.totalQuizzes ?? 0,
          aiGradingsToday: s.aiGradingsToday ?? s.gradingsToday ?? 0,
        });
        const acts = (aRes.data as any[]) || [];
        if (Array.isArray(acts) && acts.length) {
          setActivity(
            acts.map((a: any, i: number) => ({
              id: a.id || i,
              type: a.type || "quiz",
              icon: a.type === "flag" ? Flag : a.type === "signup" ? UserPlus : BookOpen,
              color: a.color || "bg-[#6C63FF]/10 text-[#6C63FF]",
              message: a.message || a.text || "",
              time: a.time || a.createdAt || "",
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

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo variant="horizontal" size="sm" color="#43E6B5" />
              <Badge className="bg-[#43E6B5]/10 text-[#43E6B5] rounded-full">Admin</Badge>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsPanel role="admin" />
              <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
              <span className="text-gray-700 font-medium">{user?.name || "Admin"}</span>
              <div
                className="w-10 h-10 bg-[#43E6B5] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-4 hover:ring-[#43E6B5]/20 transition-all"
                onClick={() => navigate("/admin/settings")}
              >
                {initials(user?.name || "Admin")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-gray-500 mb-4">Loading…</p>}
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Teachers", value: String(stats.teachers), icon: BookOpen, gradient: "from-[#6C63FF] to-[#5851E6]" },
            { label: "Total Students", value: String(stats.students), icon: Users, gradient: "from-[#4FC3F7] to-[#29B5E8]" },
            { label: "Total Quizzes", value: String(stats.quizzes), icon: Shield, gradient: "from-[#43E6B5] to-[#2DD49E]" },
            { label: "AI Gradings Today", value: String(stats.aiGradingsToday), icon: Activity, gradient: "from-[#FFD166] to-[#FFB830]" },
          ].map(({ label, value, icon: Icon, gradient }) => (
            <Card key={label} className={`bg-gradient-to-br ${gradient} text-white rounded-3xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">{label}</p>
                  <h3 className="text-4xl font-bold">{value}</h3>
                </div>
                <Icon className="w-10 h-10 text-white/40" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick links */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Sections</h2>
            <div className="space-y-3">
              {quickLinks.map(({ label, icon: Icon, color, path, desc }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="w-full bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-4 group border-2 border-transparent hover:border-gray-200"
                >
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 group-hover:text-[#6C63FF] transition-colors">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#6C63FF] transition-colors" />
                </button>
              ))}
            </div>

            {/* Platform health */}
            <Card className="bg-white rounded-2xl p-5 shadow-md mt-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#43E6B5]" /> Platform Health
              </h3>
              <div className="space-y-3">
                {[
                  { label: "AI Accuracy", value: "94%", color: "bg-[#43E6B5]" },
                  { label: "Avg Quiz Score", value: "81%", color: "bg-[#4FC3F7]" },
                  { label: "Submission Rate", value: "89%", color: "bg-[#6C63FF]" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <Card className="bg-white rounded-2xl shadow-md overflow-hidden">
              {activity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 p-5 ${i < activity.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm leading-snug">{item.message}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Flagged quizzes quick card */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-100 rounded-2xl p-5 mt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Flag className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">2 quizzes flagged for review</p>
                    <p className="text-sm text-gray-500">Suspicious activity detected by AI</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/admin/quiz-oversight")}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4"
                >
                  Review <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
