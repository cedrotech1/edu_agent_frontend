import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { AuthFooter } from "../../components/AuthFooter";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-9">
            <Logo size="lg" />
            <p className="text-[#8686AC] text-sm mt-3">Sign in to your account</p>
          </div>

          <div className="public-surface p-8 sm:p-10">
            <form onSubmit={handleLogin} className="space-y-5">
              {formError && (
                <div className="rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">{formError}</div>
              )}
              <div>
                <Label className="mb-2 block text-[#0F0E47]">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="public-input"
                  placeholder="you@school.edu"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label className="mb-2 block text-[#0F0E47]">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="public-input pr-11"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8686AC]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="public-btn-primary w-full h-12 py-6 text-base"
              >
                {submitting ? "Signing in…" : "Sign In"}
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
      </div>
      <AuthFooter />
    </div>
  );
}
