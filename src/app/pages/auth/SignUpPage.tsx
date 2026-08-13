import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { AuthFooter } from "../../components/AuthFooter";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Globe, ChevronDown, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError, type UserRole } from "@/lib/api";
import { toast } from "sonner";

export function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>("teacher");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [lang, setLang] = useState<"EN" | "RW">("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!institution.trim()) e.institution = "School / institution is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError("");
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        institution: institution.trim(),
        role,
      });
      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/verify-email");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Sign up failed. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page flex flex-col relative">
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#272757] text-white text-sm flex items-center justify-between px-6 py-3">
          <span>Kinyarwanda translation coming soon.</span>
          <button onClick={() => setShowBanner(false)} className="ml-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="fixed top-5 right-5 z-40" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 text-sm bg-white rounded-xl px-3.5 py-2.5 text-[#64748B] hover:text-[#272757] shadow-[0_2px_12px_rgba(15,14,71,0.06)] transition-all"
          >
            <Globe className="w-4 h-4" style={{ strokeWidth: 1.75 }} />
            {lang === "EN" ? "EN" : "RW"}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {langOpen && (
            <div className="absolute top-full right-0 mt-2 w-44 public-surface-soft overflow-hidden z-50 py-1.5">
              {[{ code: "EN", label: "English" }, { code: "RW", label: "Kinyarwanda" }].map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code as "EN" | "RW");
                    setLangOpen(false);
                    if (l.code === "RW") setShowBanner(true);
                    else setShowBanner(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#272757]/6 ${
                    lang === l.code ? "text-[#272757] font-semibold" : "text-[#0F0E47]"
                  }`}
                >
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="public-surface w-full max-w-md p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <Logo variant="horizontal" size="md" />
            </div>
            <p className="text-[#8686AC] text-base">Create your account to get started</p>
          </div>

          <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-7">
            <TabsList className="grid grid-cols-3 w-full bg-[#F4F5F9] rounded-xl p-1.5 h-auto border-0 shadow-none">
              <TabsTrigger
                value="teacher"
                className="rounded-lg py-2.5 data-[state=active]:bg-[#272757] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Teacher
              </TabsTrigger>
              <TabsTrigger
                value="student"
                className="rounded-lg py-2.5 data-[state=active]:bg-[#272757] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Student
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="rounded-lg py-2.5 data-[state=active]:bg-[#272757] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Admin
              </TabsTrigger>
            </TabsList>
            <p className="text-center text-sm text-[#8686AC] mt-3">
              {role === "teacher" && "Create quizzes, track classes and review results"}
              {role === "student" && "Join classes, take quizzes and see your feedback"}
              {role === "admin" && "Manage users and oversee the entire platform"}
            </p>
          </Tabs>

          <form onSubmit={handleSignUp} className="space-y-5">
            {formError && (
              <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3.5">{formError}</p>
            )}
            <div>
              <Label htmlFor="name" className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                className={`public-input ${errors.name ? "public-input-error" : ""}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                className={`public-input ${errors.email ? "public-input-error" : ""}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  className={`public-input pr-11 ${errors.password ? "public-input-error" : ""}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8686AC] hover:text-[#505081]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="institution" className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                School / Institution
              </Label>
              <Input
                id="institution"
                type="text"
                value={institution}
                onChange={(e) => { setInstitution(e.target.value); setErrors((p) => ({ ...p, institution: "" })); }}
                className={`public-input ${errors.institution ? "public-input-error" : ""}`}
                placeholder="Your School Name"
              />
              {errors.institution && <p className="text-red-500 text-sm mt-1.5">{errors.institution}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input type="checkbox" className="mt-1 w-4 h-4 rounded accent-[#272757] cursor-pointer" />
              <p className="text-sm text-[#8686AC] leading-relaxed">
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-[#272757] hover:text-[#505081] font-medium">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" target="_blank" className="text-[#272757] hover:text-[#505081] font-medium">Privacy Policy</a>
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="public-btn-primary w-full h-12 py-6 text-base"
            >
              {submitting ? "Creating account…" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#8686AC]">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#272757] font-semibold hover:text-[#505081]"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
