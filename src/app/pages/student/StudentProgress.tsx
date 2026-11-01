import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BarChart3,
  Flame,
  Loader2,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { AppShell } from "../../components/AppShell";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { api, ApiError } from "@/lib/api";

const SUBJECT_PALETTE = [
  "#272757", "#10B981", "#F59E0B", "#3B82F6", "#EF4444",
  "#8B5CF6", "#14B8A6", "#F97316", "#6366F1", "#EC4899",
];

function colorForSubject(subject: string, index: number) {
  if (/science|bio|chem/i.test(subject)) return "#10B981";
  if (/phys/i.test(subject)) return "#3B82F6";
  if (/math/i.test(subject)) return "#272757";
  if (/hist/i.test(subject)) return "#F59E0B";
  if (/geo/i.test(subject)) return "#14B8A6";
  if (/eng|liter/i.test(subject)) return "#8B5CF6";
  if (/comp|ict|cs/i.test(subject)) return "#6366F1";
  return SUBJECT_PALETTE[index % SUBJECT_PALETTE.length];
}

interface SubjectRow {
  subject: string;
  quizzes: number;
  avg: number;
  color: string;
}

interface ScorePoint {
  date: string;
  score: number;
  subject: string;
}

interface RecommendationItem {
  submissionId: number;
  quizId: number;
  title: string;
  subject: string;
  score: number;
  date: string;
  recommendation: string;
  edited?: boolean;
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p: any) => p.value != null && p.dataKey !== "score");
  const overall = payload.find((p: any) => p.dataKey === "Overall" || p.dataKey === "score");
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-[#0F0E47] mb-1.5">{label}</p>
      {overall && (
        <p className="text-[#272757] font-medium mb-1">
          {overall.dataKey === "score" ? "Score" : "Overall"}: {overall.value}%
          {overall.payload?.subject ? (
            <span className="text-gray-400 font-normal"> · {overall.payload.subject}</span>
          ) : null}
        </p>
      )}
      {rows
        .filter((p: any) => p.dataKey !== "Overall")
        .map((p: any) => (
          <p key={p.dataKey} className="flex items-center gap-2 text-gray-600">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}: <span className="font-semibold text-[#0F0E47]">{p.value}%</span>
          </p>
        ))}
    </div>
  );
}

export function StudentProgress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [overallAvg, setOverallAvg] = useState(0);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectRow[]>([]);
  const [trendData, setTrendData] = useState<Record<string, unknown>[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [lineSubjects, setLineSubjects] = useState<string[]>([]);
  const [view, setView] = useState<"overall" | "subjects">("overall");

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
        setSubjectBreakdown(
          subjects.map((s, i) => ({
            ...s,
            color: s.color || colorForSubject(s.subject, i),
          }))
        );
        const trend = Array.isArray(d.trendData) ? d.trendData : [];
        setTrendData(trend);
        const history: ScorePoint[] = Array.isArray(d.scoreHistory)
          ? d.scoreHistory.map((h: any, i: number) => ({
              date: h.date || h.label || `#${i + 1}`,
              score: Number(h.score ?? 0),
              subject: h.subject || "General",
            }))
          : [];
        setScoreHistory(history);
        const keys = new Set<string>();
        for (const row of trend) {
          Object.keys(row).forEach((k) => {
            if (k !== "date" && k !== "Overall") keys.add(k);
          });
        }
        setLineSubjects(Array.from(keys));
        setRecommendations(Array.isArray(d.recommendations) ? d.recommendations : []);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load progress");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subjectColors = useMemo(() => {
    const map: Record<string, string> = {};
    lineSubjects.forEach((subj, i) => {
      const fromBreakdown = subjectBreakdown.find((s) => s.subject === subj)?.color;
      map[subj] = fromBreakdown || colorForSubject(subj, i);
    });
    return map;
  }, [lineSubjects, subjectBreakdown]);

  const chartInsight = useMemo(() => {
    const series = scoreHistory.length
      ? scoreHistory.map((h) => h.score)
      : trendData
          .map((r) => Number((r as any).Overall))
          .filter((n) => !Number.isNaN(n));
    if (series.length < 2) {
      return { text: "Complete more quizzes to see how your scores move over time.", direction: "flat" as const };
    }
    const firstHalf = series.slice(0, Math.ceil(series.length / 2));
    const secondHalf = series.slice(Math.floor(series.length / 2));
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const delta = Math.round(avg(secondHalf) - avg(firstHalf));
    if (delta >= 5) {
      return { text: `Scores are trending up about ${delta} pts vs earlier quizzes.`, direction: "up" as const };
    }
    if (delta <= -5) {
      return { text: `Scores dipped about ${Math.abs(delta)} pts vs earlier quizzes — review weak subjects.`, direction: "down" as const };
    }
    return { text: "Scores are holding steady across recent quizzes.", direction: "flat" as const };
  }, [scoreHistory, trendData]);

  const overallChartData = useMemo(() => {
    if (scoreHistory.length) {
      // Disambiguate same-day labels for a continuous path
      const counts: Record<string, number> = {};
      return scoreHistory.map((h, i) => {
        counts[h.date] = (counts[h.date] || 0) + 1;
        const label =
          counts[h.date] > 1 || scoreHistory.filter((x) => x.date === h.date).length > 1
            ? `${h.date} ·${counts[h.date]}`
            : h.date;
        return {
          date: label,
          score: h.score,
          subject: h.subject,
          index: i + 1,
        };
      });
    }
    return trendData.map((r: any) => ({
      date: r.date,
      score: r.Overall ?? null,
      subject: "Overall",
    }));
  }, [scoreHistory, trendData]);

  const InsightIcon =
    chartInsight.direction === "up" ? TrendingUp : chartInsight.direction === "down" ? TrendingDown : Minus;

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
            <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#0F0E47]">Score Trend Over Time</h2>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <InsightIcon className="w-3.5 h-3.5 text-[#272757]" />
                  {chartInsight.text}
                </p>
              </div>
              <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setView("overall")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    view === "overall" ? "bg-white text-[#272757] shadow-sm" : "text-gray-500"
                  }`}
                >
                  Overall
                </button>
                <button
                  type="button"
                  onClick={() => setView("subjects")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    view === "subjects" ? "bg-white text-[#272757] shadow-sm" : "text-gray-500"
                  }`}
                >
                  By subject
                </button>
              </div>
            </div>
            <div className="p-5">
              {(view === "overall" ? overallChartData.length === 0 : trendData.length === 0) ? (
                <p className="text-sm text-gray-400 text-center py-12">
                  No quiz scores yet. Complete a quiz to see your trend.
                </p>
              ) : view === "overall" ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={overallChartData} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#272757" stopOpacity={0.35} />
                        <stop offset="55%" stopColor="#505081" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#8686AC" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                      tickMargin={8}
                      interval="preserveStartEnd"
                      minTickGap={28}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      tickFormatter={(v) => `${v}%`}
                      width={42}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <ReferenceLine
                      y={overallAvg}
                      stroke="#10B981"
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Avg ${overallAvg}%`,
                        position: "insideTopRight",
                        fill: "#059669",
                        fontSize: 11,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="#272757"
                      strokeWidth={2.5}
                      fill="url(#scoreFill)"
                      dot={{ r: 4, fill: "#272757", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#272757", stroke: "#fff", strokeWidth: 2 }}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                    <defs>
                      {lineSubjects.map((subj) => {
                        const color = subjectColors[subj];
                        const id = `fill-${subj.replace(/\W+/g, "-")}`;
                        return (
                          <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                          </linearGradient>
                        );
                      })}
                      <linearGradient id="overallFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F0E47" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#0F0E47" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                      tickMargin={8}
                      interval="preserveStartEnd"
                      minTickGap={28}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      tickFormatter={(v) => `${v}%`}
                      width={42}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Area
                      type="monotone"
                      dataKey="Overall"
                      name="Overall"
                      stroke="#0F0E47"
                      strokeWidth={2}
                      fill="url(#overallFill)"
                      connectNulls
                      dot={false}
                    />
                    {lineSubjects.map((subj) => {
                      const color = subjectColors[subj];
                      const gradId = `fill-${subj.replace(/\W+/g, "-")}`;
                      return (
                        <Area
                          key={subj}
                          type="monotone"
                          dataKey={subj}
                          name={subj}
                          stroke={color}
                          strokeWidth={2.25}
                          fill={`url(#${gradId})`}
                          connectNulls
                          dot={{ r: 3.5, fill: color, strokeWidth: 0 }}
                          activeDot={{ r: 5.5, stroke: "#fff", strokeWidth: 2 }}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {view === "overall" && overallChartData.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  Shaded area = your quiz scores in order · dashed green = your overall average ({overallAvg}%)
                </p>
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

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F0E47]">Study recommendations</h2>
            {recommendations.length > 0 && (
              <span className="text-xs text-gray-400">{recommendations.length} given</span>
            )}
          </div>
          {recommendations.length === 0 ? (
            <Card className="bg-white rounded-xl p-8 text-center mb-2">
              <Lightbulb className="w-8 h-8 text-[#8686AC] mx-auto mb-3" />
              <p className="text-sm text-gray-500">No recommendations yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complete a quiz to get personalized study advice.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <Card
                  key={rec.submissionId}
                  className="bg-white rounded-xl p-5 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => navigate(`/student/results/${rec.quizId}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4 text-[#272757]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#0F0E47] truncate">{rec.title}</p>
                        {rec.subject ? (
                          <Badge className="rounded-full text-[10px] bg-[#EDE9FE] text-[#272757] border-0">
                            {rec.subject}
                          </Badge>
                        ) : null}
                        <Badge className="rounded-full text-[10px] bg-emerald-50 text-emerald-700 border-0">
                          {rec.score}%
                        </Badge>
                        {rec.edited ? (
                          <Badge className="rounded-full text-[10px] bg-amber-50 text-amber-700 border-0">
                            Teacher updated
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{rec.date}</p>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{rec.recommendation}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
