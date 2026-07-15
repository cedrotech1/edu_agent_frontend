import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Logo } from "../../components/Logo";
import { Users, BookOpen, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const steps = [
  { icon: Users, label: "Join a class", color: "#4FC3F7" },
  { icon: BookOpen, label: "Take your first quiz", color: "#43E6B5" },
];

export function StudentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [classCode, setClassCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (!classCode.trim()) {
      setCodeError("Please enter a class code");
      return;
    }
    if (classCode.trim().length < 4) {
      setCodeError("That code looks too short — check with your teacher");
      return;
    }
    setCodeError("");
    try {
      await api.classes.join(classCode.trim().toUpperCase());
      setJoined(true);
      toast.success("Joined class!");
    } catch (err) {
      setCodeError(err instanceof ApiError ? err.message : "Could not join class");
    }
  };

  const handleNext = () => {
    if (step === 0) {
      if (!joined) {
        handleJoin();
        return;
      }
      toast.success("You've joined the class! Welcome 🎉");
      navigate("/student");
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9FF] via-[#D9F5FF] to-[#E8FFFE] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <Logo variant="horizontal" size="md" color="#4FC3F7" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  i < step
                    ? "bg-[#43E6B5] text-white"
                    : i === step
                    ? "bg-[#4FC3F7] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-1 rounded-full ${i < step ? "bg-[#43E6B5]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white rounded-3xl shadow-2xl p-8">
          {step === 0 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#4FC3F7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#4FC3F7]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Join your class</h2>
                <p className="text-gray-600">Enter the code your teacher shared with you</p>
              </div>

              {!joined ? (
                <div className="space-y-3">
                  <Input
                    value={classCode}
                    onChange={(e) => { setClassCode(e.target.value.toUpperCase()); setCodeError(""); }}
                    className={`w-full rounded-xl border-2 px-4 py-4 font-mono text-center text-xl tracking-widest ${
                      codeError ? "border-red-400" : "border-gray-200 focus:border-[#4FC3F7]"
                    }`}
                    placeholder="QMIND-1234"
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  />
                  {codeError && <p className="text-red-500 text-sm text-center">{codeError}</p>}
                </div>
              ) : (
                <div className="bg-[#43E6B5]/10 border-2 border-[#43E6B5]/30 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-[#43E6B5] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">You're in!</h3>
                  <p className="text-gray-600">
                    Joined class with code <span className="font-mono font-bold text-[#6C63FF]">{classCode}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#43E6B5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#43E6B5]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">You're all set! 🎉</h2>
              <p className="text-gray-600 mb-8">
                Head to your dashboard to see quizzes assigned to you
              </p>
              <div className="bg-[#4FC3F7]/5 rounded-2xl p-6 text-left space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#43E6B5]" />
                  <span className="text-gray-700">See upcoming quizzes with deadlines</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#43E6B5]" />
                  <span className="text-gray-700">Get AI-powered feedback on your answers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#43E6B5]" />
                  <span className="text-gray-700">Track your scores and improvement over time</span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-8 bg-[#4FC3F7] hover:bg-[#29B5E8] text-white py-6 rounded-2xl text-lg font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            {step === 1 ? "Go to Dashboard" : joined ? "Go to Dashboard" : "Join Class 🚀"}
            <ArrowRight className="w-5 h-5" />
          </Button>

          {step === 0 && !joined && (
            <button
              onClick={() => navigate("/student")}
              className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now — I'll join later
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
