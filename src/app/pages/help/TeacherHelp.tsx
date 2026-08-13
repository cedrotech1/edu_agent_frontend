import { useState } from "react";
import {
  ChevronDown,
  Mail,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

const faqs = [
  {
    q: "How do I create a quiz using AI?",
    a: "Navigate to My Quizzes and click 'Generate Quiz'. Enter your topic, subject, and number of questions, then click Generate. The AI will create a complete quiz in seconds. You can then review and edit each question before publishing it to your class.",
  },
  {
    q: "How do I share a quiz?",
    a: "Open any quiz from My Quizzes and click the Share button beside Edit. A side panel will open with three sharing options: copy a direct link, share the quiz code for students to enter manually, or send email invitations directly from the panel.",
  },
  {
    q: "How does AI grading work?",
    a: "After students submit, our AI evaluates short-answer and essay questions based on semantic meaning rather than exact keyword matching. It considers correct concepts, relevance, and accuracy. You can review AI feedback and override any grade from the Quiz Results page.",
  },
  {
    q: "How do I review flagged answers?",
    a: "Go to Quiz Results for any quiz and look for the Flagged tab. Flagged answers are ones where the AI had low confidence. You can also view all flagged content across all quizzes from the AI Grading Logs section in the admin panel.",
  },
  {
    q: "Can I edit a quiz after publishing?",
    a: "You can edit quiz settings like the deadline, retakes, and visibility at any time after publishing. To edit the actual questions, you must first unpublish the quiz. Students who have already started will receive a notification about any changes.",
  },
  {
    q: "How do I allow retakes?",
    a: "In the Quiz Settings panel for any quiz, toggle 'Allow Retakes' to on after the deadline field. You can then set the maximum number of retake attempts from 1 to 5. Students will see a 'Retake Quiz' button on their results page once retakes are enabled.",
  },
];

export function TeacherHelp() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter((f) =>
    f.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="teacher" pageTitle="Help & Support">
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
