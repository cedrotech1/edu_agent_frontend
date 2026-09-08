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
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError, initials } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function AdminSettings() {
  const navigate = useNavigate();
  const { user, logout, refreshMe } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.name || "");
    setEmail(user.email || "");
    setSchool(user.school || "");
  }, [user]);

  const handleSaveProfile = async () => {
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
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast.error("No email on your profile");
      return;
    }
    try {
      await api.auth.forgotPassword(email.trim());
      toast.success("Password reset link sent!", {
        description: "Check your email for the reset link.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send reset email");
    }
  };

  const handlePasswordChange = async () => {
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

  return (
    <AppShell role="admin" pageTitle="Settings">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            Profile Information
          </h2>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {initials(fullName || user?.name)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Your profile</h3>
              <p className="text-gray-600 text-sm">Update your name, email, and school below</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-gray-700 mb-2 block">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">School/Institution</Label>
              <Input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Security Section */}
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#10B981]" />
            Security
          </h2>

          <div className="space-y-4">
            <Button
              onClick={() => setShowPasswordModal(true)}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-xl"
            >
              Change Password
            </Button>

            <Button
              onClick={handlePasswordReset}
              variant="outline"
              className="w-full border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 py-3 rounded-xl"
            >
              <Mail className="w-4 h-4 mr-2" />
              Reset Password via Email
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 border-2 border-red-200">
          <h2 className="text-2xl font-semibold text-red-600 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Danger Zone
          </h2>

          <div className="space-y-4">
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="outline"
              className="w-full border-2 border-red-500 text-red-500 hover:bg-red-50 py-3 rounded-xl"
            >
              Delete Account
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-gray-700 mb-2 block">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-3"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-3"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-3"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl py-3"
              >
                Update Password
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Account</h3>
              <p className="text-gray-600">This action cannot be undone. All your data will be permanently deleted.</p>
            </div>
            
            <div className="mb-6">
              <Label className="text-gray-700 mb-2 block">Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="rounded-xl border-2 border-red-200 px-4 py-3 text-center font-mono"
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
                className="flex-1 border border-gray-200 rounded-xl py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3"
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
