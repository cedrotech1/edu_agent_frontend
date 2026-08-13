import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Settings, Camera, Lock, Mail, LogOut, Save, X } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

const sectionCard = "bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm";
const inputCls = "w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-sm focus:outline-none focus:border-[#272757] text-[#0F0E47]";

export function ParentSettings() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("Maria Martinez");
  const [email, setEmail] = useState("maria@email.com");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [notifs, setNotifs] = useState({ quizComplete: true, teacherFeedback: true, scoreDrop: true, newQuiz: false });

  return (
    <AppShell role="parent" pending={true} pageTitle="Settings">
      <div className="max-w-2xl space-y-5">

        {/* Profile */}
        <div className={sectionCard}>
          <h2 className="text-sm font-semibold text-[#0F0E47] border-l-[3px] border-[#272757] pl-3 mb-5">Profile</h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-20 h-20 bg-[#272757] rounded-full flex items-center justify-center text-white text-2xl font-bold">MM</div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-[#E2E8F0] flex items-center justify-center shadow-sm hover:bg-[#EDE9FE] transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#272757]" style={{ strokeWidth: 1.75 }} />
              </button>
            </div>
            <div><p className="font-semibold text-[#0F0E47]">Profile Photo</p><p className="text-xs text-[#8686AC]">Click camera to update</p></div>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm text-[#64748B] mb-1">Full Name</label><input className={inputCls} value={fullName} onChange={e => setFullName(e.target.value)} /></div>
            <div><label className="block text-sm text-[#64748B] mb-1">Email</label><input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          </div>
          <button onClick={() => toast.success("Profile updated!")} className="mt-4 flex items-center gap-2 bg-[#272757] text-white h-10 px-5 rounded-xl text-sm font-semibold hover:bg-[#1A1952] transition-colors">
            <Save className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Save Changes
          </button>
        </div>

        {/* Security */}
        <div className={sectionCard}>
          <h2 className="text-sm font-semibold text-[#0F0E47] border-l-[3px] border-[#272757] pl-3 mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#272757]" style={{ strokeWidth: 1.75 }} /> Security
          </h2>
          <div className="space-y-3">
            <button onClick={() => setShowPasswordModal(true)} className="w-full bg-[#272757] text-white rounded-xl h-10 text-sm hover:bg-[#1A1952] transition-colors">Change Password</button>
            <button onClick={() => toast.success("Reset link sent to " + email)} className="w-full border border-[#272757] text-[#272757] rounded-xl h-10 text-sm flex items-center justify-center gap-2 hover:bg-[#EDE9FE] transition-colors">
              <Mail className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Reset Password via Email
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={sectionCard}>
          <h2 className="text-sm font-semibold text-[#0F0E47] border-l-[3px] border-[#272757] pl-3 mb-5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#272757]" style={{ strokeWidth: 1.75 }} /> Notification Preferences
          </h2>
          <div className="space-y-5">
            {[
              { key: "quizComplete",    label: "Child completed a quiz",          desc: "Get notified with their score when a quiz is submitted." },
              { key: "teacherFeedback", label: "Teacher left feedback on a quiz", desc: "When a teacher adds comments to a quiz result." },
              { key: "scoreDrop",       label: "Child's score dropped below 50%", desc: "Alert when a quiz score falls below 50%." },
              { key: "newQuiz",         label: "New quiz assigned to child",      desc: "When a teacher assigns a new quiz to your child's class." },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div><p className="font-medium text-[#0F0E47] text-sm">{label}</p><p className="text-xs text-[#8686AC]">{desc}</p></div>
                <Switch checked={(notifs as Record<string, boolean>)[key]} onCheckedChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => { toast.success("Logged out"); navigate("/login"); }}
          className="w-full border border-red-300 text-red-500 rounded-xl h-11 text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Logout
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#0F0E47]">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="space-y-4 mb-5">
              {[
                { label: "Current Password", val: currentPw, set: setCurrentPw },
                { label: "New Password",     val: newPw,     set: setNewPw },
                { label: "Confirm Password", val: confirmPw, set: setConfirmPw },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="block text-sm text-[#64748B] mb-1">{label}</label>
                  <input type="password" value={val} onChange={e => set(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 border border-[#E2E8F0] rounded-xl h-10 text-sm text-[#64748B] hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { if (newPw === confirmPw) { toast.success("Password updated!"); setShowPasswordModal(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); } else toast.error("Passwords don't match"); }}
                className="flex-1 bg-[#272757] text-white rounded-xl h-10 text-sm font-semibold hover:bg-[#1A1952] transition-colors">Update Password</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
