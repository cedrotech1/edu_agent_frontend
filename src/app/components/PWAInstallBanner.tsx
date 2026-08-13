import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("qm-visit-count") || "0") + 1;
    localStorage.setItem("qm-visit-count", String(count));
    const dismissed = localStorage.getItem("qm-pwa-dismissed") === "true";
    if (count >= 2 && !dismissed && window.innerWidth < 768) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("qm-pwa-dismissed", "true");
    setShow(false);
  };

  const install = () => {
    localStorage.setItem("qm-pwa-dismissed", "true");
    setShow(false);
    // Trigger browser install prompt if available
    const event = (window as any).__pwaPrompt;
    if (event) { event.prompt(); } else { alert("To install: tap the browser menu and select 'Add to Home Screen'"); }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 bg-[#272757] rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-white text-base font-black">Q</span>
      </div>
      <p className="flex-1 text-sm text-[#0F0E47] leading-snug">Add QuizMind AI to your home screen for quick access</p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={dismiss} className="text-xs text-[#8686AC] hover:text-[#64748B] transition-colors px-2 py-1">Not Now</button>
        <button onClick={install} className="px-3 py-1.5 bg-[#272757] text-white text-xs font-semibold rounded-lg hover:bg-[#1A1952] transition-colors">
          Add to Home Screen
        </button>
      </div>
      <button onClick={dismiss} className="p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5 text-[#8686AC]" />
      </button>
    </div>
  );
}
