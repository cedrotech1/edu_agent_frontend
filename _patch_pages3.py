from pathlib import Path

root = Path(r"c:\Users\HUAWEI\Desktop\new\tc-ai-agent\edu_agent_frontend\src\app")

# AdminDashboard
ad = root / "pages/admin/AdminDashboard.tsx"
text = ad.read_text(encoding="utf-8")
if "api.admin.stats" not in text:
    text = text.replace(
        'import { useNavigate } from "react-router";',
        'import { useEffect, useState } from "react";\nimport { useNavigate } from "react-router";',
    )
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError, initials } from "@/lib/api";\nimport { useAuth } from "@/lib/auth";',
    )
    text = text.replace(
        """export function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/login");
  };""",
        """export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>({ teachers: 0, students: 0, quizzes: 0, aiGradingsToday: 0 });
  const [activity, setActivity] = useState(recentActivity);
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
          aiAccuracy: s.aiAccuracy,
          avgQuizScore: s.avgQuizScore,
          submissionRate: s.submissionRate,
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
  };""",
    )
    # stats values
    text = text.replace(
        """          {[
            { label: "Total Teachers", value: "24", icon: BookOpen, gradient: "from-[#6C63FF] to-[#5851E6]" },
            { label: "Total Students", value: "456", icon: Users, gradient: "from-[#4FC3F7] to-[#29B5E8]" },
            { label: "Total Quizzes", value: "187", icon: Shield, gradient: "from-[#43E6B5] to-[#2DD49E]" },
            { label: "AI Gradings Today", value: "48", icon: Activity, gradient: "from-[#FFD166] to-[#FFB830]" },
          ].map(({ label, value, icon: Icon, gradient }) => (""",
        """          {[
            { label: "Total Teachers", value: String(stats.teachers), icon: BookOpen, gradient: "from-[#6C63FF] to-[#5851E6]" },
            { label: "Total Students", value: String(stats.students), icon: Users, gradient: "from-[#4FC3F7] to-[#29B5E8]" },
            { label: "Total Quizzes", value: String(stats.quizzes), icon: Shield, gradient: "from-[#43E6B5] to-[#2DD49E]" },
            { label: "AI Gradings Today", value: String(stats.aiGradingsToday), icon: Activity, gradient: "from-[#FFD166] to-[#FFB830]" },
          ].map(({ label, value, icon: Icon, gradient }) => (",
    )
    # fix accidental quote - I may have broken the map line
    text = text.replace(
        '].map(({ label, value, icon: Icon, gradient }) => (",',
        '].map(({ label, value, icon: Icon, gradient }) => (',
    )
    text = text.replace(
        '{recentActivity.map((item) => (',
        '{activity.map((item) => (',
    )
    # avatar
    text = text.replace(
        """              <span className="text-gray-700 font-medium">Admin</span>
              <div
                className="w-10 h-10 bg-[#43E6B5] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-4 hover:ring-[#43E6B5]/20 transition-all"
                onClick={() => navigate("/admin/settings")}
              >
                AD
              </div>""",
        """              <span className="text-gray-700 font-medium">{user?.name || "Admin"}</span>
              <div
                className="w-10 h-10 bg-[#43E6B5] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-4 hover:ring-[#43E6B5]/20 transition-all"
                onClick={() => navigate("/admin/settings")}
              >
                {initials(user?.name || "Admin")}
              </div>""",
    )
    # loading notice
    text = text.replace(
        '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n        {/* Stats */}',
        '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n        {loading && <p className="text-gray-500 mb-4">Loading…</p>}\n        {/* Stats */}',
    )
    ad.write_text(text, encoding="utf-8")
    print("AdminDashboard patched")
else:
    print("AdminDashboard already patched")

# LandingPage chat
lp = root / "pages/auth/LandingPage.tsx"
text = lp.read_text(encoding="utf-8")
if "api.chat.public" not in text:
    text = text.replace(
        'import { Sparkles, Send } from "lucide-react";',
        'import { Sparkles, Send } from "lucide-react";\nimport { api } from "@/lib/api";',
    )
    text = text.replace(
        """  const handleSubmit = (question: string) => {
    const userQuestion = question || prompt;
    if (!userQuestion.trim()) return;

    // Add user message
    setChatHistory([...chatHistory, { role: "user", message: userQuestion }]);

    // Simulate AI response
    setTimeout(() => {
      const response =
        mockResponses[userQuestion] ||
        "That's a great question! QuizMind AI is an intelligent platform that helps teachers create, distribute, and grade quizzes using artificial intelligence. Students get instant feedback, and teachers save hours of work. Try signing up to explore all our features! 🚀";

      setChatHistory((prev) => [...prev, { role: "ai", message: response }]);
      setShowCTA(true);
      setPrompt("");
    }, 500);
  };""",
        """  const handleSubmit = async (question: string) => {
    const userQuestion = question || prompt;
    if (!userQuestion.trim()) return;

    setChatHistory([...chatHistory, { role: "user", message: userQuestion }]);
    setPrompt("");

    try {
      const res = await api.chat.public(userQuestion);
      const data: any = res.data || {};
      const response =
        data.reply ||
        data.message ||
        mockResponses[userQuestion] ||
        "That's a great question! QuizMind AI helps teachers create and grade quizzes with AI.";
      setChatHistory((prev) => [...prev, { role: "ai", message: response }]);
    } catch {
      const response =
        mockResponses[userQuestion] ||
        "That's a great question! QuizMind AI is an intelligent platform that helps teachers create, distribute, and grade quizzes using artificial intelligence. Students get instant feedback, and teachers save hours of work. Try signing up to explore all our features! 🚀";
      setChatHistory((prev) => [...prev, { role: "ai", message: response }]);
    }
    setShowCTA(true);
  };""",
    )
    lp.write_text(text, encoding="utf-8")
    print("LandingPage patched")
else:
    print("LandingPage already patched")

print("done3")
