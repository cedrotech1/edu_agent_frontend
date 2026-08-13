import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/button";
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
    <div className="public-page flex items-center justify-center p-5 sm:p-8">
      <div className="public-surface w-full max-w-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Logo variant="horizontal" size="md" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F0E47] mb-1">Email Verification</h1>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-14 h-14 text-[#272757] animate-spin mb-4" />
            <p className="text-[#8686AC]">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/12 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
            </div>
            <p className="text-[#0F0E47] font-semibold text-lg mb-2">Success!</p>
            <p className="text-[#8686AC] text-center mb-8 leading-relaxed">{message}</p>
            
            <div className="w-full space-y-3">
              <Button
                onClick={() => {
                  if (user?.role === "teacher") navigate("/onboarding/teacher");
                  else if (user?.role === "student") navigate("/onboarding/student");
                  else navigate(roleHome(user?.role));
                }}
                className="public-btn-primary w-full py-6 text-base flex items-center justify-center gap-2"
              >
                Start Onboarding
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => navigate(roleHome(user?.role))}
                className="public-btn-ghost w-full py-6 text-base"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[#0F0E47] font-semibold text-lg mb-2">Verification Failed</p>
            <p className="text-[#8686AC] text-center mb-8 leading-relaxed">{message}</p>
            
            <div className="w-full pt-2">
              <p className="text-sm text-[#8686AC] mb-4 text-center">Request a new verification link</p>
              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="public-input"
                    placeholder="you@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={resending}
                  className="public-btn-primary w-full py-5 text-base"
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
          <div className="flex flex-col items-center justify-center py-6">
            <div className="public-icon-well w-16 h-16 flex items-center justify-center mb-5">
              <Mail className="w-7 h-7" />
            </div>
            <p className="text-[#0F0E47] font-semibold text-lg mb-2">Verify Your Email</p>
            <p className="text-[#8686AC] text-center mb-8 leading-relaxed">{message}</p>
            
            <form onSubmit={handleResend} className="w-full space-y-4">
              <div>
                <Label htmlFor="email" className="text-[#0F0E47] mb-2.5 block text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="public-input"
                  placeholder="you@example.com"
                />
              </div>
              <Button
                type="submit"
                disabled={resending}
                className="public-btn-primary w-full py-5 text-base"
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

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-[#8686AC] hover:text-[#272757] font-medium transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
