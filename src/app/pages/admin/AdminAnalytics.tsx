import { useState } from "react";
import {
  Users,
  Building2,
  Bot,
  BookOpen,
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
import { AppShell } from "../../components/AppShell";

const weeks = ["Jun 2","Jun 9","Jun 16","Jun 23","Jun 30","Jul 7","Jul 14"];
const quizValues = [12, 18, 15, 22, 28, 19, 25];
const teacherValues = [8, 10, 9, 12, 11, 9, 13];
const studentValues = [42, 58, 51, 65, 72, 60, 71];

const lineData = weeks.map((week, i) => ({ week: week + "-" + i, quizzes: quizValues[i] }));
const barData = weeks.map((week, i) => ({ week: week + "-" + i, teachers: teacherValues[i], students: studentValues[i] }));

const pieData = [
  { name: "Teachers", value: 24 },
  { name: "Students", value: 456 },
  { name: "Admins",   value: 2 },
];
const PIE_COLORS = ["#272757", "#505081", "#8686AC"];

const topSchools = [
  { name: "Kigali Academy",       quizzes: 48, students: 234, avg: "84%", status: "active" },
  { name: "Nairobi Tech College", quizzes: 41, students: 312, avg: "79%", status: "active" },
  { name: "INES Ruhengeri",       quizzes: 35, students: 156, avg: "81%", status: "active" },
  { name: "Dar Academy",          quizzes: 28, students: 201, avg: "76%", status: "active" },
  { name: "Kampala University",   quizzes: 15, students: 98,  avg: "71%", status: "active" },
];

type DateRange = "7d" | "30d" | "3m";

const DATE_PILLS: { label: string; value: DateRange }[] = [
  { label: "Last 7 Days",    value: "7d" },
  { label: "Last 30 Days",   value: "30d" },
  { label: "Last 3 Months",  value: "3m" },
];

const statCards = [
  { label: "Total Users",     value: "482",   icon: Users },
  { label: "Quizzes Created", value: "187",   icon: BookOpen },
  { label: "AI Gradings",     value: "1,204", icon: Bot },
  { label: "Active Schools",  value: "12",    icon: Building2 },
];

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>("7d");

  return (
    <AppShell role="admin" pending={true} pageTitle="Analytics">
      {/* Top bar */}
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

      {/* Stat cards */}
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

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Line chart */}
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

        {/* Bar chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F0E47] mb-4">Active Users per Week</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid key="bc-grid" strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis key="bc-x" dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis key="bc-y" tick={{ fontSize: 11 }} />
              <Tooltip key="bc-tooltip" />
              <Legend key="bc-legend" />
              <Bar key="bc-teachers" name="Teachers" dataKey="teachers" fill="#272757" barSize={10} />
              <Bar key="bc-students" name="Students" dataKey="students" fill="#8686AC" barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm mb-6 flex flex-col items-center">
        <p className="text-sm font-semibold text-[#0F0E47] mb-4 self-start">User Role Breakdown</p>
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
      </div>

      {/* Top 5 Active Schools table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 pt-5 pb-3">
          <h3 className="font-semibold text-[#0F0E47]">Top 5 Active Schools</h3>
        </div>
        <table className="qm-table w-full text-sm">
          <thead>
            <tr className="bg-[#F1F5F9] text-[#475569] text-left">
              <th className="px-5 py-3 font-semibold">School Name</th>
              <th className="px-5 py-3 font-semibold">Quizzes Created</th>
              <th className="px-5 py-3 font-semibold">Active Students</th>
              <th className="px-5 py-3 font-semibold">Avg Score</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {topSchools.map((s, i) => (
              <tr
                key={s.name}
                className={`border-t border-[#E2E8F0] hover:bg-[#EDE9FE] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}
              >
                <td className="px-5 py-3 font-semibold text-[#0F0E47]">{s.name}</td>
                <td className="px-5 py-3 text-[#64748B]">{s.quizzes}</td>
                <td className="px-5 py-3 text-[#64748B]">{s.students}</td>
                <td className="px-5 py-3 text-[#64748B]">{s.avg}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
