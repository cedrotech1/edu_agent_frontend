import { useNavigate } from "react-router";
import {
  BarChart3,
  Flame,
  Lock,
  Target,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { AppShell } from "../../components/AppShell";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const trendData = [
  { date: "Jul 1",  Science: 72, Mathematics: 65, English: 80, History: null },
  { date: "Jul 5",  Science: 78, Mathematics: 70, English: 85, History: 60 },
  { date: "Jul 10", Science: 74, Mathematics: 80, English: 88, History: 65 },
  { date: "Jul 14", Science: 45, Mathematics: 85, English: null, History: null },
  { date: "Jul 17", Science: null, Mathematics: null, English: null, History: 61 },
  { date: "Jul 20", Science: null, Mathematics: 95, English: 88, History: null },
  { date: "Jul 22", Science: null, Mathematics: 95, English: null, History: null },
  { date: "Jul 23", Science: null, Mathematics: null, English: 88, History: null },
  { date: "Jul 25", Science: 92, Mathematics: null, English: null, History: null },
];

const subjectBreakdown = [
  { subject: "Science",     quizzes: 4, avg: 70, color: "#10B981" },
  { subject: "Mathematics", quizzes: 3, avg: 85, color: "#272757" },
  { subject: "English",     quizzes: 2, avg: 85, color: "#272757" },
  { subject: "History",     quizzes: 2, avg: 63, color: "#F59E0B" },
];

const SUBJECT_LINE_COLORS: Record<string, string> = {
  Science: "#10B981", Mathematics: "#272757", English: "#272757", History: "#F59E0B",
};

const achievements = [
  { id: 1, label: "First Quiz",          emoji: "🎯", desc: "Completed your first quiz",         earned: true  },
  { id: 2, label: "Perfect Score",       emoji: "⭐", desc: "Scored 100% on any quiz",            earned: false },
  { id: 3, label: "5-Day Streak",        emoji: "🔥", desc: "Studied 5 days in a row",           earned: true  },
  { id: 4, label: "10 Quizzes Done",     emoji: "🏆", desc: "Completed 10 quizzes",              earned: false },
  { id: 5, label: "Speed Demon",         emoji: "⚡", desc: "Finished a quiz in under 10 min",   earned: true  },
  { id: 6, label: "Top of the Class",    emoji: "👑", desc: "Ranked #1 in any quiz",             earned: false },
  { id: 7, label: "Science Whiz",        emoji: "🧪", desc: "Avg 90%+ in Science",               earned: false },
  { id: 8, label: "Math Master",         emoji: "📐", desc: "Avg 90%+ in Mathematics",           earned: false },
];

export function StudentProgress() {
  const navigate = useNavigate();
  const totalQuizzes = subjectBreakdown.reduce((s, x) => s + x.quizzes, 0);
  const overallAvg = Math.round(subjectBreakdown.reduce((s, x) => s + x.avg * x.quizzes, 0) / totalQuizzes);
  const streak = 5;

  return (
    <AppShell role="student" pending={true} pageTitle="My Progress">
      {/* Top stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-[#FF6B35] to-[#F59E0B] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-7 h-7" style={{ strokeWidth: 1.75 }} />
            <div>
              <p className="text-white/80 text-xs">Current Streak</p>
              <p className="text-3xl font-bold">{streak} days</p>
            </div>
          </div>
          <p className="text-white/70 text-xs">Keep it up! 🔥</p>
        </Card>

        <Card className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
              <Target className="w-4.5 h-4.5 text-[#272757]" style={{ strokeWidth: 1.75 }} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-[#272757]">{totalQuizzes}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Across {subjectBreakdown.length} subjects</p>
        </Card>

        <Card className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-[#10B981]" style={{ strokeWidth: 1.75 }} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-[#10B981]">{overallAvg}%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">All time average</p>
        </Card>
      </div>

      {/* Score trend line chart */}
      <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="qm-section-heading text-sm mb-5">Score Trend Over Time</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid key="sp-grid" strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis key="sp-x" dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis key="sp-y" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip key="sp-tooltip" formatter={(v: any) => `${v}%`} />
            <Legend key="sp-legend" wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(SUBJECT_LINE_COLORS).map(([subj, color]) => (
              <Line
                key={"sp-line-" + subj}
                name={subj}
                type="monotone"
                dataKey={subj}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: color }}
                connectNulls={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Subject breakdown */}
      <h2 className="qm-section-heading text-sm mb-4">By Subject</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {subjectBreakdown.map((s) => (
          <Card key={s.subject} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <span className="font-semibold text-[#0F0E47] text-sm">{s.subject}</span>
              </div>
              <Badge className="rounded-full text-xs font-bold px-2.5 py-0.5" style={{ background: `${s.color}18`, color: s.color }}>
                {s.avg}%
              </Badge>
            </div>
            <Progress value={s.avg} className="h-2 mb-2" style={{ ["--progress-color" as any]: s.color }} />
            <p className="text-xs text-gray-400">{s.quizzes} quiz{s.quizzes !== 1 ? "zes" : ""} completed</p>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <h2 className="qm-section-heading text-sm mb-4">Achievements</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((a) => (
          <Card
            key={a.id}
            className={`rounded-xl p-4 text-center border transition-all ${
              a.earned
                ? "bg-white border-[#272757]/20 shadow-sm"
                : "bg-gray-50 border-gray-100 opacity-60"
            }`}
          >
            <div className={`text-3xl mb-2 ${a.earned ? "" : "grayscale opacity-40"}`}>{a.emoji}</div>
            <p className={`text-xs font-bold mb-1 ${a.earned ? "text-[#0F0E47]" : "text-gray-400"}`}>{a.label}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{a.desc}</p>
            {!a.earned && (
              <div className="flex items-center justify-center gap-1 mt-2 text-gray-400">
                <Lock className="w-3 h-3" style={{ strokeWidth: 1.75 }} />
                <span className="text-[10px]">Locked</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
