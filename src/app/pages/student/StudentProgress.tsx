import { useEffect, useState } from "react";
import {
  BarChart3,
  Flame,
  Lock,
  Loader2,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { AppShell } from "../../components/AppShell";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { api, ApiError } from "@/lib/api";

const SUBJECT_LINE_COLORS: Record<string, string> = {
  Science: "#10B981", Mathematics: "#272757", English: "#272757", History: "#F59E0B",
};

interface SubjectRow {
  subject: string;
  quizzes: number;
  avg: number;
  color: string;
}

interface Achievement {
  id: number;
  label: string;
  emoji: string;
  desc: string;
  earned: boolean;
}

export function StudentProgress() {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [overallAvg, setOverallAvg] = useState(0);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectRow[]>([]);
  const [trendData, setTrendData] = useState<Record<string, unknown>[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lineSubjects, setLineSubjects] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.progress.me();
        const d: any = res.data || {};
        setStreak(Number(d.streak ?? 0));
        setTotalQuizzes(Number(d.totalQuizzes ?? 0));
        setOverallAvg(Number(d.overallAvg ?? 0));
        const subjects: SubjectRow[] = Array.isArray(d.subjectBreakdown) ? d.subjectBreakdown : [];
        setSubjectBreakdown(subjects);
        const trend = Array.isArray(d.trendData) ? d.trendData : [];
        setTrendData(trend);
        const keys = new Set<string>();
        for (const row of trend) {
          Object.keys(row).forEach((k) => {
            if (k !== "date") keys.add(k);
          });
        }
        setLineSubjects(Array.from(keys));
        setAchievements(Array.isArray(d.achievements) ? d.achievements : []);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load progress");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell role="student" pageTitle="My Progress">
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading progress…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Current Streak</p>
                  <p className="text-3xl font-semibold text-[#0F0E47]">{streak} days</p>
                  <p className="text-xs text-gray-400 mt-1">Keep it up</p>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-600" style={{ strokeWidth: 1.75 }} />
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Total Quizzes</p>
                  <p className="text-3xl font-semibold text-[#0F0E47]">{totalQuizzes}</p>
                  <p className="text-xs text-gray-400 mt-1">Across {subjectBreakdown.length} subjects</p>
                </div>
                <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#272757]" style={{ strokeWidth: 1.75 }} />
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Average Score</p>
                  <p className="text-3xl font-semibold text-[#0F0E47]">{overallAvg}%</p>
                  <p className="text-xs text-gray-400 mt-1">All time average</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" style={{ strokeWidth: 1.75 }} />
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#0F0E47]">Score Trend Over Time</h2>
            </div>
            <div className="p-5">
              {trendData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">No quiz scores yet. Complete a quiz to see your trend.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid key="sp-grid" strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis key="sp-x" dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis key="sp-y" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip key="sp-tooltip" formatter={(v: any) => `${v}%`} />
                    <Legend key="sp-legend" wrapperStyle={{ fontSize: 12 }} />
                    {lineSubjects.map((subj) => {
                      const color = SUBJECT_LINE_COLORS[subj] || "#505081";
                      return (
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
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <h2 className="text-sm font-semibold text-[#0F0E47] mb-4">By Subject</h2>
          {subjectBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 mb-6">No subject data yet.</p>
          ) : (
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
          )}

          <h2 className="text-sm font-semibold text-[#0F0E47] mb-4">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.map((a) => (
              <Card
                key={a.id}
                className={`rounded-xl p-4 text-center border transition-all ${
                  a.earned
                    ? "bg-white border-gray-100 shadow-sm"
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
        </>
      )}
    </AppShell>
  );
}
