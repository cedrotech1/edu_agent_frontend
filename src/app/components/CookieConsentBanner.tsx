import { useState, useEffect } from "react";
import { X } from "lucide-react";
const STORAGE_KEY = "qm-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: true, marketing: true }));
    setVisible(false);
    setPrefsOpen(false);
  };

  const savePrefs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics, marketing }));
    setVisible(false);
    setPrefsOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[150] bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-8 py-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[#475569] flex-1 text-center sm:text-left">
          We use cookies to improve your experience. By continuing you agree to our{" "}
          <a href="/privacy" className="text-[#272757] font-semibold hover:underline">Privacy Policy</a>.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setPrefsOpen(true)} className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-xl text-sm font-semibold hover:bg-[#F8FAFC] transition-colors">
            Manage Preferences
          </button>
          <button onClick={acceptAll} className="px-4 py-2 bg-[#272757] text-white rounded-xl text-sm font-semibold hover:bg-[#1A1952] transition-colors">
            Accept All
          </button>
        </div>
      </div>

      {prefsOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="bg-white rounded-[12px] w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-[18px] font-bold text-[#0F0E47]">Cookie Preferences</h3>
              <button onClick={() => setPrefsOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8686AC] hover:bg-[#F1F5F9]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 space-y-5">
              {[
                { label: "Essential Cookies", desc: "Required for the platform to function", val: true, disabled: true, set: null },
                { label: "Analytics Cookies", desc: "Help us understand how users use the platform", val: analytics, disabled: false, set: setAnalytics },
                { label: "Marketing Cookies", desc: "Used to show relevant content", val: marketing, disabled: false, set: setMarketing },
              ].map(({ label, desc, val, disabled, set }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0F0E47] text-sm">{label}</p>
                    <p className="text-xs text-[#8686AC] mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => set && set((v: boolean) => !v)}
                    disabled={disabled}
                    className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${val ? "bg-[#272757]" : "bg-gray-200"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? "right-1" : "left-1"}`} />
                  </button>
                </div>
              ))}
              <div className="border-t border-[#E2E8F0] pt-4 flex justify-end gap-3">
                <button onClick={() => setPrefsOpen(false)} className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={savePrefs} className="px-5 py-2 bg-[#272757] text-white rounded-xl text-sm font-semibold hover:bg-[#1A1952] transition-colors">Confirm Preferences</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
