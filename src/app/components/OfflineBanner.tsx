import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justRestored, setJustRestored] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);
  const isQuizPage = pathname.includes("/quiz-taking") || pathname.includes("/quiz/public");

  useEffect(() => {
    const onNav = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onNav);
    return () => window.removeEventListener("popstate", onNav);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustRestored(true);
      setTimeout(() => setJustRestored(false), 3000);
    };
    const handleOffline = () => { setIsOnline(false); setJustRestored(false); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isQuizPage) {
    if (justRestored) return (
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center gap-3 px-6 py-3 bg-[#D1FAE5] border-b border-[#6EE7B7] text-[#065F46] text-sm font-medium">
        <Wifi className="w-4 h-4" /> Connection restored. Answers synced.
      </div>
    );
    if (!isOnline) return (
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center gap-3 px-6 py-3 bg-[#FEF3C7] border-b border-[#FDE68A] text-[#92400E] text-sm font-medium">
        <WifiOff className="w-4 h-4" /> No internet connection. Your answers are being saved locally.
      </div>
    );
    return null;
  }

  if (!isOnline) return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 bg-[#272757] rounded-xl flex items-center justify-center">
          <span className="text-white text-lg font-black">Q</span>
        </div>
        <span className="text-xl font-bold text-[#0F0E47]">QuizMind AI</span>
      </div>
      <div className="w-24 h-24 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-6">
        <WifiOff className="w-16 h-16 text-[#8686AC]" style={{ strokeWidth: 1.25 }} />
      </div>
      <h1 className="text-2xl font-bold text-[#0F0E47] mb-3">You are offline</h1>
      <p className="text-[#64748B] text-base max-w-sm leading-relaxed mb-8">
        Your answers and recent activity are saved and will sync automatically when your connection returns.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-6 py-3 bg-[#272757] text-white rounded-xl font-semibold text-sm hover:bg-[#1A1952] transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Retry Connection
      </button>
    </div>
  );

  if (justRestored) return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 px-6 py-3 bg-[#D1FAE5] border-b border-[#6EE7B7] text-[#065F46] text-sm font-medium">
      <Wifi className="w-4 h-4" /> Connection restored. All data synced.
    </div>
  );

  return null;
}
