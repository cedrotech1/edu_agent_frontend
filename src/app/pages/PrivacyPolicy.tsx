import { useNavigate } from "react-router";
import { ArrowLeft, ArrowUp } from "lucide-react";

export function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-[#0F0E47] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[#8686AC] mb-8">Last updated: July 2026</p>
          <hr className="border-[#E2E8F0] mb-8" />

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">What Data We Collect</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              We collect information you provide directly (name, email address, institution name), usage and interaction
              data (quiz results, timestamps, session duration), device and browser information for security and
              performance purposes, and any communications you send to our support or feedback channels.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">How We Use Your Data</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              Your data is used to provide and continuously improve the QuizMind AI service, generate AI-powered quiz
              grading and personalized feedback, send important service notifications and account updates, and analyze
              aggregate learning outcomes to improve platform features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Data Storage and Security</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              All personal data is encrypted both at rest and in transit using industry-standard TLS and AES-256
              protocols. Our infrastructure is hosted on secure cloud servers with regular third-party security audits.
              We retain your data for as long as your account is active, or as required by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Student Data Protection</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              We comply with international student data protection standards including FERPA and GDPR where applicable.
              Student data is never used for advertising or profiling purposes, is never sold to third parties, and
              parents or guardians of minors may request access, correction, or deletion of their child's data at any
              time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Your Rights</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              You have the right to access, correct, export, or delete your personal data at any time through Settings
              → Privacy. To exercise rights under GDPR or other applicable laws, contact privacy@quizmind.ai. We will
              respond to all requests within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-[18px] font-bold text-[#0F0E47] mb-3">Contact Us</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed">
              For privacy-related questions, data requests, or to reach our Data Protection Officer, contact
              privacy@quizmind.ai or write to: QuizMind AI Data Protection, Kigali Innovation City, KG 7 Ave, Kigali,
              Rwanda.
            </p>
          </section>

          {/* Bottom row */}
          <div className="mt-10 flex justify-between items-center flex-wrap gap-4">
            <a
              href="/terms"
              className="text-[#272757] hover:text-[#505081] font-medium text-sm underline"
            >
              View our Terms of Service →
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
