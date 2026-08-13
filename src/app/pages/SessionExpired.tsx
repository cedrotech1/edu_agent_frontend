import { useNavigate } from "react-router";
import { Clock } from "lucide-react";

export function SessionExpired() {
  const navigate = useNavigate();
  return (
    <div className="public-page flex items-center justify-center px-6 py-10">
      <div className="text-center max-w-md">
        <div className="public-icon-well w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-9 h-9" style={{ strokeWidth: 1.5 }} />
        </div>
        <h1 className="text-2xl font-bold text-[#0F0E47] mb-3">Your session has expired</h1>
        <p className="text-[#8686AC] text-[0.95rem] mb-8 leading-relaxed">
          For your security, you have been logged out due to inactivity. Please log in again to continue.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="public-btn-primary inline-flex items-center gap-2 px-7 h-12 text-base"
        >
          Log In Again
        </button>
      </div>
    </div>
  );
}
