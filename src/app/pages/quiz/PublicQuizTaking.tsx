import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

const QUESTIONS = [
  { q: "What is 2 + 2?",             options: ["3", "4", "5", "6"],     answer: 1 },
  { q: "Solve for x: 2x = 8",        options: ["x=2", "x=4", "x=6", "x=8"], answer: 1 },
  { q: "What is 15% of 200?",        options: ["15", "30", "25", "20"], answer: 1 },
];

export function PublicQuizTaking() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});

  if (!started) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Top bar */}
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#272757] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">Q</span>
            </div>
            <span className="font-bold text-[#0F0E47]">QuizMind AI</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-[#0F0E47] mb-2">Algebra Chapter 3 — End of Term</h1>
            <p className="text-sm text-[#8686AC] mb-5">By Ms. Johnson</p>
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl mb-6 text-sm text-[#92400E] text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              You are taking this quiz as a guest. Your results will not be saved.
            </div>
            <p className="text-sm text-[#64748B] mb-8">3 questions · 30 minutes</p>
            <button onClick={() => setStarted(true)} className="px-8 py-3 bg-[#272757] text-white rounded-xl font-semibold hover:bg-[#1A1952] transition-colors">
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#272757] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-black">Q</span>
          </div>
          <span className="font-bold text-[#0F0E47]">QuizMind AI</span>
        </div>
        <span className="text-sm text-[#64748B]">Question {current + 1} of {QUESTIONS.length}</span>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="w-full h-2 bg-[#E2E8F0] rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-[#272757] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <p className="font-semibold text-[#0F0E47] mb-5">{q.q}</p>
          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => setSelected(s => ({ ...s, [current]: i }))}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${selected[current] === i ? "border-[#272757] bg-[#EDE9FE]" : "border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected[current] === i ? "border-[#272757]" : "border-[#CBD5E1]"}`}>
                  {selected[current] === i && <div className="w-2.5 h-2.5 rounded-full bg-[#272757]" />}
                </div>
                <span className={`text-sm ${selected[current] === i ? "text-[#272757] font-medium" : "text-[#475569]"}`}>{opt}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            {current > 0 && (
              <button onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-1.5 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            )}
            {current < QUESTIONS.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="ml-auto flex items-center gap-1.5 px-5 py-2.5 bg-[#272757] text-white rounded-xl text-sm font-semibold hover:bg-[#1A1952] transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => navigate("/quiz/public-thank-you")} className="ml-auto px-5 py-2.5 bg-[#272757] text-white rounded-xl text-sm font-semibold hover:bg-[#1A1952] transition-colors">
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
