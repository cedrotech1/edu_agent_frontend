import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  GraduationCap,
  Plus,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { AppShell } from "../../components/AppShell";
import { toast } from "sonner";
import { api, ApiError, initials } from "@/lib/api";

interface StudentClass {
  id: number;
  name: string;
  subject: string;
  grade: string;
  teacher: string;
  teacherInitials: string;
  students: number;
}

const SUBJECT_COLORS: Record<string, string> = {
  Science: "#10B981",
  Biology: "#10B981",
  Chemistry: "#10B981",
  English: "#272757",
  Mathematics: "#272757",
  Math: "#272757",
  History: "#F59E0B",
};

export function StudentClasses() {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [joining, setJoining] = useState(false);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.classes.list();
      const rows = (res.data as any[]) || [];
      setClasses(
        Array.isArray(rows)
          ? rows.map((c: any) => ({
              id: c.id,
              name: c.name || "Class",
              subject: c.subject || "",
              grade: c.grade || c.subLevel || c.sublevel || "",
              teacher: c.teacherName || c.teacher || "Teacher",
              teacherInitials: initials(c.teacherName || c.teacher || "T"),
              students: Number(c.students ?? c.studentCount ?? 0),
            }))
          : [],
      );
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

  const handleJoin = async () => {
    if (!classCode.trim()) {
      setCodeError("Please enter a class code");
      return;
    }
    if (classCode.trim().length < 4) {
      setCodeError("Invalid code — check with your teacher");
      return;
    }
    setJoining(true);
    try {
      await api.classes.join(classCode.trim());
      toast.success("Joined class successfully!", {
        description: "You can now see quizzes assigned to this class.",
      });
      setShowJoinModal(false);
      setClassCode("");
      await load();
    } catch (err) {
      setCodeError(err instanceof ApiError ? err.message : "Failed to join class");
    } finally {
      setJoining(false);
    }
  };

  return (
    <AppShell role="student" pageTitle="My Classes">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {loading ? "Loading…" : `${classes.length} class${classes.length !== 1 ? "es" : ""} enrolled`}
        </p>
        <Button
          onClick={() => setShowJoinModal(true)}
          className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10 px-4 text-sm gap-2"
        >
          <Plus className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Join a New Class
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
          <p className="text-sm">Loading classes…</p>
        </div>
      ) : classes.length === 0 ? (
        <Card className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-sm">
          <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" style={{ strokeWidth: 1.75 }} />
          <p className="font-semibold text-gray-400 mb-1">You haven't joined any classes yet</p>
          <p className="text-sm text-gray-300">Ask your teacher for a class code</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map((cls) => {
            const subjectColor = SUBJECT_COLORS[cls.subject] ?? "#272757";
            return (
              <Card key={cls.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[#0F0E47] text-base mb-1">{cls.name}</h3>
                    <Badge
                      className="rounded-full text-xs px-2.5 py-0.5"
                      style={{ background: `${subjectColor}18`, color: subjectColor }}
                    >
                      {cls.subject}
                    </Badge>
                  </div>
                  {cls.grade && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                      {cls.grade}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: subjectColor }}
                  >
                    {cls.teacherInitials}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Teacher</p>
                    <p className="text-sm font-medium text-[#0F0E47]">{cls.teacher}</p>
                  </div>
                </div>

                <div className="bg-[#EDE9FE] rounded-xl px-3 py-3 text-center mb-5">
                  <BookOpen className="w-4 h-4 text-[#272757] mx-auto mb-1" style={{ strokeWidth: 1.75 }} />
                  <p className="text-lg font-bold text-[#272757]">{cls.students}</p>
                  <p className="text-[10px] text-gray-400">Classmates</p>
                </div>

                <Button
                  onClick={() => navigate(`/student/classes/${cls.id}`)}
                  variant="outline"
                  className="w-full border border-[#272757] text-[#272757] hover:bg-[#EDE9FE] rounded-xl h-10 text-sm gap-2"
                >
                  View Class <ChevronRight className="w-4 h-4" style={{ strokeWidth: 1.75 }} />
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {showJoinModal && (
        <div className="qm-modal-overlay">
          <div className="qm-modal">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-[#0F0E47]">Join a Class</h3>
                <p className="text-xs text-gray-400 mt-0.5">Enter the code your teacher gave you</p>
              </div>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setClassCode("");
                  setCodeError("");
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-400" style={{ strokeWidth: 1.75 }} />
              </button>
            </div>
            <div className="mb-5">
              <Label className="mb-2 block text-sm text-gray-700">Class Code</Label>
              <Input
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value.toUpperCase());
                  setCodeError("");
                }}
                placeholder="e.g. QMIND-1234"
                className={`qm-input text-center font-mono text-lg tracking-widest ${codeError ? "border-red-400" : ""}`}
                maxLength={20}
              />
              {codeError && <p className="text-red-500 text-xs mt-1">{codeError}</p>}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJoinModal(false);
                  setClassCode("");
                  setCodeError("");
                }}
                className="flex-1 border border-gray-200 rounded-xl h-11"
                disabled={joining}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={joining}
                className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-11 font-semibold"
              >
                {joining ? "Joining…" : "Join Class"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
