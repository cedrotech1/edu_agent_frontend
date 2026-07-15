import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuth, roleHome } from "@/lib/auth";
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
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        institution: institution.trim(),
        role,
      });
      toast.success("Account created!");
      if (role === "teacher") navigate("/onboarding/teacher");
      else if (role === "student") navigate("/onboarding/student");
      else navigate(roleHome(user.role));
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
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9FF] via-[#E8E7FF] to-[#D9F5FF] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="horizontal" size="md" />
          </div>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full bg-gray-100 rounded-xl p-1">
            <TabsTrigger
              value="teacher"
              className="rounded-lg data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white"
            >
              Teacher
            </TabsTrigger>
            <TabsTrigger
              value="student"
              className="rounded-lg data-[state=active]:bg-[#4FC3F7] data-[state=active]:text-white"
            >
              Student
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="rounded-lg data-[state=active]:bg-[#43E6B5] data-[state=active]:text-white"
            >
              Admin
            </TabsTrigger>
          </TabsList>
          <p className="text-center text-sm text-gray-500 mt-2">
            {role === "teacher" && "Create quizzes, track classes and review results"}
            {role === "student" && "Join classes, take quizzes and see your feedback"}
            {role === "admin" && "Manage users and oversee the entire platform"}
          </p>
        </Tabs>

        <form onSubmit={handleSignUp} className="space-y-6">
          {formError && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{formError}</p>
          )}
          <div>
            <Label htmlFor="name" className="text-gray-700 mb-2 block">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              className={`w-full rounded-xl border-2 px-4 py-3 ${errors.name ? "border-red-400" : "border-gray-200 focus:border-[#6C63FF]"}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700 mb-2 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              className={`w-full rounded-xl border-2 px-4 py-3 ${errors.email ? "border-red-400" : "border-gray-200 focus:border-[#6C63FF]"}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 mb-2 block">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              className={`w-full rounded-xl border-2 px-4 py-3 ${errors.password ? "border-red-400" : "border-gray-200 focus:border-[#6C63FF]"}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="institution" className="text-gray-700 mb-2 block">
              School / Institution
            </Label>
            <Input
              id="institution"
              type="text"
              value={institution}
              onChange={(e) => { setInstitution(e.target.value); setErrors((p) => ({ ...p, institution: "" })); }}
              className={`w-full rounded-xl border-2 px-4 py-3 ${errors.institution ? "border-red-400" : "border-gray-200 focus:border-[#6C63FF]"}`}
              placeholder="Your School Name"
            />
            {errors.institution && <p className="text-red-500 text-sm mt-1">{errors.institution}</p>}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#6C63FF] hover:bg-[#5851E6] text-white py-6 rounded-2xl text-lg font-semibold shadow-lg"
          >
            {submitting ? "Creating account…" : "Sign Up 🚀"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#6C63FF] font-semibold hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
