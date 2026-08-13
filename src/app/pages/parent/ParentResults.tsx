import { useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { AppShell } from "../../components/AppShell";

const CHILDREN = [
  { id: "1", name: "Emma Martinez",  initials: "EM" },
  { id: "2", name: "Lucas Martinez", initials: "LM" },
];

const RESULTS: Record<string, { quiz: string; class_: string; date: string; score: number; teacherFeedback: string; aiFeedback: string }[]> = {
  "1": [
    { quiz: "Algebra Chapter 3",       class_: "Math 5B",    date: "Jul 25", score: 85, teacherFeedback: "Great work on equations.", aiFeedback: "Strong algebraic reasoning shown." },
    { quiz: "Biology: Cell Structure", class_: "Biology 5B", date: "Jul 22", score: 72, teacherFeedback: "Review mitosis section.",    aiFeedback: "Good understanding of plant cells." },
    { quiz: "English Essay",           class_: "English 5B", date: "Jul 18", score: 91, teacherFeedback: "Excellent writing.",          aiFeedback: "Strong vocabulary and structure." },
    { quiz: "History: Rwanda 1994",    class_: "History 5B", date: "Jul 15", score: 44, teacherFeedback: "Please review Chapter 4.",    aiFeedback: "Key dates need revision." },
    { quiz: "Physics: Forces",         class_: "Physics 5B", date: "Jul 10", score: 68, teacherFeedback: "Good attempt.",               aiFeedback: "Newton's 3rd law needs work." },
    { quiz: "Math: Geometry",          class_: "Math 5B",    date: "Jul 5",  score: 79, teacherFeedback: "Nice improvement.",           aiFeedback: "Angle calculations mostly correct." },
  ],
  "2": [
    { quiz: "Numbers: Addition",   class_: "Math 3A",    date: "Jul 24", score: 90, teacherFeedback: "Well done!",            aiFeedback: "Excellent mental arithmetic." },
    { quiz: "Science: Plants",     class_: "Science 3A", date: "Jul 20", score: 78, teacherFeedback: "Good effort.",          aiFeedback: "Photosynthesis well understood." },
    { quiz: "English: Reading",    class_: "English 3A", date: "Jul 16", score: 65, teacherFeedback: "Work on comprehension.", aiFeedback: "Inference skills need practice." },
    { quiz: "Math: Fractions",     class_: "Math 3A",    date: "Jul 12", score: 55, teacherFeedback: "Review fractions.",      aiFeedback: "Denominator operations need work." },
    { quiz: "Science: Animals",    class_: "Science 3A", date: "Jul 8",  score: 82, teacherFeedback: "Very good!",             aiFeedback: "Animal classification excellent." },
    { quiz: "English: Spelling",   class_: "English 3A", date: "Jul 4",  score: 71, teacherFeedback: "Nice progress.",         aiFeedback: "Common word patterns improving." },
  ],
};

function scoreBadge(score: number) {
  if (score >= 70) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46]">{score}%</span>;
  if (score >= 50) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">{score}%</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B]">{score}%</span>;
}

export function ParentResults() {
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const results = RESULTS[selectedChild.id];

  return (
    <AppShell role="parent" pending={true} pageTitle="My Child's Results">
      {/* Read-only notice */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl mb-5 text-sm text-[#92400E]">
        <AlertCircle className="w-4 h-4 shrink-0" />
        You are viewing your child's results in read-only mode.
      </div>

      {/* Child selector */}
      <div className="relative inline-block mb-6">
        <button onClick={() => setSelectorOpen(o => !o)} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F0E47] hover:bg-[#EDE9FE] transition-colors shadow-sm">
          <div className="w-6 h-6 bg-[#272757] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{selectedChild.initials}</div>
          {selectedChild.name}
          <ChevronDown className={`w-4 h-4 text-[#8686AC] transition-transform ${selectorOpen ? "rotate-180" : ""}`} />
        </button>
        {selectorOpen && (
          <div className="absolute left-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-20 min-w-[200px] py-1">
            {CHILDREN.map(c => (
              <button key={c.id} onClick={() => { setSelectedChild(c); setSelectorOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-[#EDE9FE] transition-colors ${c.id === selectedChild.id ? "text-[#272757] font-semibold" : "text-[#0F0E47]"}`}>
                <div className="w-6 h-6 bg-[#272757] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{c.initials}</div>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {["Quiz", "Class", "Date", "Score", "Teacher Feedback", "AI Feedback"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.quiz} className={`border-b border-[#E2E8F0] hover:bg-[#EDE9FE] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`} style={{ minHeight: 56 }}>
                  <td className="px-5 py-3.5 font-medium text-[#0F0E47]">{r.quiz}</td>
                  <td className="px-5 py-3.5 text-[#64748B] text-xs">{r.class_}</td>
                  <td className="px-5 py-3.5 text-[#64748B] text-xs">{r.date}</td>
                  <td className="px-5 py-3.5">{scoreBadge(r.score)}</td>
                  <td className="px-5 py-3.5 text-[#64748B] text-xs max-w-[160px]">{r.teacherFeedback}</td>
                  <td className="px-5 py-3.5 text-[#8686AC] text-xs max-w-[160px]">{r.aiFeedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
