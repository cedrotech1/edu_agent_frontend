import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function TwoFactorLogin() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigitChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleVerify = () => {
    const code = digits.join("");
    if (code.length < 6) { toast.error("Please enter the full 6-digit code"); return; }
    toast.success("Verified! Logging you in…");
    navigate("/student");
  };

  const handleResend = () => {
    if (countdown > 0) return;
    toast.success("New code sent to your email");
    setCountdown(60);
    setDigits(["", "", "", "", "", ""]);
  };

  return (
    <div className="public-page flex items-center justify-center p-5 sm:p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-9">
          <div className="public-icon-well w-14 h-14 flex items-center justify-center mb-4">
            <span className="text-[#272757] text-xl font-black">Q</span>
          </div>
          <span className="text-2xl font-bold text-[#0F0E47]">
            QuizMind <span className="text-[#505081]">AI</span>
          </span>
        </div>

        <div className="public-surface p-8 sm:p-10">
          <h1 className="text-xl font-bold text-[#0F0E47] mb-2 text-center">Enter your verification code</h1>
          <p className="text-[0.95rem] text-[#8686AC] text-center mb-8 leading-relaxed">
            A 6-digit code has been sent to your email address.
          </p>

          <div className="flex gap-2.5 justify-center mb-8">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl focus:outline-none text-[#0F0E47] transition-all bg-[#F4F5F9]"
                style={{
                  boxShadow: d
                    ? "inset 0 0 0 1.5px rgba(39,39,87,0.35), 0 0 0 4px rgba(39,39,87,0.08)"
                    : "inset 0 0 0 1px transparent",
                }}
              />
            ))}
          </div>

          <button onClick={handleVerify} className="public-btn-primary w-full h-12 text-base mb-4">
            Verify
          </button>

          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className={`w-full text-sm text-center transition-colors ${
              countdown > 0 ? "text-[#8686AC] cursor-not-allowed" : "text-[#272757] font-semibold hover:text-[#505081] cursor-pointer"
            }`}
          >
            {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
          </button>

          <div className="mt-6 pt-6 text-center">
            <div className="h-px bg-[#EEF0F6] mb-6" />
            <button onClick={() => navigate("/login")} className="text-sm text-[#8686AC] hover:text-[#272757] transition-colors">
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
