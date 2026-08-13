import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { AuthFooter } from "../../components/AuthFooter";
import { Globe, ChevronDown, X, Eye, EyeOff } from "lucide-react";
import { useAuth, roleHome } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError("");
    try {
      const user = await login(email.trim(), password);
      toast.success("Welcome back!");
      navigate(roleHome(user.role));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Login failed. Please try again.";
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
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg mx-0 hover:bg-[#272757]/6 ${
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
          <div className="text-center mb-9">
            <div className="flex justify-center mb-5">
              <Logo variant="horizontal" size="md" />
            </div>
            <p className="text-[#8686AC] text-base">Welcome back — log in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {formError && (
              <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3.5">{formError}</p>
            )}
            <div>
              <Label htmlFor="email" className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                className={`public-input ${errors.email ? "public-input-error" : ""}`}
                placeholder="you@example.com"
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
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
                  className={`public-input pr-11 ${errors.password ? "public-input-error" : ""}`}
                  placeholder="••••••••"
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8686AC] hover:text-[#505081]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password}</p>}
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-[#272757] hover:text-[#505081] font-medium">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="public-btn-primary w-full h-12 py-6 text-base"
            >
              {submitting ? "Logging in…" : "Log In"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-[#EEF0F6]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-[#8686AC]">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="public-btn-ghost w-full h-12 py-6 text-base"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google SSO
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#8686AC]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-[#272757] font-semibold hover:text-[#505081]"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
