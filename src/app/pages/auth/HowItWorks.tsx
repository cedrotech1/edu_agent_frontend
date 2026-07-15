import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Logo } from "../../components/Logo";
import { Sparkles, Users, BookOpen, CheckCircle, ArrowRight, Brain } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: BookOpen,
    color: "#6C63FF",
    bg: "#6C63FF",
    title: "Teacher Creates a Quiz",
    desc: "A teacher enters a topic, selects the Rwanda curriculum level (e.g. S3 Biology), and clicks Generate. Our AI produces a full quiz with MCQs, short answers, and true/false questions in seconds.",
    details: ["Pick any subject and grade level", "AI writes all questions and answer keys", "Review, edit, and set a deadline", "Assign to a class with one click"],
  },
  {
    step: 2,
    icon: Users,
    color: "#4FC3F7",
    bg: "#4FC3F7",
    title: "Student Takes the Quiz",
    desc: "Students join using a class code or quiz link. They complete the quiz within the time limit, answer all question types, and submit — from any device.",
    details: ["Join with a class or quiz code", "Live countdown timer with auto-submit", "Instant anti-cheating detection", "Works on phone, tablet, or laptop"],
  },
  {
    step: 3,
    icon: Sparkles,
    color: "#43E6B5",
    bg: "#43E6B5",
    title: "AI Grades It — Instantly",
    desc: "Our AI reads every short-answer response, checks for key concepts, assigns a confidence score, and gives personalised feedback to each student. Teachers review flagged answers and override if needed.",
    details: ["MCQ and true/false graded instantly", "Short answers graded with AI confidence score", "Personalised feedback for every student", "Teachers override any AI grade"],
  },
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9FF] via-[#E8E7FF] to-[#D9F5FF]">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")}><Logo variant="horizontal" size="md" /></button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/signup")}
              className="border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/10 rounded-xl">Sign Up</Button>
            <Button onClick={() => navigate("/login")}
              className="bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl">Log In</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#6C63FF]/10 text-[#6C63FF] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Brain className="w-4 h-4" />
            How QuizMind AI Works
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-5">
            From idea to graded quiz<br />in under 2 minutes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            QuizMind AI removes every manual step between a teacher's topic idea and students receiving personalised feedback.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={s.step} className="bg-white rounded-3xl p-8 shadow-lg overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl"
                  style={{ background: s.color }}
                />
                <div className="flex items-start gap-8 pl-4">
                  {/* Step number + icon */}
                  <div className="shrink-0 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: `${s.color}18` }}>
                      <Icon className="w-8 h-8" style={{ color: s.color }} />
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto"
                      style={{ background: s.color }}>
                      {s.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{s.title}</h2>
                    <p className="text-gray-600 mb-5 leading-relaxed">{s.desc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {s.details.map((d) => (
                        <div key={d} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 shrink-0" style={{ color: s.color }} />
                          <span className="text-sm text-gray-700">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="flex justify-center mt-6">
                    <ArrowRight className="w-6 h-6 text-gray-300 rotate-90" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-[#6C63FF] to-[#4FC3F7] rounded-3xl p-10 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to try it?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Create your first AI-generated quiz in under 60 seconds — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/signup")}
              className="bg-white text-[#6C63FF] hover:bg-gray-100 py-4 px-8 rounded-2xl text-lg font-semibold shadow-lg">
              Sign Up Free 🚀
            </Button>
            <Button onClick={() => navigate("/login")}
              className="bg-transparent border-2 border-white text-white hover:bg-white/20 py-4 px-8 rounded-2xl text-lg font-semibold">
              Log In
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
