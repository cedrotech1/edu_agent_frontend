import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Ban,
  Eye,
  X,
  AlertTriangle,
  Loader2,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  CheckCircle2,
  PauseCircle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

interface SchoolRow {
  id: number;
  name: string;
  location: string;
  status: "active" | "suspended";
  teachers: number;
  students: number;
  classes: number;
  quizzes: number;
  users: number;
  activeTeachers?: number;
  activeStudents?: number;
}

interface RosterUser {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface RosterClass {
  id: number;
  name: string;
  subject: string;
  code: string;
  teacherName: string;
  studentCount: number;
  quizCount: number;
  activeQuizzes: number;
  educationLevel?: string;
  subLevel?: string;
}

type SortKey = "name" | "users" | "teachers" | "students" | "classes" | "quizzes";
type DetailTab = "overview" | "teachers" | "students" | "classes";
type StatusFilter = "all" | "active" | "suspended";

function StatusBadge({ status }: { status: "active" | "suspended" | string }) {
  if (status === "active") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#991B1B]">
      Suspended
    </span>
  );
}

function mapSchool(s: any): SchoolRow {
  return {
    id: s.id,
    name: s.name || "",
    location: s.location || "—",
    status: s.status === "suspended" ? "suspended" : "active",
    teachers: Number(s.teachers ?? 0),
    students: Number(s.students ?? 0),
    classes: Number(s.classes ?? 0),
    quizzes: Number(s.quizzes ?? 0),
    users: Number(s.users ?? (Number(s.teachers || 0) + Number(s.students || 0))),
    activeTeachers: Number(s.activeTeachers ?? s.teachers ?? 0),
    activeStudents: Number(s.activeStudents ?? s.students ?? 0),
  };
}

export function AdminSchools() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [totals, setTotals] = useState({
    schools: 0,
    active: 0,
    suspended: 0,
    teachers: 0,
    students: 0,
    classes: 0,
    quizzes: 0,
    users: 0,
  });
  const [topByUsers, setTopByUsers] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("users");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", location: "" });

  const [editSchool, setEditSchool] = useState<SchoolRow | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    status: "active" as "active" | "suspended",
  });

  const [suspendSchool, setSuspendSchool] = useState<SchoolRow | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTeachers, setDetailTeachers] = useState<RosterUser[]>([]);
  const [detailStudents, setDetailStudents] = useState<RosterUser[]>([]);
  const [detailClasses, setDetailClasses] = useState<RosterClass[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.schools.hub();
      const d: any = res.data || {};
      const rows = ((d.schools as any[]) || []).map(mapSchool);
      setSchools(rows);
      setTotals({
        schools: Number(d.totals?.schools ?? rows.length),
        active: Number(d.totals?.active ?? rows.filter((r) => r.status === "active").length),
        suspended: Number(d.totals?.suspended ?? rows.filter((r) => r.status === "suspended").length),
        teachers: Number(d.totals?.teachers ?? 0),
        students: Number(d.totals?.students ?? 0),
        classes: Number(d.totals?.classes ?? 0),
        quizzes: Number(d.totals?.quizzes ?? 0),
        users: Number(d.totals?.users ?? 0),
      });
      setTopByUsers(((d.topByUsers as any[]) || []).map(mapSchool));
    } catch (err) {
      // Fallback to list if hub unavailable
      try {
        const res = await api.admin.schools.list();
        const rows = ((res.data as any[]) || []).map(mapSchool);
        setSchools(rows);
        setTotals({
          schools: rows.length,
          active: rows.filter((r) => r.status === "active").length,
          suspended: rows.filter((r) => r.status === "suspended").length,
          teachers: rows.reduce((a, r) => a + r.teachers, 0),
          students: rows.reduce((a, r) => a + r.students, 0),
          classes: rows.reduce((a, r) => a + r.classes, 0),
          quizzes: rows.reduce((a, r) => a + r.quizzes, 0),
          users: rows.reduce((a, r) => a + r.users, 0),
        });
        setTopByUsers([...rows].sort((a, b) => b.users - a.users).slice(0, 5));
      } catch (e2) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load schools");
        setSchools([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    setUserSearch("");
    setClassSearch("");
    try {
      const res = await api.admin.schools.roster(id);
      const d: any = res.data || {};
      setDetailTeachers(
        (d.teachers || []).map((t: any) => ({
          id: t.id,
          name: t.name || t.names || "—",
          email: t.email || "—",
          status: t.status || "active",
        }))
      );
      setDetailStudents(
        (d.students || []).map((s: any) => ({
          id: s.id,
          name: s.name || s.names || "—",
          email: s.email || "—",
          status: s.status || "active",
        }))
      );
      setDetailClasses(
        (d.classes || []).map((c: any) => ({
          id: c.id,
          name: c.name || "—",
          subject: c.subject || "—",
          code: c.code || "—",
          teacherName: c.teacherName || "—",
          studentCount: Number(c.studentCount ?? 0),
          quizCount: Number(c.quizCount ?? 0),
          activeQuizzes: Number(c.activeQuizzes ?? 0),
          educationLevel: c.educationLevel,
          subLevel: c.subLevel,
        }))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load school detail");
      setDetailTeachers([]);
      setDetailStudents([]);
      setDetailClasses([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openSchool = (s: SchoolRow) => {
    setSelectedId(s.id);
    setDetailTab("overview");
    loadDetail(s.id);
  };

  const selected = schools.find((s) => s.id === selectedId) || null;

  const filtered = useMemo(() => {
    let rows = [...schools];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          String(s.id).includes(q)
      );
    }
    if (statusFilter !== "all") {
      rows = rows.filter((s) => s.status === statusFilter);
    }
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = Number(av) || 0;
      const bn = Number(bv) || 0;
      return sortDir === "asc" ? an - bn : bn - an;
    });
    return rows;
  }, [schools, search, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  async function handleAdd() {
    if (!addForm.name.trim()) {
      toast.error("School name is required");
      return;
    }
    try {
      await api.admin.schools.create({
        name: addForm.name.trim(),
        location: addForm.location.trim() || undefined,
      });
      toast.success("School created");
      setShowAddModal(false);
      setAddForm({ name: "", location: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create school");
    }
  }

  async function handleSaveEdit() {
    if (!editSchool) return;
    try {
      await api.admin.schools.update(editSchool.id, {
        name: editForm.name.trim(),
        location: editForm.location.trim() || null,
        status: editForm.status,
      });
      toast.success("School updated");
      setEditSchool(null);
      await load();
      if (selectedId === editSchool.id) loadDetail(editSchool.id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update");
    }
  }

  async function handleSuspend() {
    if (!suspendSchool) return;
    const next = suspendSchool.status === "active" ? "suspended" : "active";
    try {
      await api.admin.schools.update(suspendSchool.id, { status: next });
      toast.success(next === "suspended" ? "School suspended" : "School reactivated");
      setSuspendSchool(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  const filteredTeachers = detailTeachers.filter(
    (u) =>
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredStudents = detailStudents.filter(
    (u) =>
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredClasses = detailClasses.filter(
    (c) =>
      !classSearch ||
      c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.subject.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(classSearch.toLowerCase())
  );

  const statCards = [
    { label: "Schools", value: totals.schools, sub: `${totals.active} active · ${totals.suspended} suspended`, icon: Building2, bg: "bg-[#EDE9FE]", color: "text-[#272757]" },
    { label: "Users in schools", value: totals.users, sub: `${totals.teachers} teachers · ${totals.students} students`, icon: Users, bg: "bg-sky-50", color: "text-sky-700" },
    { label: "Classes", value: totals.classes, sub: "Across all schools", icon: GraduationCap, bg: "bg-emerald-50", color: "text-emerald-700" },
    { label: "Quizzes", value: totals.quizzes, sub: "Linked to school classes", icon: BookOpen, bg: "bg-amber-50", color: "text-amber-700" },
  ];

  return (
    <AppShell role="admin" pageTitle="Schools Hub">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0E47]">Schools intelligence</h1>
          <p className="text-sm text-gray-500">
            Search schools, compare statistics, and inspect every user and class under each school.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-[#272757] hover:bg-[#505081] text-white rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add school
        </button>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{c.label}</p>
                <p className="text-3xl font-semibold text-[#0F0E47] tracking-tight">
                  {loading ? "—" : c.value}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">{c.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                <c.icon className={`w-[18px] h-[18px] ${c.color}`} strokeWidth={1.75} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Left: list + filters */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search school name, location, id…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "active", "suspended"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                      statusFilter === s
                        ? "bg-[#272757] text-white border-[#272757]"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {s === "all" ? "All" : s === "active" ? "Active" : "Suspended"}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Showing {filtered.length} of {schools.length} schools · sort by{" "}
              <span className="font-medium text-gray-600">{sortKey}</span> ({sortDir})
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2" /> Loading schools…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">No schools match your filters</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500">
                      {(
                        [
                          ["name", "School"],
                          ["users", "Users"],
                          ["teachers", "Teachers"],
                          ["students", "Students"],
                          ["classes", "Classes"],
                          ["quizzes", "Quizzes"],
                        ] as [SortKey, string][]
                      ).map(([key, label]) => (
                        <th key={key} className="px-4 py-3 font-semibold">
                          <button
                            type="button"
                            onClick={() => toggleSort(key)}
                            className="inline-flex items-center gap-1 hover:text-[#272757]"
                          >
                            {label}
                            <ArrowUpDown className="w-3 h-3 opacity-50" />
                          </button>
                        </th>
                      ))}
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr
                        key={s.id}
                        className={`border-b border-gray-50 hover:bg-[#FAFAFF] cursor-pointer ${
                          selectedId === s.id ? "bg-[#EDE9FE]/40" : ""
                        }`}
                        onClick={() => openSchool(s)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0F0E47]">{s.name}</p>
                          <p className="text-[11px] text-gray-400">{s.location}</p>
                        </td>
                        <td className="px-4 py-3 font-medium tabular-nums">{s.users}</td>
                        <td className="px-4 py-3 tabular-nums text-gray-600">{s.teachers}</td>
                        <td className="px-4 py-3 tabular-nums text-gray-600">{s.students}</td>
                        <td className="px-4 py-3 tabular-nums text-gray-600">{s.classes}</td>
                        <td className="px-4 py-3 tabular-nums text-gray-600">{s.quizzes}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              title="Inspect"
                              onClick={() => openSchool(s)}
                              className="p-1.5 rounded-lg hover:bg-[#EDE9FE] text-[#272757]"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Edit"
                              onClick={() => {
                                setEditSchool(s);
                                setEditForm({
                                  name: s.name,
                                  location: s.location === "—" ? "" : s.location,
                                  status: s.status,
                                });
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              title={s.status === "active" ? "Suspend" : "Activate"}
                              onClick={() => setSuspendSchool(s)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top schools */}
          {topByUsers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-[#272757]" />
                <h3 className="text-sm font-semibold text-[#0F0E47]">Top schools by users</h3>
              </div>
              <div className="space-y-2">
                {topByUsers.map((s, i) => {
                  const max = Math.max(...topByUsers.map((x) => x.users), 1);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => openSchool(s)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-[#0F0E47]">
                          {i + 1}. {s.name}
                        </span>
                        <span className="text-gray-500">
                          {s.users} users · {s.classes} classes
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#272757] rounded-full"
                          style={{ width: `${Math.round((s.users / max) * 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-4 overflow-hidden min-h-[420px]">
            {!selected ? (
              <div className="p-10 text-center text-gray-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-gray-600">Select a school</p>
                <p className="text-xs mt-1">
                  Click any row to see teachers, students, classes, and school statistics.
                </p>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-gray-100 bg-[#FAFAFF]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-[#0F0E47]">{selected.name}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{selected.location}</p>
                    </div>
                    <StatusBadge status={selected.status} />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { l: "Teachers", v: selected.teachers },
                      { l: "Students", v: selected.students },
                      { l: "Classes", v: selected.classes },
                      { l: "Quizzes", v: selected.quizzes },
                    ].map((x) => (
                      <div key={x.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                        <p className="text-lg font-semibold text-[#0F0E47]">{x.v}</p>
                        <p className="text-[10px] text-gray-400">{x.l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex border-b border-gray-100 overflow-x-auto">
                  {(
                    [
                      ["overview", "Overview"],
                      ["teachers", `Teachers (${detailTeachers.length})`],
                      ["students", `Students (${detailStudents.length})`],
                      ["classes", `Classes (${detailClasses.length})`],
                    ] as [DetailTab, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setDetailTab(id)}
                      className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 ${
                        detailTab === id
                          ? "border-[#272757] text-[#272757]"
                          : "border-transparent text-gray-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-4 max-h-[560px] overflow-y-auto">
                  {detailLoading ? (
                    <div className="py-12 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading detail…
                    </div>
                  ) : detailTab === "overview" ? (
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3">
                          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active teachers
                          </div>
                          <p className="text-2xl font-semibold text-emerald-800">
                            {selected.activeTeachers ?? selected.teachers}
                          </p>
                        </div>
                        <div className="rounded-xl bg-sky-50 p-3">
                          <div className="flex items-center gap-2 text-sky-700 text-xs font-semibold mb-1">
                            <Users className="w-3.5 h-3.5" /> Active students
                          </div>
                          <p className="text-2xl font-semibold text-sky-800">
                            {selected.activeStudents ?? selected.students}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        This school has <strong>{selected.users}</strong> linked users and{" "}
                        <strong>{selected.classes}</strong> classes. Open the Teachers, Students, or
                        Classes tabs to search and inspect every record.
                      </p>
                      {selected.status === "suspended" && (
                        <div className="flex gap-2 items-start text-xs text-amber-800 bg-amber-50 rounded-xl p-3">
                          <PauseCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          School is suspended — new signups should not select it (only active schools
                          appear on signup).
                        </div>
                      )}
                    </div>
                  ) : detailTab === "classes" ? (
                    <div>
                      <input
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        placeholder="Search classes, subject, code, teacher…"
                        className="w-full mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      />
                      {filteredClasses.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">No classes</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredClasses.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-xl border border-gray-100 p-3 hover:border-[#272757]/20"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-[#0F0E47]">{c.name}</p>
                                  <p className="text-[11px] text-gray-500">
                                    {c.subject}
                                    {c.educationLevel ? ` · ${c.educationLevel}` : ""}
                                    {c.subLevel ? ` ${c.subLevel}` : ""}
                                  </p>
                                </div>
                                <span className="font-mono text-[10px] bg-[#EDE9FE] text-[#272757] px-2 py-0.5 rounded-full">
                                  {c.code}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-2">
                                Teacher: {c.teacherName} · {c.studentCount} students · {c.quizCount}{" "}
                                quizzes ({c.activeQuizzes} active)
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="w-full mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      />
                      {(detailTab === "teachers" ? filteredTeachers : filteredStudents).length ===
                      0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">No users</p>
                      ) : (
                        <div className="space-y-1.5">
                          {(detailTab === "teachers" ? filteredTeachers : filteredStudents).map(
                            (u) => (
                              <div
                                key={u.id}
                                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-gray-50"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-[#0F0E47] truncate">
                                    {u.name}
                                  </p>
                                  <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                                </div>
                                <StatusBadge status={u.status} />
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0F0E47]">Add school</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full mt-1 mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder="School name"
            />
            <label className="text-xs font-medium text-gray-600">Location</label>
            <input
              value={addForm.location}
              onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
              className="w-full mt-1 mb-4 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder="City, Country"
            />
            <button
              onClick={handleAdd}
              className="w-full bg-[#272757] text-white rounded-xl py-2.5 text-sm font-semibold"
            >
              Create school
            </button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editSchool && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0F0E47]">Edit school</h3>
              <button onClick={() => setEditSchool(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full mt-1 mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <label className="text-xs font-medium text-gray-600">Location</label>
            <input
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full mt-1 mb-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <label className="text-xs font-medium text-gray-600">Status</label>
            <select
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value as "active" | "suspended" })
              }
              className="w-full mt-1 mb-4 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={handleSaveEdit}
              className="w-full bg-[#272757] text-white rounded-xl py-2.5 text-sm font-semibold"
            >
              Save changes
            </button>
          </div>
        </div>
      )}

      {/* Suspend confirm */}
      {suspendSchool && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-[#0F0E47] mb-1">
              {suspendSchool.status === "active" ? "Suspend school?" : "Reactivate school?"}
            </h3>
            <p className="text-sm text-gray-500 mb-5">{suspendSchool.name}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSuspendSchool(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="flex-1 rounded-xl bg-[#272757] text-white py-2.5 text-sm font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
