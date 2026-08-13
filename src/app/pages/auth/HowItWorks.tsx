import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/Logo";
import { Sparkles, Users, BookOpen, CheckCircle, ArrowDown, Brain } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: BookOpen,
    color: "#272757",
    title: "Teacher Creates a Quiz",
    desc: "A teacher enters a topic, selects the Rwanda curriculum level (e.g. S3 Biology), and clicks Generate. Our AI produces a full quiz with MCQs, short answers, and true/false questions in seconds.",
    details: ["Pick any subject and grade level", "AI writes all questions and answer keys", "Review, edit, and set a deadline", "Assign to a class with one click"],
  },
  {
    step: 2,
    icon: Users,
    color: "#505081",
    title: "Student Takes the Quiz",
    desc: "Students join using a class code or quiz link. They complete the quiz within the time limit, answer all question types, and submit — from any device.",
    details: ["Join with a class or quiz code", "Live countdown timer with auto-submit", "Instant anti-cheating detection", "Works on phone, tablet, or laptop"],
  },
  {
    step: 3,
    icon: Sparkles,
    color: "#10B981",
    title: "AI Grades It — Instantly",
    desc: "Our AI reads every short-answer response, checks for key concepts, assigns a confidence score, and gives personalised feedback to each student. Teachers review flagged answers and override if needed.",
    details: ["MCQ and true/false graded instantly", "Short answers graded with AI confidence score", "Personalised feedback for every student", "Teachers override any AI grade"],
  },
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="public-page">
      <nav className="public-nav">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="rounded-xl focus:outline-none">
            <Logo variant="horizontal" size="md" />
          </button>
          <div className="flex gap-2 sm:gap-3">
            <Button onClick={() => navigate("/signup")} className="public-btn-ghost h-11 px-5">
              Sign Up
            </Button>
            <Button onClick={() => navigate("/login")} className="public-btn-primary h-11 px-5">
              Log In
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#272757]/8 text-[#272757] px-4 py-2.5 rounded-full text-sm font-semibold mb-7">
            <Brain className="w-4 h-4" />
            How QuizMind AI Works
          </div>
          <h1 className="text-4xl md:text-[2.75rem] font-bold text-[#0F0E47] mb-5 tracking-tight leading-tight">
            From idea to graded quiz<br />in under 2 minutes
          </h1>
          <p className="text-lg md:text-xl text-[#8686AC] max-w-2xl mx-auto leading-relaxed">
            QuizMind AI removes every manual step between a teacher's topic idea and students receiving personalised feedback.
          </p>
        </div>

        <div className="space-y-6 mb-16">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step}>
                <div className="public-surface p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row items-start gap-7 sm:gap-9">
                    <div className="shrink-0 flex sm:flex-col items-center gap-3 sm:gap-0 sm:text-center">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: `${s.color}14` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: s.color }} />
                      </div>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm sm:mt-3"
                        style={{ background: s.color }}
                      >
                        {s.step}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-[#0F0E47] mb-3">{s.title}</h2>
                      <p className="text-[#64748B] mb-6 leading-relaxed text-[1.05rem]">{s.desc}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {s.details.map((d) => (
                          <div key={d} className="flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: s.color }} />
                            <span className="text-[0.95rem] text-[#505081]">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {i < steps.length - 1 && (
                  <div className="flex justify-center py-3">
                    <ArrowDown className="w-5 h-5 text-[#C4C4D8]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-[1.5rem] px-8 py-12 sm:px-12 text-center bg-[#272757] text-white shadow-[0_16px_40px_rgba(39,39,87,0.25)]">
          <h2 className="text-3xl font-bold mb-4">Ready to try it?</h2>
          <p className="text-white/80 text-lg mb-9 max-w-xl mx-auto leading-relaxed">
            Create your first AI-generated quiz in under 60 seconds — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate("/signup")}
              className="bg-white text-[#272757] hover:bg-[#F4F5F9] h-12 py-6 px-8 rounded-xl text-base font-semibold shadow-none"
            >
              Sign Up Free
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-white/10 hover:bg-white/15 text-white h-12 py-6 px-8 rounded-xl text-base font-semibold shadow-none"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
