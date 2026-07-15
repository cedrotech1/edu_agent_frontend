from pathlib import Path

root = Path(r"c:\Users\HUAWEI\Desktop\new\tc-ai-agent\edu_agent_frontend\src\app\pages")

settings_files = [
    ("teacher/TeacherSettings.tsx", "/teacher"),
    ("student/StudentSettings.tsx", "/student"),
    ("admin/AdminSettings.tsx", "/admin"),
]

for rel, home in settings_files:
    path = root / rel
    text = path.read_text(encoding="utf-8")
    if "api.users.update" in text:
        print(rel, "already")
        continue

    text = text.replace(
        'import { useState } from "react";',
        'import { useEffect, useState } from "react";',
    )
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError, initials } from "@/lib/api";\nimport { useAuth } from "@/lib/auth";',
    )

    # Find the export function line and inject auth usage after navigate
    marker = "export function "
    # replace common state defaults and handlers
    text = text.replace(
        "  const navigate = useNavigate();\n  const [fullName, setFullName] = useState(",
        "  const navigate = useNavigate();\n  const { user, logout, refreshMe, setSession } = useAuth();\n  const [fullName, setFullName] = useState(",
    )

    # Replace hardcoded initial values with empty then useEffect
    import re
    text = re.sub(
        r'const \[fullName, setFullName\] = useState\("[^"]*"\);',
        'const [fullName, setFullName] = useState("");',
        text,
        count=1,
    )
    text = re.sub(
        r'const \[email, setEmail\] = useState\("[^"]*"\);',
        'const [email, setEmail] = useState("");',
        text,
        count=1,
    )
    text = re.sub(
        r'const \[school, setSchool\] = useState\("[^"]*"\);',
        'const [school, setSchool] = useState("");',
        text,
        count=1,
    )

    inject = """
  useEffect(() => {
    if (!user) return;
    setFullName(user.name || "");
    setEmail(user.email || "");
    setSchool(user.school || "");
  }, [user]);
"""
    text = text.replace(
        '  const [confirmPassword, setConfirmPassword] = useState("");\n\n  const handleSaveProfile',
        '  const [confirmPassword, setConfirmPassword] = useState("");\n' + inject + '\n  const handleSaveProfile',
    )

    text = text.replace(
        """  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!", {
      description: "Your changes have been saved.",
    });
  };""",
        """  const handleSaveProfile = async () => {
    if (!user?.id) return;
    try {
      await api.users.update(user.id, { name: fullName, email, school });
      await refreshMe();
      toast.success("Profile updated successfully!", {
        description: "Your changes have been saved.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile");
    }
  };""",
    )

    text = text.replace(
        """  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    toast.success("Password updated successfully!");
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };""",
        """  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    try {
      await api.users.changePassword({
        currentPassword,
        oldPassword: currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password updated successfully!");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to change password");
    }
  };""",
    )

    text = text.replace(
        """  const handleDeleteAccount = () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    toast.success("Account deletion initiated", {
      description: "Your account will be deleted within 24 hours.",
    });
    setShowDeleteModal(false);
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/login");
  };""",
        """  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    try {
      await api.users.deleteMe();
      await logout();
      toast.success("Account deleted");
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete account");
    }
    setShowDeleteModal(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };""",
    )

    # Avatar initials replacement - common MJ/AM/AD patterns
    text = re.sub(
        r'(<div className="w-24 h-24[^>]*>\s*)\n\s*[A-Z]{2}\n',
        r'\1\n                {initials(fullName || user?.name)}\n',
        text,
        count=1,
    )

    path.write_text(text, encoding="utf-8")
    print(rel, "patched")

# Teacher onboarding - create class via API
to = root / "auth/TeacherOnboarding.tsx"
text = to.read_text(encoding="utf-8")
if "api.classes.create" not in text:
    text = text.replace(
        'import { BookOpen, Users, Sparkles, CheckCircle, Copy, ArrowRight } from "lucide-react";',
        'import { BookOpen, Users, Sparkles, CheckCircle, Copy, ArrowRight } from "lucide-react";\nimport { toast } from "sonner";\nimport { api, ApiError } from "@/lib/api";',
    )
    text = text.replace(
        '  const [classCode] = useState(generateCode);\n  const [copied, setCopied] = useState(false);\n  const [errors, setErrors] = useState<Record<string, string>>({});',
        '  const [classCode, setClassCode] = useState("");\n  const [copied, setCopied] = useState(false);\n  const [errors, setErrors] = useState<Record<string, string>>({});\n  const [creating, setCreating] = useState(false);',
    )
    text = text.replace(
        """  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step < 2) setStep(step + 1);
    else navigate("/teacher/quiz-builder");
  };""",
        """  const handleNext = async () => {
    if (step === 0) {
      if (!validateStep0()) return;
      setCreating(true);
      try {
        const res = await api.classes.create({
          name: className,
          subject,
          educationLevel,
          subLevel,
        });
        const created: any = res.data || {};
        setClassCode(created.code || generateCode());
        toast.success("Class created!");
        setStep(1);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to create class");
      } finally {
        setCreating(false);
      }
      return;
    }
    if (step < 2) setStep(step + 1);
    else navigate("/teacher/quiz-builder");
  };""",
    )
    # disable button while creating if present - optional
    to.write_text(text, encoding="utf-8")
    print("TeacherOnboarding patched")
else:
    print("TeacherOnboarding already")

# Student onboarding
so = root / "auth/StudentOnboarding.tsx"
text = so.read_text(encoding="utf-8")
if "api.classes.join" not in text:
    text = text.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { api, ApiError } from "@/lib/api";',
    )
    text = text.replace(
        """  const handleJoin = () => {
    if (!classCode.trim()) {
      setCodeError("Please enter a class code");
      return;
    }
    if (classCode.trim().length < 4) {
      setCodeError("That code looks too short — check with your teacher");
      return;
    }
    setCodeError("");
    setJoined(true);
  };""",
        """  const handleJoin = async () => {
    if (!classCode.trim()) {
      setCodeError("Please enter a class code");
      return;
    }
    if (classCode.trim().length < 4) {
      setCodeError("That code looks too short — check with your teacher");
      return;
    }
    setCodeError("");
    try {
      await api.classes.join(classCode.trim().toUpperCase());
      setJoined(true);
      toast.success("Joined class!");
    } catch (err) {
      setCodeError(err instanceof ApiError ? err.message : "Could not join class");
    }
  };""",
    )
    so.write_text(text, encoding="utf-8")
    print("StudentOnboarding patched")
else:
    print("StudentOnboarding already")

print("settings/onboarding done")
