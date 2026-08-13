import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, ChevronDown } from "lucide-react";
import { AppShell } from "../../components/AppShell";

const CHILDREN = [
  { id: "1", name: "Emma Martinez",  initials: "EM", grade: "Grade 5", class: "5B - Mathematics", school: "Kigali Primary School" },
  { id: "2", name: "Lucas Martinez", initials: "LM", grade: "Grade 3", class: "3A - Science",     school: "Kigali Primary School" },
];

const QUIZ_DATA: Record<string, { quiz: string; date: string; score: number }[]> = {
  "1": [
    { quiz: "Algebra Chapter 3",       date: "Jul 25, 2026", score: 85 },
    { quiz: "Biology: Cell Structure", date: "Jul 22, 2026", score: 72 },
    { quiz: "English Essay",           date: "Jul 18, 2026", score: 91 },
    { quiz: "History: Rwanda 1994",    date: "Jul 15, 2026", score: 44 },
    { quiz: "Physics: Forces",         date: "Jul 10, 2026", score: 68 },
  ],
  "2": [
    { quiz: "Numbers: Addition",       date: "Jul 24, 2026", score: 90 },
    { quiz: "Science: Plants",         date: "Jul 20, 2026", score: 78 },
    { quiz: "English: Reading",        date: "Jul 16, 2026", score: 65 },
    { quiz: "Math: Fractions",         date: "Jul 12, 2026", score: 55 },
    { quiz: "Science: Animals",        date: "Jul 8,  2026", score: 82 },
  ],
};

const STATS: Record<string, { avg: string; quizzes: number; streak: string; rank: string }> = {
  "1": { avg: "72%", quizzes: 12, streak: "5 days", rank: "#4 of 28" },
  "2": { avg: "74%", quizzes: 8,  streak: "3 days", rank: "#7 of 22" },
};

function scoreBadge(score: number) {
  if (score >= 70) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46]">{score}%</span>;
  if (score >= 50) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">{score}%</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B]">{score}%</span>;
}

export function ParentDashboard() {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const stats = STATS[selectedChild.id];
  const quizzes = QUIZ_DATA[selectedChild.id];

  return (
    <AppShell role="parent" pending={true} pageTitle="Parent Overview">
      {/* Child selector */}
      <div className="relative inline-block mb-6">
        <button onClick={() => setSelectorOpen(o => !o)} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F0E47] hover:bg-[#EDE9FE] transition-colors shadow-sm">
          <div className="w-6 h-6 bg-[#272757] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{selectedChild.initials}</div>
          {selectedChild.name}
          <ChevronDown className={`w-4 h-4 text-[#8686AC] transition-transform ${selectorOpen ? "rotate-180" : ""}`} />
        </button>
        {selectorOpen && (
          <div className="absolute left-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-20 min-w-[220px] py-1">
            {CHILDREN.map(c => (
              <button key={c.id} onClick={() => { setSelectedChild(c); setSelectorOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-[#EDE9FE] transition-colors ${c.id === selectedChild.id ? "text-[#272757] font-semibold" : "text-[#0F0E47]"}`}>
                <div className="w-7 h-7 bg-[#272757] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{c.initials}</div>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[11px] text-[#8686AC]">{c.grade}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 mb-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 bg-gradient-to-br from-[#272757] to-[#505081] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">{selectedChild.initials}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-[#0F0E47] text-lg">{selectedChild.name}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" /> Active
            </span>
          </div>
          <p className="text-sm text-[#64748B]">{selectedChild.class}</p>
          <p className="text-xs text-[#8686AC]">{selectedChild.school}</p>
        </div>
        <GraduationCap className="w-8 h-8 text-[#8686AC]" style={{ strokeWidth: 1.5 }} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Average Score",       value: stats.avg,     color: "#272757"  },
          { label: "Quizzes Completed",   value: stats.quizzes, color: "#272757"  },
          { label: "Current Streak",      value: stats.streak,  color: "#F59E0B"  },
          { label: "Class Rank",          value: stats.rank,    color: "#10B981"  },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#8686AC] mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-semibold text-[#0F0E47]">Recent Activity</h2>
          <p className="text-xs text-[#8686AC]">Last 5 quiz attempts</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B]">Quiz</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] hidden sm:table-cell">Date</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-[#64748B]">Score</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B]">Details</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q, i) => (
              <tr key={q.quiz} className={`border-b border-[#E2E8F0] hover:bg-[#EDE9FE] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`} style={{ minHeight: 56 }}>
                <td className="px-5 py-3.5 font-medium text-[#0F0E47]">{q.quiz}</td>
                <td className="px-5 py-3.5 text-[#64748B] text-xs hidden sm:table-cell">{q.date}</td>
                <td className="px-5 py-3.5 text-center">{scoreBadge(q.score)}</td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => navigate("/parent/results")} className="text-xs text-[#272757] font-semibold hover:underline">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
