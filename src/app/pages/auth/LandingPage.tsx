import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Logo } from "../../components/Logo";
import { Sparkles, Send } from "lucide-react";
import { api } from "@/lib/api";

const suggestedPrompts = [
  "How do teachers create quizzes with AI?",
  "Can students cheat with AI detection?",
  "How does AI grading work?",
  "What subjects can I create quizzes for?",
];

const mockResponses: Record<string, string> = {
  "How do teachers create quizzes with AI?":
    "Teachers can generate quizzes instantly using our AI! Simply enter your topic (like 'Photosynthesis' or 'Algebra'), choose the grade level, number of questions, and question type. Our AI creates a complete quiz with questions, multiple choice options, and answer keys in seconds. You can then review, edit, and customize each question before publishing to your students. ✨",
  "Can students cheat with AI detection?":
    "QuizMind AI has built-in anti-cheating features! We detect AI-generated answers by analyzing writing patterns, response time, and content originality. Teachers can enable 'Anti-AI Cheating Mode' when creating quizzes. For short-answer questions, our AI flags suspicious responses for manual review. We also track copy-paste attempts and time anomalies to ensure academic integrity. 🛡️",
  "How does AI grading work?":
    "Our AI grading is incredibly smart and fair! For multiple choice and true/false questions, grading is instant and automatic. For short-answer questions, our AI reads student responses, understands context, checks for key concepts, and assigns scores with confidence levels (90%+ = auto-graded, <80% = flagged for teacher review). Every graded answer includes personalized AI feedback to help students learn from mistakes. 🤖",
  "What subjects can I create quizzes for?":
    "You can create quizzes for ANY subject! Popular choices include Mathematics, Science, English, History, Geography, Physics, Chemistry, Biology, and more. Our AI adapts to your curriculum — from Nursery to University level. Just tell us the topic and grade level, and we'll generate relevant, curriculum-aligned questions. Works great for Rwanda's education system too! 📚",
};

export function LandingPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; message: string }>>(
    []
  );
  const [showCTA, setShowCTA] = useState(false);

  const handleSubmit = async (question: string) => {
    const userQuestion = question || prompt;
    if (!userQuestion.trim()) return;

    setChatHistory([...chatHistory, { role: "user", message: userQuestion }]);
    setPrompt("");

    const fallback =
      mockResponses[userQuestion] ||
      "That's a great question! QuizMind AI is an intelligent platform that helps teachers create, distribute, and grade quizzes using artificial intelligence. Students get instant feedback, and teachers save hours of work. Try signing up to explore all our features! 🚀";

    try {
      const res = await api.chat.public(userQuestion);
      const data: any = res.data || {};
      const response = data.reply || data.message || fallback;
      setChatHistory((prev) => [...prev, { role: "ai", message: response }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: "ai", message: fallback }]);
    }
    setShowCTA(true);
  };

  const handlePromptChip = (chip: string) => {
    setPrompt(chip);
    handleSubmit(chip);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9FF] via-[#E8E7FF] to-[#D9F5FF]">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo variant="horizontal" size="md" />
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/how-it-works")}
                className="text-gray-700 hover:text-[#6C63FF] rounded-xl"
              >
                How it works
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/signup")}
                className="border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/10 rounded-xl"
              >
                Sign Up
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl"
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="mb-8 space-y-4">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-2xl rounded-3xl p-6 shadow-md ${
                    chat.role === "user"
                      ? "bg-[#6C63FF] text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {chat.role === "ai" && (
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-[#6C63FF]" />
                      <span className="font-semibold text-[#6C63FF]">QuizMind AI</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{chat.message}</p>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* CTA Banner after AI response */}
        {showCTA && (
          <Card className="bg-gradient-to-r from-[#6C63FF] to-[#4FC3F7] text-white rounded-3xl p-6 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Ready to get started? 🚀
                </h3>
                <p className="text-white/90">
                  Join thousands of teachers and students using QuizMind AI
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-[#6C63FF] hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Sign Up Free
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-transparent border-2 border-white text-white hover:bg-white/20 rounded-xl"
                >
                  Log In
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main Prompt Interface */}
        {chatHistory.length === 0 && (
          <div className="text-center mb-12">
            <div className="mb-6">
              <Logo variant="stacked" size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              AI-Powered Quizzing Made Simple ✨
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ask QuizMind AI anything about learning, quizzes, or how it works
            </p>
          </div>
        )}

        {/* Input Box */}
        <Card className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
          <div className="flex gap-3">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(prompt);
              }}
              placeholder="Ask QuizMind AI anything about learning, quizzes, or how it works… ✨"
              className="flex-1 rounded-2xl border-2 border-gray-200 focus:border-[#6C63FF] px-6 py-6 text-lg"
            />
            <Button
              onClick={() => handleSubmit(prompt)}
              className="bg-[#6C63FF] hover:bg-[#5851E6] text-white px-6 rounded-2xl"
              disabled={!prompt.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Suggested Prompts */}
        {chatHistory.length === 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-3 text-center">
              Try asking about:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedPrompts.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptChip(suggestion)}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-[#6C63FF] rounded-2xl p-4 text-left transition-all shadow-sm hover:shadow-md group"
                >
                  <p className="text-gray-700 group-hover:text-[#6C63FF] font-medium">
                    {suggestion}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features Section (only show on first visit) */}
        {chatHistory.length === 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white rounded-2xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#6C63FF]" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Quiz Generator</h3>
              <p className="text-sm text-gray-600">
                Create quizzes instantly with AI for any subject and grade level
              </p>
            </Card>

            <Card className="bg-white rounded-2xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-[#4FC3F7]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#4FC3F7]" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Smart Grading</h3>
              <p className="text-sm text-gray-600">
                AI grades essays and short answers with personalized feedback
              </p>
            </Card>

            <Card className="bg-white rounded-2xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-[#43E6B5]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#43E6B5]" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Anti-Cheating</h3>
              <p className="text-sm text-gray-600">
                Detect AI-generated answers and maintain academic integrity
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
