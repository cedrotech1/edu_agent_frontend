import { useNavigate } from "react-router";
import { ArrowLeft, ArrowUp } from "lucide-react";

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-[#E2E8F0] z-10">
        <div className="max-w-[720px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#272757] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">Q</span>
            </div>
            <span className="font-bold text-[#0F0E47]">QuizMind AI</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#272757] hover:text-[#505081] flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#0F0E47] mb-2">Terms of Service</h1>
          <p className="text-sm text-[#8686AC] mb-8">Last updated: July 2026</p>
          <hr className="border-[#E2E8F0] mb-8" />

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Introduction</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              Welcome to QuizMind AI, an AI-powered educational platform designed for teachers, students, and academic
              institutions. By accessing or using our platform, you agree to be bound by these Terms of Service and our
              Privacy Policy. Please read them carefully before using any feature.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">User Responsibilities</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              Users are responsible for maintaining the security of their login credentials, using the platform only for
              lawful educational purposes, not sharing account access with unauthorized individuals, and providing
              accurate information during registration and profile setup.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Teacher Obligations</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              Teachers who use QuizMind AI agree to use AI-generated content responsibly, review AI-graded responses
              before sharing results with students, maintain appropriate oversight of all quiz content, and comply with
              their institution's academic integrity and data protection policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Student Data Protection</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              QuizMind AI collects and processes student data solely to provide educational services. We do not sell
              student data to third parties. All data is stored securely with restricted access, and we comply with
              applicable international data protection regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Prohibited Use</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              You may not use the platform to distribute harmful, misleading, or inappropriate content; attempt to
              reverse-engineer our AI systems; create fraudulent accounts or impersonate others; or engage in any
              activity that disrupts the availability or integrity of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Termination</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              QuizMind AI reserves the right to suspend or terminate any account that violates these terms without prior
              notice. Users may also close their own account at any time from the Settings page. Upon termination, data
              will be retained only as required by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Contact Us</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              For questions about these Terms of Service, contact us at legal@quizmind.ai or write to: QuizMind AI,
              Kigali Innovation City, KG 7 Ave, Kigali, Rwanda.
            </p>
          </section>

          {/* Bottom row */}
          <div className="mt-10 flex justify-between items-center flex-wrap gap-4">
            <a
              href="/privacy"
              className="text-[#272757] hover:text-[#505081] font-medium text-sm underline"
            >
              View our Privacy Policy →
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1.5 text-sm border border-[#272757] text-[#272757] hover:bg-[#EDE9FE] rounded-lg px-3 py-1.5 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" /> Back to top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
