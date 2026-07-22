import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { api } from "@/lib/api";
import { roleHome } from "@/lib/auth";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setStatus("resend");
      setMessage("No verification token provided. Please enter your email to receive a new verification link.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await api.auth.verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
        
        if (res.token && res.user) {
          // Auto-login after verification
          localStorage.setItem("quizmind_token", res.token);
          localStorage.setItem("quizmind_user", JSON.stringify(res.user));
          setUser(res.user);
          toast.success("Account verified successfully!");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed. The link may be expired or invalid.");
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    setResending(true);
    try {
      const res = await api.auth.resendVerification(email.trim());
      toast.success(res.message || "Verification email sent successfully!");
      setMessage("Please check your inbox for the new verification link.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9FF] via-[#E8E7FF] to-[#D9F5FF] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="horizontal" size="md" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verification</h1>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-[#6C63FF] animate-spin mb-4" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-gray-800 font-semibold text-lg mb-2">Success!</p>
            <p className="text-gray-600 text-center mb-6">{message}</p>
            
            <div className="w-full space-y-3">
              <Button
                onClick={() => {
                  if (user?.role === "teacher") navigate("/onboarding/teacher");
                  else if (user?.role === "student") navigate("/onboarding/student");
                  else navigate(roleHome(user?.role));
                }}
                className="w-full bg-[#6C63FF] hover:bg-[#5851E6] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                Start Onboarding
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => navigate(roleHome(user?.role))}
                variant="outline"
                className="w-full border-2 border-gray-200 hover:border-[#6C63FF] text-gray-700 hover:text-[#6C63FF] py-4 rounded-xl font-semibold"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-gray-800 font-semibold text-lg mb-2">Verification Failed</p>
            <p className="text-gray-600 text-center mb-6">{message}</p>
            
            <div className="w-full border-t pt-6">
              <p className="text-sm text-gray-500 mb-4 text-center">Request a new verification link</p>
              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6C63FF] px-4 py-3"
                    placeholder="you@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={resending}
                  className="w-full bg-[#6C63FF] hover:bg-[#5851E6] text-white py-3 rounded-xl font-semibold"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {status === "resend" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Mail className="w-16 h-16 text-[#6C63FF] mb-4" />
            <p className="text-gray-800 font-semibold text-lg mb-2">Verify Your Email</p>
            <p className="text-gray-600 text-center mb-6">{message}</p>
            
            <form onSubmit={handleResend} className="w-full space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6C63FF] px-4 py-3"
                  placeholder="you@example.com"
                />
              </div>
              <Button
                type="submit"
                disabled={resending}
                className="w-full bg-[#6C63FF] hover:bg-[#5851E6] text-white py-3 rounded-xl font-semibold"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Verification Email
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-600 hover:text-[#6C63FF] font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </Card>
    </div>
  );
}
