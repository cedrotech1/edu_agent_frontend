import { useNavigate } from "react-router";
import { CheckCircle2 } from "lucide-react";

export function PublicQuizThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#272757] rounded-xl flex items-center justify-center mb-3">
            <span className="text-white text-xl font-black">Q</span>
          </div>
          <span className="text-2xl font-bold text-[#0F0E47]">QuizMind <span className="text-[#272757]">AI</span></span>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#10B981]" style={{ strokeWidth: 2 }} />
          </div>
          <h1 className="text-xl font-bold text-[#0F0E47] mb-2">Quiz Submitted</h1>
          <p className="text-sm text-[#64748B] mb-4">Your answers have been reviewed.</p>
          <p className="text-sm text-[#64748B] mb-8">Sign up to track your progress and see your results.</p>
          <div className="space-y-3">
            <button onClick={() => navigate("/signup")} className="w-full h-11 bg-[#272757] text-white rounded-xl font-semibold text-sm hover:bg-[#1A1952] transition-colors">
              Sign Up Free
            </button>
            <button onClick={() => navigate("/")} className="w-full h-11 border border-[#E2E8F0] text-[#475569] rounded-xl font-semibold text-sm hover:bg-[#F8FAFC] transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
