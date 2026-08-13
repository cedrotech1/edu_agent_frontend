import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Logo } from "../../components/Logo";
import { Sparkles, Send, ShieldCheck, GraduationCap, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const suggestedPrompts = [
  "How do teachers create quizzes with AI?",
  "Can students cheat with AI detection?",
  "How does AI grading work?",
  "What subjects can I create quizzes for?",
];

const features = [
  {
    icon: Sparkles,
    title: "AI Quiz Generator",
    desc: "Create quizzes instantly with AI for any subject and grade level",
  },
  {
    icon: GraduationCap,
    title: "Smart Grading",
    desc: "AI grades essays and short answers with personalized feedback",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheating",
    desc: "Detect AI-generated answers and maintain academic integrity",
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

  return (
    <div className="public-page">
      <nav className="public-nav">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5">
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
              <Button
                onClick={() => navigate("/signup")}
                className="public-btn-ghost h-11 px-5"
              >
                Sign Up
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="public-btn-primary h-11 px-5"
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        {chatHistory.length > 0 && (
          <div className="mb-10 space-y-5">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-[1.5rem] px-7 py-6 text-[1.05rem] leading-relaxed ${
                    chat.role === "user"
                      ? "bg-[#272757] text-white shadow-[0_8px_24px_rgba(39,39,87,0.2)]"
                      : "public-surface text-[#0F0E47]"
                  }`}
                >
                  {chat.role === "ai" && (
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="public-icon-well w-9 h-9 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-[#272757]">QuizMind AI</span>
                    </div>
                  )}
                  <p>{chat.message}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="public-surface max-w-2xl rounded-[1.5rem] px-7 py-6 text-[#0F0E47]">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="public-icon-well w-9 h-9 flex items-center justify-center">
                      {streamingText ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                    <span className="font-semibold text-[#272757]">QuizMind AI</span>
                  </div>
                  {streamingText ? (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {streamingText}
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#272757]/50 animate-pulse align-middle" />
                    </p>
                  ) : (
                    <p className="text-[#8686AC]">Connecting to AI…</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showCTA && (
          <div className="rounded-[1.5rem] px-7 py-7 mb-10 bg-[#272757] text-white shadow-[0_12px_32px_rgba(39,39,87,0.22)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <div>
                <h3 className="text-xl font-semibold mb-1.5">Ready to get started?</h3>
                <p className="text-white/80 text-base">
                  Join teachers and students using QuizMind AI
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-[#272757] hover:bg-[#F4F5F9] rounded-xl h-12 px-6 font-semibold shadow-none"
                >
                  Sign Up Free
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-white/10 hover:bg-white/15 text-white rounded-xl h-12 px-6 font-semibold shadow-none"
                >
                  Log In
                </Button>
              </div>
            </div>
          </div>
        )}

        {chatHistory.length === 0 && (
          <div className="text-center mb-12">
            <div className="mb-8 flex justify-center">
              <Logo variant="stacked" size="lg" />
            </div>
            <h1 className="text-4xl md:text-[2.75rem] font-bold text-[#0F0E47] mb-4 tracking-tight leading-tight">
              AI-Powered Quizzing Made Simple
            </h1>
            <p className="text-lg md:text-xl text-[#8686AC] max-w-2xl mx-auto leading-relaxed">
              Ask QuizMind AI anything about learning, quizzes, or how it works
            </p>
          </div>
        )}

        <div className="public-surface p-5 sm:p-6 mb-8">
          <div className="flex gap-3 items-center">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) handleSubmit(prompt);
              }}
              placeholder="Ask QuizMind AI anything about learning, quizzes, or how it works…"
              className="public-input flex-1 !py-5 !px-6 !text-lg !rounded-2xl h-auto shadow-none"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSubmit(prompt)}
              className="public-btn-primary h-14 w-14 shrink-0 !rounded-2xl p-0"
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {chatHistory.length === 0 && (
          <div>
            <p className="text-sm text-[#8686AC] mb-4 text-center font-medium">
              Try asking about
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {suggestedPrompts.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptChip(suggestion)}
                  disabled={isLoading}
                  className="public-chip p-5 text-left group disabled:opacity-60 disabled:pointer-events-none"
                >
                  <p className="text-[#505081] group-hover:text-[#272757] font-medium text-[0.95rem] leading-snug">
                    {suggestion}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.length === 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="public-surface-soft p-8 text-center">
                  <div className="public-icon-well w-14 h-14 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-[#0F0E47] text-lg mb-2">{f.title}</h3>
                  <p className="text-[0.95rem] text-[#8686AC] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
