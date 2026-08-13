import { useNavigate } from "react-router";
import { CheckCircle } from "lucide-react";

export function PasswordResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="public-page flex items-center justify-center px-6 py-10">
      <div className="public-surface p-10 text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-[#10B981]/12 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#10B981]" style={{ strokeWidth: 1.75 }} />
        </div>
        <h1 className="text-2xl font-bold text-[#0F0E47] mb-3">Password updated successfully</h1>
        <p className="text-[0.95rem] text-[#8686AC] mb-8 leading-relaxed">You can now log in with your new password.</p>
        <button
          onClick={() => navigate("/login")}
          className="public-btn-primary w-full h-12 text-base"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
