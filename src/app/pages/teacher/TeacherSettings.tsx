import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Lock,
  Mail,
  AlertTriangle,
  LogOut,
  Building2,
  User,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AppShell } from "../../components/AppShell";

function pickProfile(user: Record<string, unknown> | null | undefined) {
  if (!user) {
    return { name: "", email: "", school: "", role: "", phone: "" };
  }
  const name =
    (typeof user.name === "string" && user.name) ||
    (typeof user.names === "string" && user.names) ||
    "";
  const email = typeof user.email === "string" ? user.email : "";
  const school =
    (typeof user.school === "string" && user.school) ||
    (typeof user.institution === "string" && user.institution) ||
    "";
  const role = typeof user.role === "string" ? user.role : "";
  const phone = typeof user.phone === "string" ? user.phone : "";
  return { name, email, school, role, phone };
}

export function TeacherSettings() {
  const navigate = useNavigate();
  const { user, logout, refreshMe, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(() => pickProfile(user as any));
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const me = await refreshMe();
        if (!cancelled) {
          setProfile(pickProfile((me || user) as any));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  useEffect(() => {
    if (user) setProfile(pickProfile(user as any));
  }, [user]);

  const handlePasswordReset = async () => {
    const email = profile.email?.trim();
    if (!email) {
      toast.error("No email on your profile");
      return;
    }
    try {
      await api.auth.forgotPassword(email);
      toast.success("Password reset link sent!", {
        description: "Check your email for the reset link.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send reset email");
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
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
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
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
  };

  const displayName = profile.name || "Teacher";
  const avatar = initials(displayName);
  const roleLabel =
    profile.role === "teacher"
      ? "Teacher"
      : profile.role
        ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
        : "Teacher";

  const infoRows = [
    { label: "Full name", value: profile.name || "—", icon: User },
    { label: "Email", value: profile.email || "—", icon: Mail },
    { label: "School / Institution", value: profile.school || "—", icon: Building2 },
    { label: "Role", value: roleLabel, icon: Shield },
  ];

  return (
    <AppShell role="teacher" pageTitle="Settings">
      <div className="max-w-2xl mx-auto space-y-5">
        {(loading || authLoading) && (
          <p className="text-sm text-gray-500">Loading profile…</p>
        )}

        {/* Profile overview */}
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#272757] flex items-center justify-center text-white text-xl font-semibold shrink-0">
                {avatar || "?"}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[#0F0E47] truncate">{displayName}</h2>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {profile.email || "No email on file"}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDE9FE] text-[#272757]">
                    {roleLabel}
                  </span>
                  {profile.school ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" />
                      {profile.school}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-4 pb-2">
              Account details
            </p>
            <div className="divide-y divide-gray-100">
              {infoRows.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-[#272757]" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-[#0F0E47] break-words">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 pb-5 pt-1">
              Profile details are managed by your account. Contact an admin to update your name or school.
            </p>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#272757]" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-[#0F0E47]">Security</h2>
          </div>
          <div className="p-5 space-y-3">
            <Button
              onClick={() => setShowPasswordModal(true)}
              className="w-full bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10"
            >
              Change Password
            </Button>
            <Button
              onClick={handlePasswordReset}
              variant="outline"
              className="w-full border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-10"
            >
              <Mail className="w-4 h-4 mr-2" />
              Reset Password via Email
            </Button>
          </div>
        </Card>

        {/* Account actions */}
        <Card className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-red-600">Account</h2>
          </div>
          <div className="p-5 space-y-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border border-gray-200 text-[#272757] hover:bg-gray-50 rounded-xl h-10 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="outline"
              className="w-full border border-red-200 text-red-500 hover:bg-red-50 rounded-xl h-10"
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowPasswordModal(false)}
          role="presentation"
        >
          <Card
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#0F0E47]">Change Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordChange();
              }}
              className="space-y-4 mb-6"
            >
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Current Password
                </Label>
                <Input
                  type="password"
                  name="current-password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  New Password
                </Label>
                <Input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Confirm New Password
                </Label>
                <Input
                  type="password"
                  name="confirm-password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl border border-gray-200 h-10"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 border border-gray-200 rounded-xl h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10"
                >
                  {changingPassword ? "Updating…" : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-md">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-[#0F0E47] mb-1">Delete Account</h3>
              <p className="text-xs text-gray-500">
                This cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
            <div className="mb-5">
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </Label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="rounded-xl border border-red-200 text-center font-mono h-10"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="flex-1 border border-gray-200 rounded-xl h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-10"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
