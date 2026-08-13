import { useNavigate } from "react-router";
import { Clock, ShieldCheck } from "lucide-react";

export function PendingVerification() {
  const navigate = useNavigate();

  return (
    <div className="public-page flex items-center justify-center p-5 sm:p-8">
      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-9">
          <div className="public-icon-well w-14 h-14 flex items-center justify-center mb-4">
            <span className="text-[#272757] text-xl font-black">Q</span>
          </div>
          <span className="text-2xl font-bold text-[#0F0E47]">
            QuizMind <span className="text-[#505081]">AI</span>
          </span>
        </div>

        <div className="public-surface p-8 sm:p-10">
          <div className="public-icon-well w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-7 h-7" style={{ strokeWidth: 1.75 }} />
          </div>

          <h1 className="text-xl font-bold text-[#0F0E47] mb-3">Account Awaiting Approval</h1>

          <p className="text-[0.95rem] text-[#8686AC] mb-5 leading-relaxed">
            Your account is awaiting approval. The school admin must link your account to your child before you can log in.
          </p>

          <div className="flex items-start gap-3 p-4 bg-[#272757]/6 rounded-xl mb-7 text-left">
            <ShieldCheck className="w-5 h-5 text-[#272757] flex-shrink-0 mt-0.5" style={{ strokeWidth: 1.75 }} />
            <p className="text-sm text-[#272757] leading-relaxed">
              This prevents any random person from viewing a student's data. You will receive an email notification once your account is approved.
            </p>
          </div>

          <button onClick={() => navigate("/login")} className="public-btn-ghost w-full h-12 text-base">
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
