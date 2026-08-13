import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Download, Eye, ClipboardList } from "lucide-react";
import { AppShell } from "../../components/AppShell";

type FilterTab = "all" | "flagged" | "passed" | "failed";

const submissions = [
  { name: "Alex Martinez",  init: "AM", class: "S3 Biology",    score: 92, time: "24 min", aiGrade: 90, flagged: false, submitted: "Jul 25 14:32" },
  { name: "Amina Uwase",    init: "AU", class: "S3 Biology",    score: 78, time: "31 min", aiGrade: 76, flagged: false, submitted: "Jul 25 15:10" },
  { name: "John Nkusi",     init: "JN", class: "S3 Biology",    score: 45, time: "28 min", aiGrade: 43, flagged: true,  submitted: "Jul 25 16:02" },
  { name: "Grace Mukamana", init: "GM", class: "S5 Chemistry",  score: 85, time: "19 min", aiGrade: 83, flagged: false, submitted: "Jul 25 16:45" },
  { name: "Peter Habimana", init: "PH", class: "S3 Biology",    score: 62, time: "35 min", aiGrade: 60, flagged: false, submitted: "Jul 25 17:20" },
  { name: "Alice Kagabo",   init: "AK", class: "S5 Chemistry",  score: 91, time: "22 min", aiGrade: 89, flagged: false, submitted: "Jul 25 18:05" },
  { name: "Samuel Ntare",   init: "SN", class: "S3 Biology",    score: 38, time: "40 min", aiGrade: 35, flagged: true,  submitted: "Jul 25 18:50" },
  { name: "Diane Ingabire", init: "DI", class: "S4 History",    score: 74, time: "27 min", aiGrade: 72, flagged: false, submitted: "Jul 26 08:15" },
  { name: "Eric Mugisha",   init: "EM", class: "S4 History",    score: 55, time: "33 min", aiGrade: 53, flagged: false, submitted: "Jul 26 09:00" },
  { name: "Solange Irad.",  init: "SI", class: "S3 Biology",    score: 88, time: "21 min", aiGrade: 86, flagged: false, submitted: "Jul 26 09:45" },
  { name: "Frank Uwimana",  init: "FU", class: "S5 Chemistry",  score: 29, time: "45 min", aiGrade: 27, flagged: true,  submitted: "Jul 26 10:30" },
  { name: "Marie Ingabire", init: "MI", class: "S4 History",    score: 95, time: "18 min", aiGrade: 93, flagged: false, submitted: "Jul 26 11:15" },
];

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 70
      ? "bg-[#D1FAE5] text-[#065F46]"
      : score >= 50
      ? "bg-[#FEF3C7] text-[#92400E]"
      : "bg-[#FEE2E2] text-[#991B1B]";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex ${cls}`}>
      {score}%
    </span>
  );
}

function FlaggedBadge({ flagged }: { flagged: boolean }) {
  return flagged ? (
    <span className="bg-[#FEE2E2] text-[#991B1B] rounded-full px-2.5 py-0.5 text-xs font-semibold">Yes</span>
  ) : (
    <span className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2.5 py-0.5 text-xs font-semibold">No</span>
  );
}

export function AdminQuizSubmissions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<FilterTab>("all");

  const filtered = submissions.filter((s) => {
    if (tab === "flagged") return s.flagged;
    if (tab === "passed") return s.score >= 70;
    if (tab === "failed") return s.score < 70;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "flagged", label: "Flagged" },
    { key: "passed", label: "Passed" },
    { key: "failed", label: "Failed" },
  ];

  return (
    <AppShell role="admin" pending={true} pageTitle="Submissions">
      {/* Breadcrumb */}
      <nav className="text-sm flex items-center gap-1 text-[#64748B] mb-5">
        <Link to="/admin" className="text-[#272757] hover:underline">Admin</Link>
        <span>›</span>
        <Link to="/admin/quiz-oversight" className="hover:underline">Quiz Oversight</Link>
        <span>›</span>
        <span>Biology Basics</span>
        <span>›</span>
        <span>Submissions</span>
      </nav>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-[#0F0E47]">Biology Basics — Submissions</h2>
        <button className="flex items-center gap-2 border border-[#272757] text-[#272757] hover:bg-[#EDE9FE] rounded-xl h-9 px-4 text-sm font-medium transition-colors">
          <Download className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Export CSV
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === key ? "bg-[#272757] text-white" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#272757]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#8686AC]">
            <ClipboardList className="w-10 h-10 mb-3" style={{ strokeWidth: 1.5 }} />
            <p className="text-sm">No submissions yet for this quiz.</p>
          </div>
        ) : (
          <table className="qm-table w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Time Taken</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">AI Grade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Flagged</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Submitted At</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={i}
                  className={`border-b border-[#E2E8F0] last:border-0 hover:bg-[#EDE9FE] transition-colors ${i % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-[#272757] rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {s.init}
                      </div>
                      <span className="text-sm font-medium text-[#0F0E47]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.class}</td>
                  <td className="px-4 py-3"><ScoreBadge score={s.score} /></td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.time}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.aiGrade}%</td>
                  <td className="px-4 py-3"><FlaggedBadge flagged={s.flagged} /></td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{s.submitted}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate("/student/results/3")}
                      className="flex items-center gap-1 border border-[#272757] text-[#272757] rounded-lg h-7 px-3 text-xs hover:bg-[#EDE9FE] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" style={{ strokeWidth: 1.75 }} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
