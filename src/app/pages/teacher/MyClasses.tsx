import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  Eye,
  Users,
  Copy,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { AppShell } from "../../components/AppShell";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const educationLevels = [
  { value: "nursery",    label: "Nursery",    sublevels: ["Baby Class", "Middle Class", "Top Class"] },
  { value: "primary",    label: "Primary",    sublevels: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { value: "o-level",    label: "O-Level",    sublevels: ["S1", "S2", "S3"] },
  { value: "a-level",    label: "A-Level",    sublevels: ["S4", "S5", "S6"] },
  { value: "tvet",       label: "TVET",       sublevels: ["Certificate", "Diploma"] },
  { value: "university", label: "University", sublevels: ["Year 1", "Year 2", "Year 3", "Year 4"] },
];

interface Cls {
  id: number; name: string; subject: string; level: string; sublevel: string;
  students: number; quizzes: number; code: string; status: "active" | "archived";
  schoolId?: number | null; schoolName?: string | null;
}

const blankForm = { name: "", subject: "", level: "", sublevel: "", schoolId: "" };

function mapClass(row: any): Cls {
  return {
    id: row.id,
    name: row.name || "Untitled class",
    subject: row.subject || "",
    level: row.level || row.educationLevel || "",
    sublevel: row.sublevel || row.subLevel || "",
    students: Number(row.students ?? row.studentCount ?? 0),
    quizzes: Number(row.quizzes ?? row.quizCount ?? 0),
    code: row.code || "—",
    status: row.status === "archived" ? "archived" : "active",
    schoolId: row.schoolId || row.school?.id || null,
    schoolName: row.schoolName || row.school?.name || null,
  };
}

export function MyClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Cls[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mySchools, setMySchools] = useState<Array<{ id: number; name: string }>>([]);
  const [schoolFilter, setSchoolFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, schoolsRes] = await Promise.all([
        api.classes.list(),
        api.schools.mine(),
      ]);
      const rows = (res.data as any[]) || [];
      setClasses(Array.isArray(rows) ? rows.map(mapClass) : []);
      setMySchools(((schoolsRes.data as any[]) || []).map((s: any) => ({ id: s.id, name: s.name })));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load classes");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const subjects = Array.from(new Set(classes.map((c) => c.subject).filter(Boolean)));

  const filtered = classes.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || c.subject === filterSubject;
    const matchLevel = filterLevel === "all" || c.level === filterLevel;
    const matchSchool =
      schoolFilter === "all" || String(c.schoolId || "") === schoolFilter;
    return matchSearch && matchSubject && matchLevel && matchSchool;
  });

  const openCreate = () => {
    setForm({
      ...blankForm,
      schoolId: mySchools[0] ? String(mySchools[0].id) : "",
    });
    setFormErrors({});
    setCreateOpen(true);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Class name is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.level) e.level = "Education level is required";
    if (!form.sublevel) e.sublevel = "Grade is required";
    if (!form.schoolId) e.schoolId = "Select a school";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      await api.classes.create({
        name: form.name.trim(),
        subject: form.subject.trim(),
        educationLevel: form.level,
        subLevel: form.sublevel,
        schoolId: Number(form.schoolId),
      });
      toast.success("Class created!", { description: `${form.name} is ready for students.` });
      setCreateOpen(false);
      setForm(blankForm);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create class");
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Join code copied!");
  };

  const activeSubLevels = educationLevels.find((l) => l.value === form.level)?.sublevels ?? [];

  return (
    <AppShell role="teacher" pageTitle="My Classes">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {loading ? "Loading…" : `${classes.length} classes total`}
        </p>
        <Button
          onClick={openCreate}
          className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-9 px-4 text-sm gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Class
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes…"
            className="pl-9 rounded-xl border border-gray-200 text-sm h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={schoolFilter} onValueChange={setSchoolFilter}>
            <SelectTrigger className="rounded-xl border border-gray-200 h-9 text-sm w-40">
              <SelectValue placeholder="School" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {mySchools.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="rounded-xl border border-gray-200 h-9 text-sm w-36">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="rounded-xl border border-gray-200 h-9 text-sm w-36">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {educationLevels.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {(search || filterSubject !== "all" || filterLevel !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilterSubject("all"); setFilterLevel("all"); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-50" />
          <p className="text-sm">Loading classes…</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-semibold text-[#0F0E47] mb-1">
            {search || filterSubject !== "all" || filterLevel !== "all"
              ? "No classes match your filters"
              : "No classes yet"}
          </h3>
          <p className="text-xs text-gray-500 mb-5">
            {search || filterSubject !== "all" || filterLevel !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first class and invite students with a join code."}
          </p>
          {!search && filterSubject === "all" && filterLevel === "all" && (
            <Button onClick={openCreate} className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl text-sm gap-2">
              <Plus className="w-4 h-4" /> Create First Class
            </Button>
          )}
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <Card
              key={cls.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#272757]/20 transition-all flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">{cls.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cls.subject}
                      {cls.schoolName ? ` · ${cls.schoolName}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => navigate(`/teacher/class/${cls.id}`)}
                      title="View"
                      className="p-1.5 text-gray-400 hover:text-[#272757] hover:bg-[#EDE9FE] rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-[#EDE9FE] text-[#272757] rounded-full text-[11px] px-2 py-0">
                    {educationLevels.find((l) => l.value === cls.level)?.label || cls.level}
                    {cls.sublevel ? ` · ${cls.sublevel}` : ""}
                  </Badge>
                  <Badge className={`rounded-full text-[11px] px-2 py-0 ${cls.status === "active" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-gray-100 text-gray-400"}`}>
                    {cls.status === "active" ? "Active" : "Archived"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-gray-800">{cls.students}</p>
                    <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" /> Students
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-gray-800">{cls.quizzes}</p>
                    <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                      <BookOpen className="w-3 h-3" /> Quizzes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#EDE9FE] rounded-lg px-3 py-2">
                  <span className="font-mono text-xs font-bold text-[#272757] flex-1 truncate">{cls.code}</span>
                  <button onClick={() => copyCode(cls.code)} className="text-[#272757] hover:text-[#505081] shrink-0">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="px-5 pb-4">
                <Button
                  onClick={() => navigate(`/teacher/class/${cls.id}`)}
                  variant="outline"
                  className="w-full border border-[#272757]/30 text-[#272757] hover:bg-[#EDE9FE] rounded-xl h-8 text-xs gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Class
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {createOpen && (
        <ClassFormModal
          title="Create New Class"
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          educationLevels={educationLevels}
          activeSubLevels={activeSubLevels}
          schools={mySchools}
          saving={creating}
          onSave={handleCreate}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </AppShell>
  );
}

function ClassFormModal({
  title, form, setForm, formErrors, educationLevels, activeSubLevels, schools, onSave, onClose, saving,
}: {
  title: string;
  form: typeof blankForm;
  setForm: (f: typeof blankForm) => void;
  formErrors: Record<string, string>;
  educationLevels: { value: string; label: string; sublevels: string[] }[];
  activeSubLevels: string[];
  schools: Array<{ id: number; name: string }>;
  onSave: () => void;
  onClose: () => void;
  saving?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-2xl p-7 shadow-2xl w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-5">{title}</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700 mb-1.5 block">School</Label>
            <Select
              value={form.schoolId}
              onValueChange={(v) => setForm({ ...form, schoolId: v })}
            >
              <SelectTrigger className={`rounded-xl ${formErrors.schoolId ? "border-red-400" : "border-gray-200"}`}>
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.schoolId && <p className="text-xs text-red-500 mt-1">{formErrors.schoolId}</p>}
            {schools.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Join a school from Settings, or ask an admin to add schools.</p>
            )}
          </div>
          <div>
            <Label className="text-sm text-gray-700 mb-1.5 block">Class Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`rounded-xl ${formErrors.name ? "border-red-400" : "border-gray-200"}`}
              placeholder="e.g. S3 Biology 2026"
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <Label className="text-sm text-gray-700 mb-1.5 block">Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={`rounded-xl ${formErrors.subject ? "border-red-400" : "border-gray-200"}`}
              placeholder="e.g. Biology"
            />
            {formErrors.subject && <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>}
          </div>
          <div>
            <Label className="text-sm text-gray-700 mb-1.5 block">Education Level</Label>
            <Select
              value={form.level}
              onValueChange={(v) => setForm({ ...form, level: v, sublevel: "" })}
            >
              <SelectTrigger className={`rounded-xl ${formErrors.level ? "border-red-400" : "border-gray-200"}`}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.level && <p className="text-xs text-red-500 mt-1">{formErrors.level}</p>}
          </div>
          <div>
            <Label className="text-sm text-gray-700 mb-1.5 block">Grade / Sub-level</Label>
            <Select
              value={form.sublevel}
              onValueChange={(v) => setForm({ ...form, sublevel: v })}
              disabled={!form.level}
            >
              <SelectTrigger className={`rounded-xl ${formErrors.sublevel ? "border-red-400" : "border-gray-200"}`}>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {activeSubLevels.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.sublevel && <p className="text-xs text-red-500 mt-1">{formErrors.sublevel}</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
