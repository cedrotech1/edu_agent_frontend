import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  ArrowLeft, Search, UserPlus, X, Users, BookOpen, Mail,
  School, CheckCircle, Ban, Eye, GraduationCap, ShieldAlert,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError, initials } from "@/lib/api";

const PIE_COLORS = ["#272757", "#505081", "#10B981", "#F59E0B", "#EF4444"];

type UserStatus = "active" | "suspended" | "unverified";
interface User {
  id: number; name: string; initials: string; email: string;
  role: string; school: string; status: UserStatus; quizzes: number;
}

export function AdminUserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "student", school: "", password: "" });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.list({
        role: roleFilter === "all" ? undefined : roleFilter,
        search: search || undefined,
      });
      const rows = (res.data as any[]) || [];
      setUsers(
        (Array.isArray(rows) ? rows : []).map((u: any) => ({
          id: u.id,
          name: u.name || u.names || "",
          initials: u.initials || initials(u.name || u.names),
          email: u.email,
          role: u.role,
          school: u.school || "",
          status: (u.status === "unverified"
            ? "unverified"
            : u.status === "suspended" || (u.active === 0 && u.status !== "unverified" && !u.verificationToken)
              ? "suspended"
              : u.active === 0
                ? "unverified"
                : "active") as UserStatus,
          quizzes: u.quizzes ?? u.quizCount ?? 0,
        }))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = useMemo(() => {
    const teachers = users.filter((u) => u.role === "teacher").length;
    const students = users.filter((u) => u.role === "student").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const active = users.filter((u) => u.status === "active").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    const unverified = users.filter((u) => u.status === "unverified").length;
    const roleData = [
      { name: "Teachers", value: teachers },
      { name: "Students", value: students },
      { name: "Admins", value: admins },
    ].filter((r) => r.value > 0);
    const statusData = [
      { name: "Active", value: active },
      { name: "Unverified", value: unverified },
      { name: "Suspended", value: suspended },
    ].filter((r) => r.value > 0);
    const schoolMap: Record<string, number> = {};
    for (const u of users) {
      const school = u.school?.trim() || "Unassigned";
      schoolMap[school] = (schoolMap[school] || 0) + 1;
    }
    const schoolData = Object.entries(schoolMap)
      .map(([school, count]) => ({ school, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const activeRate = users.length ? Math.round((active / users.length) * 100) : 0;
    return {
      teachers,
      students,
      admins,
      active,
      suspended,
      unverified,
      roleData,
      statusData,
      schoolData,
      insight: users.length
        ? `${activeRate}% of accounts are active. Students are ${students}, teachers ${teachers}.`
        : "No users loaded yet.",
    };
  }, [users]);

  const toggleStatus = async (id: number) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    if (u.status === "unverified") return;
    const next: UserStatus = u.status === "active" ? "suspended" : "active";
    try {
      await api.users.setStatus(id, next);
      setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
      toast.success(next === "suspended" ? `${u.name} suspended` : `${u.name} reactivated`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    }
  };

  const validateAdd = () => {
    const e: Record<string, string> = {};
    if (!newUser.name.trim()) e.name = "Name is required";
    if (!newUser.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) e.email = "Invalid email";
    if (!newUser.school.trim()) e.school = "School is required";
    if (!newUser.password || newUser.password.length < 8 || !/[A-Za-z]/.test(newUser.password) || !/\d/.test(newUser.password)) {
      e.password = "Password must be at least 8 characters and include a letter and a number";
    }
    setAddErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateAdd()) return;
    try {
      await api.users.create(newUser);
      toast.success(`${newUser.name} added successfully`);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", role: "student", school: "", password: "" });
      setAddErrors({});
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add user");
    }
  };

  return (
    <AppShell role="admin" pageTitle="User Management">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" /> Admin Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500">{loading ? "Loading…" : `${users.length} total users`}</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl gap-2">
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Teachers", value: stats.teachers, icon: GraduationCap },
          { label: "Students", value: stats.students, icon: Users },
          { label: "Active", value: stats.active, icon: CheckCircle },
          { label: "Needs attention", value: stats.suspended + stats.unverified, icon: ShieldAlert },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center mb-2">
              <Icon className="w-4 h-4 text-[#272757]" />
            </div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#0F0E47]">{value}</p>
          </Card>
        ))}
      </div>

      <div className="bg-[#EDE9FE]/50 border border-gray-100 rounded-xl px-4 py-3 mb-5 text-sm text-[#272757]">
        <span className="font-semibold">Insight:</span> {stats.insight}
      </div>

      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-[#0F0E47] mb-3">Roles</p>
            <div className="flex justify-center">
              <PieChart width={260} height={200}>
                <Pie data={stats.roleData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                  {stats.roleData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </div>
          </Card>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-[#0F0E47] mb-3">Account status</p>
            <div className="flex justify-center">
              <PieChart width={260} height={200}>
                <Pie data={stats.statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                  {stats.statusData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </div>
          </Card>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-[#0F0E47] mb-3">Top schools</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.schoolData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="school" width={90} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#272757" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 rounded-xl border border-gray-200 py-3" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44 rounded-xl border border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="student">Students</SelectItem>
            </SelectContent>
          </Select>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">School</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        u.role === "teacher" ? "bg-[#272757]" : "bg-[#272757]"
                      }`}>{u.initials}</div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge className={`rounded-full capitalize ${
                      u.role === "teacher" ? "bg-[#272757]/10 text-[#272757]" : "bg-[#272757]/10 text-[#272757]"
                    }`}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{u.school}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={`rounded-full ${
                      u.status === "active"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : u.status === "unverified"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                    }`}>
                      {u.status === "active" ? "✓ Active" : u.status === "unverified" ? "Unverified" : "✕ Suspended"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setProfileUser(u)}
                        className="p-2 text-[#272757] hover:bg-[#272757]/10 rounded-lg transition-colors" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      {u.status !== "unverified" && (
                      <button onClick={() => toggleStatus(u.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          u.status === "active"
                            ? "text-red-500 hover:bg-red-50"
                            : "text-[#10B981] hover:bg-[#10B981]/10"
                        }`} title={u.status === "active" ? "Suspend" : "Activate"}>
                        {u.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Profile Side Panel */}
      {profileUser && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setProfileUser(null)} />
          <div className="w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
              <button onClick={() => setProfileUser(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 ${
                  profileUser.role === "teacher" ? "bg-[#272757]" : "bg-[#272757]"
                }`}>{profileUser.initials}</div>
                <h3 className="text-xl font-bold text-gray-800">{profileUser.name}</h3>
                <Badge className={`mt-2 rounded-full capitalize ${
                  profileUser.role === "teacher" ? "bg-[#272757]/10 text-[#272757]" : "bg-[#272757]/10 text-[#272757]"
                }`}>{profileUser.role}</Badge>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: profileUser.email },
                  { icon: School, label: "School", value: profileUser.school },
                  { icon: BookOpen, label: "Quizzes", value: String(profileUser.quizzes) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Icon className="w-5 h-5 text-[#272757]" />
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-medium text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${profileUser.status === "active" ? "bg-[#10B981]" : "bg-red-500"}`} />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium text-gray-800 capitalize">{profileUser.status}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => { toggleStatus(profileUser.id); setProfileUser(null); }}
                className={`w-full mt-6 rounded-xl py-3 ${
                  profileUser.status === "active"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-[#10B981] hover:bg-[#059669] text-white"
                }`}
              >
                {profileUser.status === "active" ? "Suspend Account" : "Activate Account"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {[
                { key: "name", label: "Full Name", placeholder: "e.g. Alice Uwase", type: "text" },
                { key: "email", label: "Email Address", placeholder: "alice@school.edu", type: "email" },
                { key: "school", label: "School / Institution", placeholder: "e.g. Kigali Primary", type: "text" },
                { key: "password", label: "Password", placeholder: "Letter and number, 8+ characters", type: "password" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <Label className="mb-2 block text-gray-700">{label}</Label>
                  <Input
                    type={type}
                    value={(newUser as any)[key]}
                    onChange={(e) => { setNewUser((p) => ({ ...p, [key]: e.target.value })); setAddErrors((p) => ({ ...p, [key]: "" })); }}
                    placeholder={placeholder}
                    className={`rounded-xl border-2 px-4 py-3 ${(addErrors as any)[key] ? "border-red-400" : "border-gray-200"}`}
                  />
                  {(addErrors as any)[key] && <p className="text-red-500 text-sm mt-1">{(addErrors as any)[key]}</p>}
                </div>
              ))}
              <div>
                <Label className="mb-2 block text-gray-700">Role</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                  <SelectTrigger className="rounded-xl border border-gray-200 px-4 py-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 rounded-xl py-3">Cancel</Button>
              <Button onClick={handleAddUser} className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl py-3">Add User</Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
