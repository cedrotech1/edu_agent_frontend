import { useNavigate } from "react-router";
import { LayoutDashboard } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="public-page flex items-center justify-center px-6 py-10">
      <div className="text-center max-w-md">
        <p className="text-[120px] font-black text-[#272757]/15 leading-none mb-2 select-none">404</p>
        <h1 className="text-2xl font-bold text-[#0F0E47] mb-3">Page not found</h1>
        <p className="text-[#8686AC] text-[0.95rem] mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved. Check the URL or head back home.
        </p>
        <button
          onClick={() => navigate("/")}
          className="public-btn-primary inline-flex items-center gap-2 px-7 h-12 text-base"
        >
          <LayoutDashboard className="w-4 h-4" style={{ strokeWidth: 1.75 }} />
          Go Home
        </button>
      </div>
    </div>
  );
}
