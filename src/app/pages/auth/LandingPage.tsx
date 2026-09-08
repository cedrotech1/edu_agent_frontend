import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Logo } from "../../components/Logo";
import {
  Sparkles,
  Send,
  ShieldCheck,
  GraduationCap,
  Loader2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import landingArt from "@/assets/landing.png";

const suggestedPrompts = [
  "How do teachers create quizzes with AI?",
  "How do class and quiz codes work?",
  "How does AI grading work?",
  "What can students do on QuizMind?",
];

const features = [
  {
    icon: Sparkles,
    title: "AI Quiz Generator",
    desc: "Turn a topic into MCQ, true/false, and short-answer quizzes in minutes.",
  },
  {
    icon: GraduationCap,
    title: "Smart Grading",
    desc: "Instant scores for objective items, with teacher review for flagged answers.",
  },
  {
    icon: BookOpen,
    title: "Classes & Codes",
    desc: "Enroll with QMIND class codes; share QZ codes for quizzes outside the class.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based Access",
    desc: "Teachers, students, and admins each get clear tools and boundaries.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; message: string }>>(
    []
  );
  const [showCTA, setShowCTA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length > 0 || streamingText) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [chatHistory, streamingText]);

  const handleSubmit = async (question: string) => {
    const userQuestion = question || prompt;
    if (!userQuestion.trim() || isLoading) return;

    setChatHistory((prev) => [...prev, { role: "user", message: userQuestion }]);
    setPrompt("");
    setIsLoading(true);
    setStreamingText("");

    try {
      const { reply } = await api.chat.publicStream(userQuestion, (chunk) => {
        setStreamingText((prev) => prev + chunk);
      });
      setChatHistory((prev) => [...prev, { role: "ai", message: reply }]);
      setStreamingText("");
      setShowCTA(true);
    } catch (err: any) {
      const message =
        err?.message || "The AI assistant could not respond right now. Please try again.";
      toast.error(message);
      setStreamingText("");
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          message:
            "Sorry — I couldn't reach the AI assistant just now. Please try again in a moment, or sign up to explore QuizMind AI directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChip = (chip: string) => {
    setPrompt(chip);
    handleSubmit(chip);
  };

  const hasChat = chatHistory.length > 0;

  return (
    <div className="public-page overflow-x-hidden">
      <nav className="public-nav">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <Logo variant="horizontal" size="md" />
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/how-it-works")}
                className="hidden sm:inline-flex text-[#505081] hover:text-[#272757] hover:bg-[#272757]/6 rounded-xl px-4 h-11"
              >
                How it works
              </Button>
              <Button onClick={() => navigate("/signup")} className="public-btn-ghost h-11 px-5">
                Sign Up
              </Button>
              <Button onClick={() => navigate("/login")} className="public-btn-primary h-11 px-5">
                Log In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero: copy + chat left, illustration right */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center min-h-[calc(100vh-7rem)] lg:min-h-[calc(100vh-6.5rem)]">
          {/* Left */}
          <div className="order-2 lg:order-1 flex flex-col justify-center">
            {!hasChat && (
              <div className="mb-8 landing-fade-up">
                <p className="text-sm font-semibold tracking-wide text-[#505081] mb-3 uppercase">
                  QuizMind AI
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#0F0E47] tracking-tight leading-[1.1] mb-4">
                  Learn smarter with AI by your side
                </h1>
                <p className="text-lg text-[#8686AC] max-w-lg leading-relaxed mb-7">
                  Teachers build quizzes in minutes. Students join classes, take assessments, and
                  get feedback — ask the assistant anything below.
                </p>
                <div className="flex flex-wrap gap-3 landing-fade-up landing-fade-up-delay-1">
                  <Button
                    onClick={() => navigate("/signup")}
                    className="public-btn-primary h-12 px-6 text-base gap-2"
                  >
                    Get started free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => navigate("/how-it-works")}
                    className="public-btn-ghost h-12 px-6 text-base"
                  >
                    See how it works
                  </Button>
                </div>
              </div>
            )}

            {hasChat && (
              <div className="mb-5 landing-fade-up">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F0E47] tracking-tight">
                  Ask QuizMind AI
                </h2>
                <p className="text-[#8686AC] mt-1">Streaming answers about the platform</p>
              </div>
            )}

            {/* Chat thread */}
            {hasChat && (
              <div className="mb-5 space-y-4 max-h-[42vh] overflow-y-auto pr-1 landing-fade-up">
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl px-5 py-4 text-[0.95rem] leading-relaxed ${
                        chat.role === "user"
                          ? "bg-[#272757] text-white shadow-[0_8px_24px_rgba(39,39,87,0.2)]"
                          : "public-surface text-[#0F0E47]"
                      }`}
                    >
                      {chat.role === "ai" && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="public-icon-well w-8 h-8 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-[#272757] text-sm">QuizMind AI</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{chat.message}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="public-surface max-w-[92%] rounded-2xl px-5 py-4 text-[#0F0E47]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="public-icon-well w-8 h-8 flex items-center justify-center">
                          {streamingText ? (
                            <Sparkles className="w-3.5 h-3.5" />
                          ) : (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          )}
                        </div>
                        <span className="font-semibold text-[#272757] text-sm">QuizMind AI</span>
                      </div>
                      {streamingText ? (
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {streamingText}
                          <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#272757]/50 animate-pulse align-middle" />
                        </p>
                      ) : (
                        <p className="text-[#8686AC] text-sm">Connecting to AI…</p>
                      )}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {showCTA && (
              <div className="rounded-2xl px-5 py-5 mb-5 bg-[#272757] text-white shadow-[0_12px_32px_rgba(39,39,87,0.22)] landing-fade-up">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-0.5">Ready to get started?</h3>
                    <p className="text-white/75 text-sm">Create a free account in under a minute.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => navigate("/signup")}
                      className="bg-white text-[#272757] hover:bg-[#F4F5F9] rounded-xl h-11 px-5 font-semibold shadow-none"
                    >
                      Sign Up
                    </Button>
                    <Button
                      onClick={() => navigate("/login")}
                      className="bg-white/10 hover:bg-white/15 text-white rounded-xl h-11 px-5 font-semibold shadow-none"
                    >
                      Log In
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Ask box */}
            <div className="public-surface p-4 sm:p-5 landing-fade-up landing-fade-up-delay-2">
              <div className="flex gap-3 items-center">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading) handleSubmit(prompt);
                  }}
                  placeholder="Ask about quizzes, classes, grading…"
                  className="public-input flex-1 !py-4 !px-5 !text-base !rounded-xl h-auto shadow-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSubmit(prompt)}
                  className="public-btn-primary h-12 w-12 shrink-0 !rounded-xl p-0"
                  disabled={!prompt.trim() || isLoading}
                  aria-label="Send question"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {!hasChat && (
              <div className="mt-5 landing-fade-up landing-fade-up-delay-3">
                <p className="text-xs font-medium text-[#8686AC] mb-3 uppercase tracking-wide">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handlePromptChip(suggestion)}
                      disabled={isLoading}
                      className="public-chip px-3.5 py-2.5 text-left text-sm text-[#505081] hover:text-[#272757] disabled:opacity-60 disabled:pointer-events-none max-w-full"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — illustration */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center landing-fade-up">
            <div
              className="absolute w-[78%] h-[78%] rounded-full bg-[#272757]/[0.06] blur-3xl landing-blob"
              aria-hidden
            />
            <div
              className="absolute -right-6 top-10 w-40 h-40 rounded-full bg-[#8686AC]/15 blur-2xl landing-blob"
              style={{ animationDelay: "1.5s" }}
              aria-hidden
            />
            <div className="relative w-full max-w-xl landing-float">
              <img
                src={landingArt}
                alt="Friendly AI tutor helping a student study"
                className="w-full h-auto select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(39,39,87,0.12)]"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features — below first viewport */}
      {!hasChat && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="public-surface-soft p-6 sm:p-7 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="public-icon-well w-12 h-12 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#0F0E47] text-base mb-1.5">{f.title}</h3>
                  <p className="text-sm text-[#8686AC] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
