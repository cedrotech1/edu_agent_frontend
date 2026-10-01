import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Logo } from "./Logo";

export function PublicNav() {
  const navigate = useNavigate();

  return (
    <nav className="public-nav">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl focus:outline-none shrink-0"
            aria-label="QuizMind AI home"
          >
            <Logo variant="horizontal" size="md" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-[#505081] hover:text-[#272757] hover:bg-[#272757]/6 rounded-xl px-3 sm:px-4 h-11"
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/how-it-works")}
              className="text-[#505081] hover:text-[#272757] hover:bg-[#272757]/6 rounded-xl px-3 sm:px-4 h-11"
            >
              How it works
            </Button>
            <Button onClick={() => navigate("/signup")} className="public-btn-ghost h-11 px-3 sm:px-5">
              Sign Up
            </Button>
            <Button onClick={() => navigate("/login")} className="public-btn-primary h-11 px-3 sm:px-5">
              Log In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
