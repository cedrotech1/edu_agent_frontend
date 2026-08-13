import { useState } from "react";
import {
  ChevronDown,
  Mail,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

const faqs = [
  {
    q: "How do I join a class?",
    a: "Go to My Classes in the sidebar and click 'Join Class'. Enter the class code provided by your teacher. Once joined, you will immediately see all quizzes and materials assigned to that class.",
  },
  {
    q: "What happens if I miss the deadline?",
    a: "After a quiz deadline passes, it shows as Closed and you can no longer start or submit it. If you missed it due to an emergency, contact your teacher directly — they can reopen the quiz for you if needed.",
  },
  {
    q: "Can I retake a quiz?",
    a: "Only if your teacher has enabled retakes for that quiz. If allowed, you will see a 'Retake Quiz' button on your results page. The number of attempts allowed is set by your teacher, typically between 1 and 5 tries.",
  },
  {
    q: "How does AI grade short answers?",
    a: "The AI reads your answer and evaluates it based on meaning and correctness, not just exact wording. It checks whether you understood the key concepts. You can see detailed AI feedback for every question on your results page after submission.",
  },
  {
    q: "Where do I see my past results?",
    a: "Navigate to My Results in the sidebar. All your completed quizzes are listed there with scores and dates. Click 'View' on any quiz to open the full results page with AI feedback and correct answers for each question.",
  },
];

export function StudentHelp() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter((f) =>
    f.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="student" pageTitle="Help & Support">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search help topics…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F0E47] placeholder-[#8686AC] focus:outline-none focus:border-[#272757] bg-white shadow-sm"
          />
        </div>

        {/* FAQ list */}
        {filtered.length === 0 && search !== "" ? (
          <p className="text-center text-[#64748B] text-sm py-10">
            No results for &quot;{search}&quot;
          </p>
        ) : (
          filtered.map((item, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl mb-3 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F8FAFC] transition-colors"
              >
                <span className="font-medium text-[#0F0E47] text-sm">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#8686AC] shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9]">
                  {item.a}
                </div>
              )}
            </div>
          ))
        )}

        {/* Contact card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mt-6 text-center">
          <Mail className="w-10 h-10 text-[#272757] mx-auto mb-3" style={{ strokeWidth: 1.75 }} />
          <p className="font-semibold text-[#0F0E47] mb-1">Still need help?</p>
          <p className="text-sm text-[#64748B] mb-3">Our support team is here for you.</p>
          <a
            href="mailto:support@quizmind.ai"
            className="text-[#272757] font-semibold hover:text-[#505081] underline text-sm"
          >
            support@quizmind.ai
          </a>
        </div>
      </div>
    </AppShell>
  );
}
