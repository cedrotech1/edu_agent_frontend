import { useState, useEffect } from "react";
import { X } from "lucide-react";

const TOUR_KEY = "qm_student_tour_done";

const steps = [
  {
    title: "Join your first class",
    body: "Enter the class code your teacher gave you.",
    position: { top: "140px", left: "240px" },
  },
  {
    title: "Take your first quiz",
    body: "Your assigned quizzes appear here. Click Start Quiz when you are ready.",
    position: { top: "190px", left: "240px" },
  },
];

export function StudentOnboardingTour({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      setActive(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, "1");
    setActive(false);
  };

  const next = () => {
    if (step < 1) setStep(1);
    else dismiss();
  };

  const current = steps[step];

  return (
    <>
      {children}
      {active && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-[#0F0E47]/40 z-[100] pointer-events-none" />

          {/* Tooltip */}
          <div
            className="fixed z-[101] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-5 w-72"
            style={{ top: current.position.top, left: current.position.left }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0F0E47]">{current.title}</h3>
              <button onClick={dismiss} className="p-0.5 text-[#8686AC] hover:text-[#0F0E47]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#64748B] mb-4 leading-relaxed">{current.body}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8686AC]">Step {step + 1} of 2</span>
              <div className="flex items-center gap-3">
                <button onClick={dismiss} className="text-xs text-[#8686AC] hover:text-[#0F0E47]">
                  Skip tour
                </button>
                <button
                  onClick={next}
                  className="bg-[#272757] hover:bg-[#505081] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  {step === 1 ? "Done" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
