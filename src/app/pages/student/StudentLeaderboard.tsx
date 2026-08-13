import { useState } from "react";
import {
  Trophy,
  Medal,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

interface Student {
  rank: number;
  name: string;
  initials: string;
  avg: number;
  quizzes: number;
  best: number;
  streak: number;
}

const mockData: Student[] = [
  { rank: 1,  name: "Sarah Uwera",     initials: "SU", avg: 94, quizzes: 12, best: 100, streak: 8 },
  { rank: 2,  name: "David Kagabo",    initials: "DK", avg: 91, quizzes: 11, best: 98,  streak: 5 },
  { rank: 3,  name: "Grace Mutoni",    initials: "GM", avg: 88, quizzes: 10, best: 96,  streak: 7 },
  { rank: 4,  name: "Eric Nkurunziza", initials: "EN", avg: 85, quizzes: 9,  best: 92,  streak: 3 },
  { rank: 5,  name: "Alex Martinez",   initials: "AM", avg: 82, quizzes: 8,  best: 90,  streak: 5 },
  { rank: 6,  name: "Amina Osei",      initials: "AO", avg: 79, quizzes: 10, best: 88,  streak: 2 },
  { rank: 7,  name: "John Mwangi",     initials: "JM", avg: 76, quizzes: 7,  best: 85,  streak: 1 },
  { rank: 8,  name: "Claire Habimana", initials: "CH", avg: 72, quizzes: 9,  best: 84,  streak: 4 },
  { rank: 9,  name: "Peter Nzeyimana", initials: "PN", avg: 69, quizzes: 6,  best: 80,  streak: 0 },
  { rank: 10, name: "Diane Uwimana",   initials: "DU", avg: 65, quizzes: 5,  best: 78,  streak: 1 },
];

const classes = ["S3 Biology 2026", "Mathematics A", "English Literature"];

const CURRENT_USER = "Alex Martinez";

export function StudentLeaderboard() {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]);
  const [showRanking, setShowRanking] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "month">("all");
  const leaderboardEnabled = true;

  const first  = mockData[0];
  const second = mockData[1];
  const third  = mockData[2];

  return (
    <AppShell role="student" pending={true} pageTitle="Leaderboard">
      <div className="min-h-full bg-[#F8FAFC] p-6">

        {/* Top bar: class selector + privacy toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Class selector */}
          <div className="relative inline-block">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none bg-white border border-[#E2E8F0] text-[#272757] text-sm font-medium rounded-lg px-4 py-2.5 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#272757] cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="w-4 h-4 text-[#505081]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Privacy toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#475569]">Show my ranking</span>
            <button
              onClick={() => setShowRanking((prev) => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#272757] focus:ring-offset-1 ${
                showRanking ? "bg-[#272757]" : "bg-gray-200"
              }`}
              aria-label="Toggle ranking visibility"
            >
              <span
                className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  showRanking ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {!leaderboardEnabled ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#E2E8F0]">
            <Trophy className="w-16 h-16 text-[#8686AC] mb-4" />
            <p className="text-[#8686AC] text-base font-medium text-center max-w-xs">
              No rankings yet. Complete a quiz to appear on the leaderboard.
            </p>
          </div>
        ) : (
          <>
            {/* Podium section */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#475569] uppercase tracking-wide mb-6">Top Performers — {selectedClass}</h2>
              <div className="flex items-end justify-center gap-4">

                {/* 2nd place */}
                <div className="flex flex-col items-center py-6 px-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] w-[160px]">
                  <Medal className="w-6 h-6 mb-2" style={{ color: "#9CA3AF" }} />
                  <span className="text-xs font-bold text-white bg-[#9CA3AF] rounded-full px-2 py-0.5 mb-3">2nd</span>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2"
                    style={{ backgroundColor: "#505081" }}
                  >
                    {second.initials}
                  </div>
                  <p className="text-[#272757] text-sm font-semibold text-center leading-tight mb-1">{second.name}</p>
                  <p className="text-[#505081] text-xs font-medium">{second.avg}%</p>
                </div>

                {/* 1st place */}
                <div
                  className="flex flex-col items-center py-8 px-6 rounded-xl w-[180px] shadow-md"
                  style={{ background: "linear-gradient(135deg, #272757 0%, #1A1952 100%)" }}
                >
                  <Trophy className="w-7 h-7 mb-2" style={{ color: "#F59E0B" }} />
                  <span className="text-xs font-bold text-[#272757] bg-[#F59E0B] rounded-full px-2 py-0.5 mb-3">1st</span>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold mb-2 border-2 border-[#F59E0B]"
                    style={{ backgroundColor: "#505081" }}
                  >
                    {first.initials}
                  </div>
                  <p className="text-white text-sm font-semibold text-center leading-tight mb-1">{first.name}</p>
                  <p className="text-[#F59E0B] text-xs font-bold">{first.avg}%</p>
                </div>

                {/* 3rd place */}
                <div className="flex flex-col items-center py-5 px-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] w-[160px]">
                  <Medal className="w-6 h-6 mb-2" style={{ color: "#CD7F32" }} />
                  <span className="text-xs font-bold text-white rounded-full px-2 py-0.5 mb-3" style={{ backgroundColor: "#CD7F32" }}>3rd</span>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2"
                    style={{ backgroundColor: "#505081" }}
                  >
                    {third.initials}
                  </div>
                  <p className="text-[#272757] text-sm font-semibold text-center leading-tight mb-1">{third.name}</p>
                  <p className="text-[#505081] text-xs font-medium">{third.avg}%</p>
                </div>

              </div>
            </div>

            {/* Filter pills + table */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {/* Filter pills */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E2E8F0]">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors duration-150 ${
                    activeFilter === "all"
                      ? "bg-[#272757] text-white"
                      : "border border-[#272757] text-[#272757] bg-white hover:bg-[#EDE9FE]"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setActiveFilter("month")}
                  className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors duration-150 ${
                    activeFilter === "month"
                      ? "bg-[#272757] text-white"
                      : "border border-[#272757] text-[#272757] bg-white hover:bg-[#EDE9FE]"
                  }`}
                >
                  This Month
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F1F5F9]">
                      <th className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wide px-4 py-3 w-16">Rank</th>
                      <th className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wide px-4 py-3">Student Name</th>
                      <th className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wide px-4 py-3">Avg Score</th>
                      <th className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wide px-4 py-3">Quizzes</th>
                      <th className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wide px-4 py-3">Best Score</th>
                      <th className="text-left text-xs font-semibold text-[#475569] uppercase tracking-wide px-4 py-3">Streak (days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.map((student, index) => {
                      const isCurrentUser = student.name === CURRENT_USER;
                      const isEven = index % 2 === 0;
                      let rowBg = isCurrentUser
                        ? "bg-[#EDE9FE]"
                        : isEven
                        ? "bg-white"
                        : "bg-[#F8FAFC]";

                      return (
                        <tr
                          key={student.rank}
                          className={`${rowBg} hover:bg-[#EDE9FE] transition-colors duration-100`}
                          style={{ height: "56px" }}
                        >
                          {/* Rank */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                student.rank === 1
                                  ? "bg-[#F59E0B] text-white"
                                  : student.rank === 2
                                  ? "bg-[#9CA3AF] text-white"
                                  : student.rank === 3
                                  ? "text-white"
                                  : "bg-[#F1F5F9] text-[#475569]"
                              }`}
                              style={student.rank === 3 ? { backgroundColor: "#CD7F32" } : undefined}
                            >
                              {student.rank}
                            </span>
                          </td>

                          {/* Student Name */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: "#505081" }}
                              >
                                {student.initials}
                              </div>
                              <span className="text-sm font-medium text-[#1E293B]">{student.name}</span>
                              {isCurrentUser && (
                                <span className="bg-[#272757] text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold leading-none">
                                  You
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Avg Score */}
                          <td className="px-4 py-4">
                            <span className="text-sm font-semibold text-[#272757]">{student.avg}%</span>
                          </td>

                          {/* Quizzes Completed */}
                          <td className="px-4 py-4">
                            <span className="text-sm text-[#475569]">{student.quizzes}</span>
                          </td>

                          {/* Best Score */}
                          <td className="px-4 py-4">
                            <span className="text-sm text-[#475569]">{student.best}%</span>
                          </td>

                          {/* Streak */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              {student.streak > 0 ? (
                                <>
                                  <span className="text-sm">🔥</span>
                                  <span className="text-sm font-medium text-[#272757]">{student.streak}d</span>
                                </>
                              ) : (
                                <span className="text-sm text-[#8686AC]">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer note when ranking hidden */}
              {!showRanking && (
                <div className="px-6 py-3 bg-[#EDE9FE] border-t border-[#E2E8F0] text-xs text-[#505081] font-medium">
                  Your ranking is currently hidden from other students.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
