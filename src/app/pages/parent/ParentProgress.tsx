import { useState } from "react";
import { ChevronDown, AlertCircle, Lock } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CHILDREN = [
  { id: "1", name: "Emma Martinez",  initials: "EM" },
  { id: "2", name: "Lucas Martinez", initials: "LM" },
];

const TREND_DATA = [
  { date: "Jul 1",  Math: 72, Science: 65, English: 80 },
  { date: "Jul 8",  Math: 78, Science: 70, English: 85 },
  { date: "Jul 15", Math: 44, Science: 80, English: 91 },
  { date: "Jul 22", Math: 85, Science: 72, English: 88 },
  { date: "Jul 25", Math: 85, Science: 68, English: 91 },
];

const SUBJECTS = [
  { subject: "Mathematics", avg: 73, quizzes: 3, color: "#272757" },
  { subject: "Science",     avg: 71, quizzes: 2, color: "#505081" },
  { subject: "English",     avg: 87, quizzes: 3, color: "#10B981" },
  { subject: "History",     avg: 44, quizzes: 1, color: "#F59E0B" },
];

const ACHIEVEMENTS = [
  { label: "First Quiz",    emoji: "🎯", earned: true  },
  { label: "5-Day Streak",  emoji: "🔥", earned: true  },
  { label: "Perfect Score", emoji: "⭐", earned: false },
  { label: "10 Quizzes",    emoji: "🏆", earned: false },
];

export function ParentProgress() {
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <AppShell role="parent" pending={true} pageTitle="Progress">
      {/* Read-only notice */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl mb-5 text-sm text-[#92400E]">
        <AlertCircle className="w-4 h-4 shrink-0" />
        You are viewing your child's progress in read-only mode.
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

      {/* Score trend chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-sm">
        <h2 className="font-semibold text-[#0F0E47] text-sm mb-4">Score Trend Over Time</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={TREND_DATA}>
            <CartesianGrid key="pp-grid" strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis key="pp-x" dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis key="pp-y" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
            <Tooltip key="pp-tooltip" formatter={(v: number) => `${v}%`} />
            <Legend key="pp-legend" />
            <Line key="pp-math"    name="Mathematics" type="monotone" dataKey="Math"    stroke="#272757" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line key="pp-science" name="Science"     type="monotone" dataKey="Science" stroke="#505081" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line key="pp-english" name="English"     type="monotone" dataKey="English" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subject breakdown */}
      <h2 className="font-semibold text-[#0F0E47] text-sm mb-3">By Subject</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {SUBJECTS.map(s => (
          <div key={s.subject} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <span className="font-semibold text-[#0F0E47] text-sm">{s.subject}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: s.color }}>{s.avg}%</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${s.avg}%`, background: s.color }} />
            </div>
            <p className="text-xs text-[#8686AC] mt-1.5">{s.quizzes} quiz{s.quizzes !== 1 ? "zes" : ""} completed</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <h2 className="font-semibold text-[#0F0E47] text-sm mb-3">Achievements</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map(a => (
          <div key={a.label} className={`rounded-xl p-4 text-center border ${a.earned ? "bg-white border-[#272757]/20" : "bg-[#F8FAFC] border-[#E2E8F0] opacity-60"}`}>
            <div className={`text-3xl mb-2 ${a.earned ? "" : "grayscale opacity-40"}`}>{a.emoji}</div>
            <p className={`text-xs font-bold ${a.earned ? "text-[#0F0E47]" : "text-[#8686AC]"}`}>{a.label}</p>
            {!a.earned && <div className="flex items-center justify-center gap-1 mt-1 text-[#8686AC]"><Lock className="w-3 h-3" /><span className="text-[10px]">Locked</span></div>}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
