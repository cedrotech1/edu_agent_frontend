import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthFooter } from "../../components/AuthFooter";

export function ParentSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", childStudentId: "", school: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputCls = "public-input";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (!form.fullName || !form.email || !form.password || !form.childStudentId || !form.school) { toast.error("Please fill in all fields"); return; }
    navigate("/parent/pending-verification");
  };

  return (
    <div className="public-page flex flex-col">
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-9">
            <div className="public-icon-well w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-[#272757] text-xl font-black">Q</span>
            </div>
            <span className="text-2xl font-bold text-[#0F0E47]">
              QuizMind <span className="text-[#505081]">AI</span>
            </span>
          </div>

          <div className="public-surface p-8 sm:p-10">
            <h1 className="text-xl font-bold text-[#0F0E47] mb-1.5">Create Parent Account</h1>
            <p className="text-[0.95rem] text-[#8686AC] mb-7">Monitor your child's learning journey</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-[#0F0E47] font-medium mb-2.5">Full Name</label>
                <input className={inputCls} placeholder="Maria Martinez" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-[#0F0E47] font-medium mb-2.5">Email</label>
                <input type="email" className={inputCls} placeholder="maria@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-[#0F0E47] font-medium mb-2.5">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} className={inputCls + " pr-11"} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8686AC]">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#0F0E47] font-medium mb-2.5">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} className={inputCls + " pr-11"} placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8686AC]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#0F0E47] font-medium mb-2.5">Child Student ID</label>
                <input className={inputCls} placeholder="e.g. STU-2026-0042" value={form.childStudentId} onChange={e => setForm(f => ({ ...f, childStudentId: e.target.value }))} />
                <p className="text-xs text-[#8686AC] mt-1.5">Ask your child's school for their Student ID</p>
              </div>
              <div>
                <label className="block text-sm text-[#0F0E47] font-medium mb-2.5">School</label>
                <input className={inputCls} placeholder="e.g. Kigali Primary School" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} />
              </div>
              <button type="submit" className="public-btn-primary w-full h-12 text-base mt-1">
                Create Parent Account
              </button>
            </form>

            <p className="text-center text-sm text-[#8686AC] mt-7">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-[#272757] font-semibold hover:text-[#505081]">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
