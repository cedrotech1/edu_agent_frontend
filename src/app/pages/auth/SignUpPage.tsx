import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { AuthFooter } from "../../components/AuthFooter";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, ApiError, type UserRole } from "@/lib/api";
import { toast } from "sonner";

export function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>("teacher");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolIds, setSchoolIds] = useState<number[]>([]);
  const [schools, setSchools] = useState<Array<{ id: number; name: string; location?: string }>>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      setSchoolsLoading(true);
      try {
        const res = await api.schools.public();
        setSchools(((res.data as any[]) || []).map((s) => ({
          id: s.id,
          name: s.name,
          location: s.location,
        })));
      } catch {
        setSchools([]);
      } finally {
        setSchoolsLoading(false);
      }
    })();
  }, []);

  const toggleSchool = (id: number) => {
    setSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setErrors((p) => ({ ...p, schools: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!schoolIds.length) e.schools = "Select at least one school from the list";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError("");
    try {
      const primary = schools.find((s) => s.id === schoolIds[0]);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        schoolIds,
        primarySchoolId: schoolIds[0],
        institution: primary?.name,
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
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="public-surface w-full max-w-md p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <Logo variant="horizontal" size="md" />
            </div>
            <p className="text-[#8686AC] text-base">Create your account to get started</p>
          </div>

          <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-7">
            <TabsList className="grid grid-cols-2 w-full bg-[#F4F5F9] rounded-xl p-1.5 h-auto border-0 shadow-none">
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
            </TabsList>
            <p className="text-center text-sm text-[#8686AC] mt-3">
              {role === "teacher" && "Create quizzes, track classes and review results"}
              {role === "student" && "Join classes, take quizzes and see your feedback"}
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
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: "" }));
                }}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  className={`public-input pr-11 ${errors.password ? "public-input-error" : ""}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8686AC] hover:text-[#505081]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <Label className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                Schools (select one or more)
              </Label>
              <p className="text-xs text-[#8686AC] mb-2">
                Schools are managed by admins. You can belong to multiple schools.
              </p>
              {schoolsLoading ? (
                <p className="text-sm text-gray-400">Loading schools…</p>
              ) : schools.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                  No active schools yet. Ask an admin to add your school first.
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-50">
                  {schools.map((s) => {
                    const on = schoolIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm ${
                          on ? "bg-[#EDE9FE]" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleSchool(s.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="font-medium text-[#0F0E47]">{s.name}</span>
                        {s.location && (
                          <span className="text-xs text-gray-400 ml-auto">{s.location}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.schools && <p className="text-red-500 text-sm mt-1.5">{errors.schools}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitting || schoolsLoading}
              className="public-btn-primary w-full h-12 py-6 text-base"
            >
              {submitting ? "Creating account…" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#8686AC]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#272757] font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
