import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { ArrowLeft, Settings, Sparkles, Bell, CreditCard, Upload, Sliders } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

type Sensitivity = "low" | "medium" | "high";

export function AdminPlatformSettings() {
  const navigate = useNavigate();
  const [platformName, setPlatformName] = useState("QuizMind AI");
  const [sensitivity, setSensitivity] = useState<Sensitivity>("medium");
  const [emailDeadlines, setEmailDeadlines] = useState(true);
  const [emailResults, setEmailResults] = useState(true);
  const [emailFlagged, setEmailFlagged] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.getSettings();
        const d: any = res.data || {};
        if (d.platformName) setPlatformName(d.platformName);
        if (d.aiGradingSensitivity) setSensitivity(d.aiGradingSensitivity);
        if (d.emailDeadlines != null) setEmailDeadlines(Boolean(d.emailDeadlines));
        if (d.emailResults != null) setEmailResults(Boolean(d.emailResults));
        if (d.emailFlagged != null) setEmailFlagged(Boolean(d.emailFlagged));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.updateSettings({
        platformName,
        aiGradingSensitivity: sensitivity,
        emailDeadlines,
        emailResults,
        emailFlagged,
      });
      toast.success("Platform settings saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const sensitivityOptions: { value: Sensitivity; label: string; desc: string; color: string }[] = [
    { value: "low", label: "Low", desc: "Flag only very suspicious answers (< 50% confidence)", color: "#43E6B5" },
    { value: "medium", label: "Medium", desc: "Flag answers below 80% confidence (recommended)", color: "#FFD166" },
    { value: "high", label: "High", desc: "Flag all answers below 90% for manual review", color: "#FF6B6B" },
  ];

  return (
    <AppShell role="admin" pageTitle="System Settings">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Admin Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Platform Settings</h1>
          <p className="text-sm text-gray-500">Manage platform-wide configuration</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {loading && <p className="text-gray-500">Loading settings…</p>}
        {/* Platform identity */}
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-lg font-semibold text-gray-800">Platform Identity</h2>
          </div>
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block text-gray-700">Platform Name</Label>
              <Input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="rounded-xl border-2 border-gray-200 px-4 py-3 max-w-sm"
              />
            </div>
            <div>
              <Label className="mb-2 block text-gray-700">Platform Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#6C63FF]/10 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#6C63FF]" />
                </div>
                <button
                  onClick={() => toast.info("Logo upload coming soon")}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#6C63FF]/40 rounded-xl text-[#6C63FF] hover:border-[#6C63FF] transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* AI grading sensitivity */}
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <Sliders className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-lg font-semibold text-gray-800">AI Grading Sensitivity</h2>
          </div>
          <p className="text-gray-600 text-sm mb-5">
            Controls when AI-graded answers are flagged for teacher review.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {sensitivityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSensitivity(opt.value)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  sensitivity === opt.value
                    ? "border-[#6C63FF] bg-[#6C63FF]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-3 h-3 rounded-full mb-3" style={{ background: opt.color }} />
                <p className="font-semibold text-gray-800 mb-1">{opt.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                {sensitivity === opt.value && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Email notifications */}
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-lg font-semibold text-gray-800">Email Notifications</h2>
          </div>
          <div className="space-y-1">
            {[
              { label: "Quiz deadline reminders", desc: "Notify students 2 hours before deadline", value: emailDeadlines, set: setEmailDeadlines },
              { label: "Results ready notifications", desc: "Notify students when AI grading is complete", value: emailResults, set: setEmailResults },
              { label: "Flagged answer alerts", desc: "Notify teachers when answers are flagged for review", value: emailFlagged, set: setEmailFlagged },
            ].map(({ label, desc, value, set }) => (
              <div key={label} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <Switch checked={value} onCheckedChange={set} />
              </div>
            ))}
          </div>
        </Card>

        {/* Billing */}
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-lg font-semibold text-gray-800">Subscription & Billing</h2>
          </div>
          <div className="bg-gradient-to-r from-[#6C63FF] to-[#4FC3F7] rounded-2xl p-6 text-white mb-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Current Plan</p>
                <p className="text-2xl font-bold">Pro School Plan</p>
              </div>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Teachers", value: "50" },
                { label: "Students", value: "Unlimited" },
                { label: "Quizzes/mo", value: "500" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-white/70 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-2 border-[#6C63FF] text-[#6C63FF] rounded-xl py-3" onClick={() => navigate("/admin/billing")}>
              Manage Billing
            </Button>
            <Button className="flex-1 bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl py-3" onClick={() => navigate("/admin/subscription")}>
              Upgrade Plan
            </Button>
          </div>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#43E6B5] hover:bg-[#2DD49E] text-white py-5 rounded-2xl text-lg font-semibold shadow-lg"
        >
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </AppShell>
  );
}
