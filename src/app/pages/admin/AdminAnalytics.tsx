import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Bot,
  BookOpen,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

const PIE_COLORS = ["#272757", "#505081", "#8686AC"];

type DateRange = "7d" | "30d" | "3m";

const DATE_PILLS: { label: string; value: DateRange }[] = [
  { label: "Last 7 Days",    value: "7d" },
  { label: "Last 30 Days",   value: "30d" },
  { label: "Last 3 Months",  value: "3m" },
];

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    newUsers: 0,
    newQuizzes: 0,
    submissions: 0,
    avgScore: 0,
    schools: 0,
  });
  const [series, setSeries] = useState<any[]>([]);
  const [topSchools, setTopSchools] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.analytics(dateRange);
        const d: any = res.data || {};
        setTotals({
          newUsers: d.totals?.newUsers ?? 0,
          newQuizzes: d.totals?.newQuizzes ?? 0,
          submissions: d.totals?.submissions ?? 0,
          avgScore: d.totals?.avgScore ?? 0,
          schools: d.totals?.schools ?? 0,
        });
        setSeries(Array.isArray(d.series) ? d.series : []);
        setTopSchools(Array.isArray(d.topSchools) ? d.topSchools : []);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [dateRange]);

  const lineData = series.map((s) => ({
    week: s.date,
    quizzes: s.quizzes ?? 0,
  }));
  const barData = series.map((s) => ({
    week: s.date,
    teachers: s.users ?? 0,
    students: s.submissions ?? 0,
  }));
  const pieData = [
    { name: "New Users", value: totals.newUsers || 1 },
    { name: "Quizzes", value: totals.newQuizzes || 1 },
    { name: "Submissions", value: totals.submissions || 1 },
  ];

  const statCards = [
    { label: "Total Users",     value: String(totals.newUsers),     icon: Users },
    { label: "Quizzes Created", value: String(totals.newQuizzes),   icon: BookOpen },
    { label: "AI Gradings",     value: String(totals.submissions),  icon: Bot },
    { label: "Active Schools",  value: String(totals.schools),      icon: Building2 },
  ];

  return (
    <AppShell role="admin" pageTitle="Analytics">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0F0E47]">Analytics</h2>
        <div className="flex items-center gap-2">
          {DATE_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setDateRange(pill.value)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                dateRange === pill.value
                  ? "bg-[#272757] text-white"
                  : "bg-white border border-[#272757] text-[#272757] hover:bg-[#EDE9FE]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#8686AC] gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading analytics…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#272757]" />
                </div>
                <p className="text-xs text-[#64748B] mb-1">{label}</p>
                <p className="text-3xl font-bold text-[#272757]">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#0F0E47] mb-4">Quizzes Created per Week</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={lineData}>
                  <CartesianGrid key="lc-grid" strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis key="lc-x" dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis key="lc-y" tick={{ fontSize: 11 }} />
                  <Tooltip key="lc-tooltip" />
                  <Line
                    key="lc-quizzes"
                    name="Quizzes"
                    dataKey="quizzes"
                    stroke="#272757"
                    strokeWidth={2}
                    dot={{ fill: "#272757", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#0F0E47] mb-4">Activity per Day</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData}>
                  <CartesianGrid key="bc-grid" strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis key="bc-x" dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis key="bc-y" tick={{ fontSize: 11 }} />
                  <Tooltip key="bc-tooltip" />
                  <Legend key="bc-legend" />
                  <Bar key="bc-teachers" name="New Users" dataKey="teachers" fill="#272757" barSize={10} />
                  <Bar key="bc-students" name="Submissions" dataKey="students" fill="#8686AC" barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm mb-6 flex flex-col items-center">
            <p className="text-sm font-semibold text-[#0F0E47] mb-4 self-start">Activity Breakdown</p>
            <PieChart width={360} height={260}>
              <Pie
                key="pc-pie"
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={"pc-cell-" + entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend key="pc-legend" />
              <Tooltip key="pc-tooltip" />
            </PieChart>
            <p className="text-xs text-[#8686AC] mt-2">Avg score in range: {totals.avgScore}%</p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 pt-5 pb-3">
              <h3 className="font-semibold text-[#0F0E47]">Top Active Schools</h3>
            </div>
            <table className="qm-table w-full text-sm">
              <thead>
                <tr className="bg-[#F1F5F9] text-[#475569] text-left">
                  <th className="px-5 py-3 font-semibold">School Name</th>
                  <th className="px-5 py-3 font-semibold">Teachers</th>
                  <th className="px-5 py-3 font-semibold">Students</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {topSchools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#8686AC]">No school data yet.</td>
                  </tr>
                ) : (
                  topSchools.map((s, i) => (
                    <tr
                      key={s.name}
                      className={`border-t border-[#E2E8F0] hover:bg-[#EDE9FE] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}
                    >
                      <td className="px-5 py-3 font-semibold text-[#0F0E47]">{s.name}</td>
                      <td className="px-5 py-3 text-[#64748B]">{s.teachers}</td>
                      <td className="px-5 py-3 text-[#64748B]">{s.students}</td>
                      <td className="px-5 py-3 text-[#64748B]">{s.total}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
