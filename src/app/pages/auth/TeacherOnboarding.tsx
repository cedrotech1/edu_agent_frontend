import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { BookOpen, Users, Sparkles, CheckCircle, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const educationLevels = {
  nursery: { name: "Nursery", subLevels: ["Baby Class", "Middle Class", "Top Class"] },
  primary: { name: "Primary", subLevels: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  olevel: { name: "O-Level (Secondary)", subLevels: ["S1", "S2", "S3"] },
  alevel: { name: "A-Level (Secondary)", subLevels: ["S4", "S5", "S6"] },
  tvet: { name: "TVET", subLevels: ["Certificate", "Diploma"] },
  university: { name: "University", subLevels: ["Year 1", "Year 2", "Year 3", "Year 4"] },
} as const;

type EduKey = keyof typeof educationLevels;

function generateCode() {
  return "QMIND-" + Math.floor(1000 + Math.random() * 9000);
}

const steps = [
  { icon: Users, label: "Create your first class", color: "#272757" },
  { icon: BookOpen, label: "Create your first quiz", color: "#272757" },
  { icon: Sparkles, label: "Invite students", color: "#10B981" },
];

export function TeacherOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [educationLevel, setEducationLevel] = useState<EduKey | "">("");
  const [subLevel, setSubLevel] = useState("");
  const [classCode, setClassCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [schoolId, setSchoolId] = useState("");
  const [mySchools, setMySchools] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.schools.mine();
        const rows = ((res.data as any[]) || []).map((s: any) => ({ id: s.id, name: s.name }));
        setMySchools(rows);
        if (rows[0]) setSchoolId(String(rows[0].id));
      } catch {
        setMySchools([]);
      }
    })();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!className.trim()) e.className = "Class name is required";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!educationLevel) e.educationLevel = "Please select a grade level";
    if (!subLevel) e.subLevel = "Please select a sub-level";
    if (!schoolId) e.schoolId = "Please select a school";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!validateStep0()) return;
      setCreating(true);
      try {
        const res = await api.classes.create({
          name: className,
          subject,
          educationLevel,
          subLevel,
          schoolId: Number(schoolId),
        });
        const created: any = res.data || {};
        setClassCode(created.code || generateCode());
        toast.success("Class created!");
        setStep(1);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to create class");
      } finally {
        setCreating(false);
      }
      return;
    }
    if (step < 2) setStep(step + 1);
    else navigate("/teacher/quiz-builder");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <Logo variant="horizontal" size="md" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  i < step
                    ? "bg-[#10B981] text-white"
                    : i === step
                    ? "bg-[#272757] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-10 h-1 rounded-full ${i < step ? "bg-[#10B981]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          {step === 0 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#272757]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#272757]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create your first class</h2>
                <p className="text-gray-600">Set up a class and students can join with a code</p>
              </div>

              <div className="space-y-5">
                  <div>
                    <Label className="mb-2 block text-gray-700">School</Label>
                    <Select value={schoolId} onValueChange={(v) => { setSchoolId(v); setErrors((p) => ({ ...p, schoolId: "" })); }}>
                      <SelectTrigger className={`rounded-xl border-2 ${errors.schoolId ? "border-red-400" : "border-gray-200"}`}>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {mySchools.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.schoolId && <p className="text-red-500 text-sm mt-1">{errors.schoolId}</p>}
                    {mySchools.length === 0 && (
                      <p className="text-amber-600 text-sm mt-1">No schools on your account yet.</p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-2 block text-gray-700">Class Name</Label>
                  <Input
                    value={className}
                    onChange={(e) => { setClassName(e.target.value); setErrors((p) => ({ ...p, className: "" })); }}
                    className={`rounded-xl border-2 px-4 py-3 ${errors.className ? "border-red-400" : "border-gray-200"}`}
                    placeholder="e.g. S3 Biology 2026"
                  />
                  {errors.className && <p className="text-red-500 text-sm mt-1">{errors.className}</p>}
                </div>

                <div>
                  <Label className="mb-2 block text-gray-700">Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: "" })); }}
                    className={`rounded-xl border-2 px-4 py-3 ${errors.subject ? "border-red-400" : "border-gray-200"}`}
                    placeholder="e.g. Biology"
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <Label className="mb-2 block text-gray-700">Education Level</Label>
                  <Select value={educationLevel} onValueChange={(v) => { setEducationLevel(v as EduKey); setSubLevel(""); setErrors((p) => ({ ...p, educationLevel: "" })); }}>
                    <SelectTrigger className={`rounded-xl border-2 px-4 py-3 ${errors.educationLevel ? "border-red-400" : ""}`}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(educationLevels).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.educationLevel && <p className="text-red-500 text-sm mt-1">{errors.educationLevel}</p>}
                </div>

                {educationLevel && (
                  <div>
                    <Label className="mb-2 block text-gray-700">Sub-Level</Label>
                    <Select value={subLevel} onValueChange={(v) => { setSubLevel(v); setErrors((p) => ({ ...p, subLevel: "" })); }}>
                      <SelectTrigger className={`rounded-xl border-2 px-4 py-3 ${errors.subLevel ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Select sub-level" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels[educationLevel].subLevels.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subLevel && <p className="text-red-500 text-sm mt-1">{errors.subLevel}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#272757]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#272757]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create your first quiz</h2>
              <p className="text-gray-600 mb-8">
                Use our AI to generate a quiz for <span className="font-semibold text-[#272757]">{className}</span> in seconds
              </p>
              <div className="bg-[#272757]/5 rounded-2xl p-6 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <span className="text-gray-700">Pick a topic and grade level</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <span className="text-gray-700">AI generates questions instantly</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <span className="text-gray-700">Review, edit, then publish</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invite your students</h2>
              <p className="text-gray-600 mb-8">
                Share this join code with students in <span className="font-semibold text-[#272757]">{className}</span>
              </p>
              <div className="bg-[#272757]/5 border-2 border-[#272757]/20 rounded-2xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-3">Class join code</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-xl px-5 py-4 font-mono text-2xl font-bold text-[#272757] tracking-widest border-2 border-[#272757]/20">
                    {classCode}
                  </div>
                  <Button
                    onClick={copyCode}
                    className={`px-4 py-4 rounded-xl transition-all ${copied ? "bg-[#10B981] text-white" : "bg-[#272757] text-white hover:bg-[#505081]"}`}
                  >
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
                {copied && <p className="text-[#10B981] text-sm mt-3 font-medium">Copied to clipboard!</p>}
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-8 bg-[#272757] hover:bg-[#505081] text-white py-6 rounded-2xl text-lg font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            {step === 2 ? "Go to Quiz Builder ✨" : "Next"}
            <ArrowRight className="w-5 h-5" />
          </Button>

          <button
            onClick={() => navigate("/teacher")}
            className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </Card>
      </div>
    </div>
  );
}
