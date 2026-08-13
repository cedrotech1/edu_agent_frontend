import React, { useState } from "react";
import {
  Database,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

const MOCK_QUESTIONS = [
  { id: 1,  text: "What is the process by which plants make their own food using sunlight?", subject: "Biology",     grade: "S2", type: "MCQ",          difficulty: "Easy",   date: "Jun 10, 2026" },
  { id: 2,  text: "Explain the difference between mitosis and meiosis in your own words.",  subject: "Biology",     grade: "S3", type: "Short Answer",  difficulty: "Medium", date: "Jun 12, 2026" },
  { id: 3,  text: "The mitochondria is the powerhouse of the cell.",                         subject: "Biology",     grade: "S1", type: "True/False",    difficulty: "Easy",   date: "Jun 14, 2026" },
  { id: 4,  text: "Solve for x: 3x + 7 = 22",                                               subject: "Mathematics", grade: "S1", type: "MCQ",          difficulty: "Easy",   date: "Jun 15, 2026" },
  { id: 5,  text: "Describe the Pythagorean theorem and give a real-world example of how it is applied.", subject: "Mathematics", grade: "S2", type: "Short Answer", difficulty: "Medium", date: "Jun 16, 2026" },
  { id: 6,  text: "A quadrilateral with all sides equal and all angles 90° is called a square.", subject: "Mathematics", grade: "P6", type: "True/False", difficulty: "Easy", date: "Jun 17, 2026" },
  { id: 7,  text: "What literary device is used when a non-human object is given human characteristics?", subject: "English",  grade: "S3", type: "MCQ",         difficulty: "Medium", date: "Jun 18, 2026" },
  { id: 8,  text: "Analyze the use of symbolism in George Orwell's Animal Farm.",            subject: "English",     grade: "S4", type: "Short Answer",  difficulty: "Hard",   date: "Jun 19, 2026" },
  { id: 9,  text: "Newton's first law states that an object in motion stays in motion unless acted upon by an external force.", subject: "Physics", grade: "S3", type: "True/False", difficulty: "Easy", date: "Jun 20, 2026" },
  { id: 10, text: "Calculate the kinetic energy of a 5kg object moving at 10m/s.",          subject: "Physics",     grade: "S4", type: "MCQ",          difficulty: "Medium", date: "Jun 21, 2026" },
  { id: 11, text: "What is the atomic number of Carbon?",                                    subject: "Chemistry",   grade: "S2", type: "MCQ",          difficulty: "Easy",   date: "Jun 22, 2026" },
  { id: 12, text: "Explain the process of electrolysis and give two industrial applications.", subject: "Chemistry", grade: "S5", type: "Short Answer",  difficulty: "Hard",   date: "Jun 23, 2026" },
];

type Question = typeof MOCK_QUESTIONS[0];

function typeBadge(type: string) {
  if (type === "MCQ")          return "bg-[#DBEAFE] text-[#1E3A8A]";
  if (type === "Short Answer") return "bg-[#EDE9FE] text-[#272757]";
  if (type === "True/False")   return "bg-[#D1FAE5] text-[#065F46]";
  return "";
}

function diffBadge(diff: string) {
  if (diff === "Easy")   return "bg-[#D1FAE5] text-[#065F46]";
  if (diff === "Medium") return "bg-[#FEF3C7] text-[#92400E]";
  if (diff === "Hard")   return "bg-[#FEE2E2] text-[#991B1B]";
  return "";
}

const SUBJECTS = ["All Subjects", "Biology", "Mathematics", "English", "Physics", "Chemistry", "History"];
const GRADES   = ["All Grades", "Primary 1–3", "Primary 4–6", "S1", "S2", "S3", "S4", "S5", "S6"];
const TYPES    = ["All Types", "MCQ", "Short Answer", "True/False"];
const DIFFS    = ["All Difficulties", "Easy", "Medium", "Hard"];
const QUIZ_OPTIONS = ["Biology Quiz 3", "Physics Chapter 3", "Math Fundamentals"];

const BLANK_QUESTION: Omit<Question, "id"> = {
  text: "", subject: "Biology", grade: "S1", type: "MCQ", difficulty: "Easy", date: "",
};

function toast(msg: string) {
  const el = document.createElement("div");
  el.innerText = msg;
  el.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:9999;background:#272757;color:#fff;" +
    "padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.18);";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ---- Sub-components ----

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8686AC] hover:text-[#272757]">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold text-[#0F0E47] mb-2">Delete Question?</h2>
        <p className="text-sm text-[#64748B] mb-6">
          Delete this question from your bank? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#475569] hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626]">Delete</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function AddToQuizModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (quiz: string) => void }) {
  const [selected, setSelected] = useState(QUIZ_OPTIONS[0]);
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8686AC] hover:text-[#272757]">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold text-[#0F0E47] mb-4">Add to Quiz</h2>
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Select Quiz</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47] mb-6"
        >
          {QUIZ_OPTIONS.map((q) => <option key={q}>{q}</option>)}
        </select>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#475569] hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={() => onConfirm(selected)} className="px-4 py-2 rounded-lg bg-[#272757] text-white text-sm font-semibold hover:bg-[#1A1952]">Add to Quiz</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

interface QuestionFormModalProps {
  initial: Omit<Question, "id"> & { id?: number };
  title: string;
  saveLabel: string;
  onClose: () => void;
  onSave: (q: Omit<Question, "id"> & { id?: number }) => void;
}

function QuestionFormModal({ initial, title, saveLabel, onClose, onSave }: QuestionFormModalProps) {
  const [form, setForm] = useState({ ...initial });
  const [options, setOptions] = useState<[string, string, string, string]>(["", "", "", ""]);
  const [correctMCQ, setCorrectMCQ] = useState<"A" | "B" | "C" | "D">("A");
  const [modelAnswer, setModelAnswer] = useState("");
  const [correctTF, setCorrectTF] = useState<"True" | "False">("True");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    if (!form.text.trim()) return;
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    onSave({ ...form, date: form.date || dateStr });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8686AC] hover:text-[#272757]">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold text-[#0F0E47] mb-5">{title}</h2>

        <div className="space-y-4">
          {/* Question Type */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Question Type</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47]"
            >
              {["MCQ", "Short Answer", "True/False"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Question Text</label>
            <textarea
              rows={3}
              value={form.text}
              onChange={(e) => set("text", e.target.value)}
              placeholder="Enter your question here..."
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47] resize-none"
            />
          </div>

          {/* MCQ options */}
          {form.type === "MCQ" && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Answer Options</label>
              {(["A", "B", "C", "D"] as const).map((letter, i) => (
                <div key={letter} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-[#505081]">{letter}</span>
                  <input
                    type="text"
                    value={options[i]}
                    onChange={(e) => {
                      const next = [...options] as [string, string, string, string];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder={`Option ${letter}`}
                    className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47]"
                  />
                </div>
              ))}
              <div className="mt-2">
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Correct Answer</label>
                <select
                  value={correctMCQ}
                  onChange={(e) => setCorrectMCQ(e.target.value as "A" | "B" | "C" | "D")}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47]"
                >
                  {["A", "B", "C", "D"].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Short Answer */}
          {form.type === "Short Answer" && (
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Model Answer</label>
              <textarea
                rows={3}
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                placeholder="Enter the model answer..."
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47] resize-none"
              />
            </div>
          )}

          {/* True/False */}
          {form.type === "True/False" && (
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Correct Answer</label>
              <select
                value={correctTF}
                onChange={(e) => setCorrectTF(e.target.value as "True" | "False")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47]"
              >
                <option>True</option>
                <option>False</option>
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Subject</label>
            <select
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47]"
            >
              {["Biology", "Mathematics", "English", "Physics", "Chemistry", "History"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Grade Level</label>
            <select
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47]"
            >
              {["Primary 1–3", "Primary 4–6", "S1", "S2", "S3", "S4", "S5", "S6"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#0F0E47]"
            >
              {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#475569] hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[#272757] text-white text-sm font-semibold hover:bg-[#1A1952]">{saveLabel}</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ---- Main Page ----

export function QuestionBank() {
  const [questions, setQuestions]           = useState(MOCK_QUESTIONS);
  const [searchQ, setSearchQ]               = useState("");
  const [filterSubject, setFilterSubject]   = useState("All Subjects");
  const [filterGrade, setFilterGrade]       = useState("All Grades");
  const [filterType, setFilterType]         = useState("All Types");
  const [filterDiff, setFilterDiff]         = useState("All Difficulties");
  const [addToQuizModal, setAddToQuizModal] = useState<number | null>(null);
  const [editModal, setEditModal]           = useState<Question | null>(null);
  const [deleteModal, setDeleteModal]       = useState<number | null>(null);
  const [newQuestionOpen, setNewQuestionOpen] = useState(false);

  const hasFilters =
    searchQ !== "" ||
    filterSubject !== "All Subjects" ||
    filterGrade !== "All Grades" ||
    filterType !== "All Types" ||
    filterDiff !== "All Difficulties";

  const filtered = questions.filter((q) => {
    if (searchQ && !q.text.toLowerCase().includes(searchQ.toLowerCase()) && !q.subject.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (filterSubject !== "All Subjects"    && q.subject    !== filterSubject) return false;
    if (filterGrade   !== "All Grades"      && q.grade      !== filterGrade)   return false;
    if (filterType    !== "All Types"       && q.type       !== filterType)    return false;
    if (filterDiff    !== "All Difficulties" && q.difficulty !== filterDiff)   return false;
    return true;
  });

  function handleDelete() {
    if (deleteModal === null) return;
    setQuestions((prev) => prev.filter((q) => q.id !== deleteModal));
    setDeleteModal(null);
    toast("Question deleted");
  }

  function handleAddToQuiz(quiz: string) {
    setAddToQuizModal(null);
    toast(`Question added to quiz`);
    void quiz;
  }

  function handleNewQuestion(data: Omit<Question, "id"> & { id?: number }) {
    const newId = Math.max(...questions.map((q) => q.id), 0) + 1;
    setQuestions((prev) => [...prev, { ...data, id: newId } as Question]);
    setNewQuestionOpen(false);
    toast("Question saved to bank");
  }

  function handleEditQuestion(data: Omit<Question, "id"> & { id?: number }) {
    if (!editModal) return;
    setQuestions((prev) => prev.map((q) => q.id === editModal.id ? { ...data, id: editModal.id } as Question : q));
    setEditModal(null);
    toast("Question updated");
  }

  const selectStyle = "border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#272757]/20";

  return (
    <AppShell role="teacher" pending={true} pageTitle="Question Bank">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center flex-wrap gap-2">
          {/* Search */}
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8686AC]" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search questions by keyword or topic…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#0F0E47] bg-white placeholder-[#8686AC] focus:outline-none focus:ring-2 focus:ring-[#272757]/20"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex gap-2 ml-3 flex-wrap">
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className={selectStyle}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className={selectStyle}>
              {GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectStyle}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)} className={selectStyle}>
              {DIFFS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* New Question */}
        <button
          onClick={() => setNewQuestionOpen(true)}
          className="flex items-center gap-2 bg-[#272757] text-white rounded-xl px-4 py-[10px] text-sm font-bold hover:bg-[#1A1952] transition-colors"
        >
          <Plus size={16} />
          New Question
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-x-auto shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <Database size={56} className="text-[#8686AC] mb-4" />
            {hasFilters ? (
              <p className="text-[#64748B] text-sm font-medium">No questions match your filters.</p>
            ) : (
              <>
                <p className="text-[#0F0E47] font-semibold text-base mb-1">Your question bank is empty.</p>
                <p className="text-[#64748B] text-sm text-center max-w-xs">
                  Start saving questions when creating quizzes or add them manually here.
                </p>
              </>
            )}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Question Preview</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide w-28">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide w-24">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide w-28">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide w-24">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide w-28">Date Added</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, idx) => (
                <tr
                  key={q.id}
                  className={`border-b border-[#E2E8F0] hover:bg-[#EDE9FE] transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}
                  style={{ minHeight: 56 }}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#0F0E47] text-sm">
                      {q.text.length > 80 ? q.text.slice(0, 80) + "…" : q.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-28 text-[#64748B] text-sm">{q.subject}</td>
                  <td className="px-4 py-3 w-24 text-[#64748B] text-sm">{q.grade}</td>
                  <td className="px-4 py-3 w-28">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge(q.type)}`}>{q.type}</span>
                  </td>
                  <td className="px-4 py-3 w-24">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffBadge(q.difficulty)}`}>{q.difficulty}</span>
                  </td>
                  <td className="px-4 py-3 w-28 text-[#64748B] text-sm">{q.date}</td>
                  <td className="px-4 py-3 w-32">
                    <div className="flex items-center gap-2">
                      <button
                        title="Add to Quiz"
                        onClick={() => setAddToQuizModal(q.id)}
                        className="p-1.5 rounded-lg text-[#8686AC] hover:text-[#272757] hover:bg-[#EDE9FE] transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => setEditModal(q)}
                        className="p-1.5 rounded-lg text-[#8686AC] hover:text-[#272757] hover:bg-[#EDE9FE] transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setDeleteModal(q.id)}
                        className="p-1.5 rounded-lg text-[#8686AC] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {deleteModal !== null && (
        <DeleteModal onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />
      )}

      {addToQuizModal !== null && (
        <AddToQuizModal onClose={() => setAddToQuizModal(null)} onConfirm={handleAddToQuiz} />
      )}

      {newQuestionOpen && (
        <QuestionFormModal
          initial={{ ...BLANK_QUESTION }}
          title="New Question"
          saveLabel="Save to Bank"
          onClose={() => setNewQuestionOpen(false)}
          onSave={handleNewQuestion}
        />
      )}

      {editModal !== null && (
        <QuestionFormModal
          initial={{ ...editModal }}
          title="Edit Question"
          saveLabel="Save Changes"
          onClose={() => setEditModal(null)}
          onSave={handleEditQuestion}
        />
      )}
    </AppShell>
  );
}
