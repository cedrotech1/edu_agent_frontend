import { useNavigate } from "react-router";

export function AuthFooter() {
  const navigate = useNavigate();

  return (
    <footer className="px-6 sm:px-10 py-6 bg-transparent">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#272757]/10 rounded-lg flex items-center justify-center">
            <span className="text-[#272757] text-[11px] font-black">Q</span>
          </div>
          <span className="text-sm font-semibold text-[#0F0E47]">QuizMind AI</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-[#8686AC]">
          <button onClick={() => navigate("/terms")} className="hover:text-[#272757] transition-colors px-1">
            Terms of Service
          </button>
          <span className="mx-1 text-[#C4C4D8]">·</span>
          <button onClick={() => navigate("/privacy")} className="hover:text-[#272757] transition-colors px-1">
            Privacy Policy
          </button>
          <span className="mx-1 text-[#C4C4D8]">·</span>
          <button onClick={() => navigate("/admin/help")} className="hover:text-[#272757] transition-colors px-1">
            Help
          </button>
        </div>

        <p className="text-sm text-[#8686AC]">© 2026 QuizMind AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
