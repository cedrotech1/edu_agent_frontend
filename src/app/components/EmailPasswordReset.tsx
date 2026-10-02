import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { PasswordField } from "./PasswordField";
import { api, ApiError } from "@/lib/api";
import { passwordError } from "@/lib/password";
import { toast } from "sonner";

export function EmailPasswordReset({
  email,
  open,
  onClose,
}: {
  email: string;
  open: boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const sendCode = async () => {
    if (!email.trim()) {
      toast.error("No email on your profile");
      return;
    }
    setSending(true);
    try {
      const res = await api.auth.forgotPassword(email.trim());
      setSent(true);
      if (res.resetCode) setCode(res.resetCode);
      toast.success(res.message || "Reset code sent");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send reset code");
    } finally {
      setSending(false);
    }
  };

  const save = async () => {
    const problem = passwordError(password);
    if (!code.trim()) {
      toast.error("Enter the reset code");
      return;
    }
    if (problem) {
      toast.error(problem);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSaving(true);
    try {
      const res = await api.auth.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: password,
      });
      toast.success(res.message || "Password updated");
      setCode("");
      setPassword("");
      setConfirm("");
      setSent(false);
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-[#0F0E47] mb-1">Reset password by email</h3>
        <p className="text-xs text-gray-500 mb-4">
          We send a 6-digit code to {email}. Enter it here with your new password.
        </p>
        <div className="space-y-4">
          <Button
            type="button"
            onClick={sendCode}
            disabled={sending}
            className="w-full bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10"
          >
            {sending ? "Sending…" : sent ? "Send a new code" : "Send reset code"}
          </Button>
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Reset code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-xl border border-gray-200 h-10"
              placeholder="6-digit code"
              inputMode="numeric"
            />
          </div>
          <PasswordField label="New password" value={password} onChange={setPassword} placeholder="Letter and number, 8+ characters" autoComplete="new-password" />
          <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-10">
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving} className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10">
              {saving ? "Updating…" : "Update password"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
