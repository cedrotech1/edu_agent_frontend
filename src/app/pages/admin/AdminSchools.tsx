import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Ban,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";

interface School {
  id: number;
  name: string;
  city: string;
  country: string;
  teachers: number;
  students: number;
  status: "active" | "suspended";
  contactEmail: string;
}

const initialSchools: School[] = [
  { id: 1, name: "Kigali Academy",       city: "Kigali",        country: "Rwanda",   teachers: 12, students: 234, status: "active",    contactEmail: "admin@kigaliacademy.rw" },
  { id: 2, name: "INES Ruhengeri",       city: "Musanze",       country: "Rwanda",   teachers: 8,  students: 156, status: "active",    contactEmail: "admin@ines.ac.rw" },
  { id: 3, name: "Nairobi Tech College", city: "Nairobi",       country: "Kenya",    teachers: 15, students: 312, status: "active",    contactEmail: "admin@nairobtech.ac.ke" },
  { id: 4, name: "Kampala University",   city: "Kampala",       country: "Uganda",   teachers: 6,  students: 98,  status: "suspended", contactEmail: "admin@kampala.ac.ug" },
  { id: 5, name: "Dar Academy",          city: "Dar es Salaam", country: "Tanzania", teachers: 10, students: 201, status: "active",    contactEmail: "admin@daracademy.ac.tz" },
];

const mockTeachers = [
  { name: "Ms. Johnson", subject: "Biology", quizzes: 12 },
  { name: "Mr. Smith",   subject: "Physics", quizzes: 8 },
  { name: "Mrs. Davis",  subject: "History", quizzes: 5 },
];

const mockStudents = [
  { name: "Alex M.",   cls: "S3 Biology",    avg: "88%" },
  { name: "Amina U.",  cls: "S3 Biology",    avg: "76%" },
  { name: "Peter H.",  cls: "S5 Chemistry",  avg: "72%" },
];

const COUNTRIES = ["All Countries", "Rwanda", "Kenya", "Uganda", "Tanzania"];

function StatusBadge({ status }: { status: "active" | "suspended" }) {
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

export function AdminSchools() {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All Countries");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", country: "Rwanda", city: "", contactEmail: "", adminName: "", adminEmail: "",
  });

  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [editForm, setEditForm] = useState({ name: "", country: "", city: "", contactEmail: "", status: "active" as "active" | "suspended" });

  const [suspendSchool, setSuspendSchool] = useState<School | null>(null);
  const [viewSchool, setViewSchool] = useState<School | null>(null);
  const [viewTab, setViewTab] = useState<"teachers" | "students">("teachers");

  const filtered = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchCountry = country === "All Countries" || s.country === country;
    return matchSearch && matchCountry;
  });

  function openEdit(s: School) {
    setEditSchool(s);
    setEditForm({ name: s.name, country: s.country, city: s.city, contactEmail: s.contactEmail, status: s.status });
  }

  function handleSaveEdit() {
    if (!editSchool) return;
    setSchools((prev) => prev.map((s) => s.id === editSchool.id ? { ...s, ...editForm } : s));
    toast.success("School updated.");
    setEditSchool(null);
  }

  function handleSuspend() {
    if (!suspendSchool) return;
    setSchools((prev) => prev.map((s) => s.id === suspendSchool.id ? { ...s, status: "suspended" } : s));
    toast.success("School suspended.");
    setSuspendSchool(null);
  }

  function handleCreate() {
    const newSchool: School = {
      id: Date.now(),
      name: addForm.name,
      city: addForm.city,
      country: addForm.country,
      teachers: 0,
      students: 0,
      status: "active",
      contactEmail: addForm.contactEmail,
    };
    setSchools((prev) => [...prev, newSchool]);
    toast.success("School created successfully.");
    setShowAddModal(false);
    setAddForm({ name: "", country: "Rwanda", city: "", contactEmail: "", adminName: "", adminEmail: "" });
  }

  const inputCls = "w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-sm focus:outline-none focus:border-[#272757] text-[#0F0E47]";

  return (
    <AppShell role="admin" pending={true} pageTitle="Schools">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-[#0F0E47]">Schools</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#272757] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#505081] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add School
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8686AC]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools…"
            className="w-full h-10 border border-[#E2E8F0] rounded-xl pl-9 pr-3 text-sm focus:outline-none focus:border-[#272757] text-[#0F0E47] bg-white"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-10 border border-[#E2E8F0] rounded-xl px-3 text-sm focus:outline-none focus:border-[#272757] text-[#0F0E47] bg-white"
        >
          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="w-12 h-12 text-[#CBD5E1] mb-3" />
            <p className="text-[#64748B] text-sm">No schools registered yet.</p>
          </div>
        ) : (
          <table className="qm-table w-full text-sm">
            <thead>
              <tr className="bg-[#F1F5F9] text-[#475569] text-left">
                <th className="px-5 py-3 font-semibold">School Name</th>
                <th className="px-5 py-3 font-semibold">City</th>
                <th className="px-5 py-3 font-semibold">Country</th>
                <th className="px-5 py-3 font-semibold">Teachers</th>
                <th className="px-5 py-3 font-semibold">Students</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-t border-[#E2E8F0] hover:bg-[#EDE9FE] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}
                  style={{ height: 56 }}
                >
                  <td className="px-5 py-3 font-semibold text-[#0F0E47]">{s.name}</td>
                  <td className="px-5 py-3 text-[#64748B]">{s.city}</td>
                  <td className="px-5 py-3 text-[#64748B]">{s.country}</td>
                  <td className="px-5 py-3 text-[#64748B]">{s.teachers}</td>
                  <td className="px-5 py-3 text-[#64748B]">{s.students}</td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex items-center gap-1 border border-[#E2E8F0] text-[#272757] rounded-lg px-2 py-1 text-xs hover:bg-[#EDE9FE] transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => setSuspendSchool(s)}
                        className="flex items-center gap-1 border border-red-200 text-red-500 rounded-lg px-2 py-1 text-xs hover:bg-red-50 transition-colors"
                      >
                        <Ban className="w-3 h-3" /> Suspend
                      </button>
                      <button
                        onClick={() => { setViewSchool(s); setViewTab("teachers"); }}
                        className="flex items-center gap-1 border border-[#E2E8F0] text-[#272757] rounded-lg px-2 py-1 text-xs hover:bg-[#EDE9FE] transition-colors"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0F0E47]/50 z-50 flex items-center justify-center">
          <div className="bg-white max-w-md w-full rounded-2xl p-7 border border-[#E2E8F0] shadow-xl mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0F0E47]">Add School</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#64748B] hover:text-[#0F0E47]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">School Name *</label>
                <input className={inputCls} value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Country *</label>
                <select className={inputCls} value={addForm.country} onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}>
                  {["Rwanda","Kenya","Uganda","Tanzania"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">City *</label>
                <input className={inputCls} value={addForm.city} onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Contact Email *</label>
                <input className={inputCls} type="email" value={addForm.contactEmail} onChange={(e) => setAddForm({ ...addForm, contactEmail: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Admin Name *</label>
                <input className={inputCls} value={addForm.adminName} onChange={(e) => setAddForm({ ...addForm, adminName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Admin Email *</label>
                <input className={inputCls} type="email" value={addForm.adminEmail} onChange={(e) => setAddForm({ ...addForm, adminEmail: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-[#272757] text-[#272757] bg-white hover:bg-[#EDE9FE] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#272757] text-white hover:bg-[#505081] transition-colors"
              >
                Create School
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSchool && (
        <div className="fixed inset-0 bg-[#0F0E47]/50 z-50 flex items-center justify-center">
          <div className="bg-white max-w-md w-full rounded-2xl p-7 border border-[#E2E8F0] shadow-xl mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0F0E47]">Edit School</h3>
              <button onClick={() => setEditSchool(null)} className="text-[#64748B] hover:text-[#0F0E47]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">School Name</label>
                <input className={inputCls} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Country</label>
                <select className={inputCls} value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}>
                  {["Rwanda","Kenya","Uganda","Tanzania"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">City</label>
                <input className={inputCls} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Contact Email</label>
                <input className={inputCls} type="email" value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="text-sm font-medium text-[#0F0E47]">Active status</label>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, status: editForm.status === "active" ? "suspended" : "active" })}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${editForm.status === "active" ? "bg-[#272757]" : "bg-gray-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${editForm.status === "active" ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setEditSchool(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-[#272757] text-[#272757] bg-white hover:bg-[#EDE9FE] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#272757] text-white hover:bg-[#505081] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendSchool && (
        <div className="fixed inset-0 bg-[#0F0E47]/50 z-50 flex items-center justify-center">
          <div className="bg-white max-w-sm w-full rounded-2xl p-7 border border-[#E2E8F0] shadow-xl mx-4 text-center">
            <AlertTriangle className="w-10 h-10 text-[#F59E0B] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0F0E47] mb-2">Suspend School?</h3>
            <p className="text-sm text-[#64748B] mb-6">
              Suspend <span className="font-semibold text-[#0F0E47]">{suspendSchool.name}</span>? All users will immediately lose access.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSuspendSchool(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-[#272757] text-[#272757] bg-white hover:bg-[#EDE9FE] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Side Panel */}
      {viewSchool && (
        <>
          <div
            className="fixed inset-0 bg-[#0F0E47]/40 z-40"
            onClick={() => setViewSchool(null)}
          />
          <div className="fixed right-0 top-0 h-screen w-[400px] bg-white border-l border-[#E2E8F0] shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <span className="font-bold text-[#0F0E47] text-base">{viewSchool.name}</span>
              <button onClick={() => setViewSchool(null)} className="text-[#64748B] hover:text-[#0F0E47]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info grid */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-[#E2E8F0]">
              {[
                { label: "City",     value: viewSchool.city },
                { label: "Country",  value: viewSchool.country },
                { label: "Contact",  value: viewSchool.contactEmail },
                { label: "Teachers", value: viewSchool.teachers },
                { label: "Students", value: viewSchool.students },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-[#8686AC] mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-[#0F0E47] break-all">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-[#8686AC] mb-0.5">Status</p>
                <StatusBadge status={viewSchool.status} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E2E8F0] px-5">
              {(["teachers","students"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`py-3 mr-5 text-sm capitalize transition-colors ${viewTab === tab ? "border-b-2 border-[#272757] text-[#272757] font-medium" : "text-[#64748B]"}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {viewTab === "teachers" ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F1F5F9] text-[#475569]">
                      <th className="px-3 py-2 text-left font-semibold text-xs">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs">Subject</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs">Quizzes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTeachers.map((t, i) => (
                      <tr key={i} className={`border-t border-[#E2E8F0] ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}>
                        <td className="px-3 py-2 text-[#0F0E47]">{t.name}</td>
                        <td className="px-3 py-2 text-[#64748B]">{t.subject}</td>
                        <td className="px-3 py-2 text-[#64748B]">{t.quizzes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F1F5F9] text-[#475569]">
                      <th className="px-3 py-2 text-left font-semibold text-xs">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs">Class</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudents.map((s, i) => (
                      <tr key={i} className={`border-t border-[#E2E8F0] ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}>
                        <td className="px-3 py-2 text-[#0F0E47]">{s.name}</td>
                        <td className="px-3 py-2 text-[#64748B]">{s.cls}</td>
                        <td className="px-3 py-2 text-[#64748B]">{s.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
