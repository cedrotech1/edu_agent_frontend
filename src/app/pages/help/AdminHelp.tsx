import { useState } from "react";
import {
  ChevronDown,
  Mail,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

const faqs = [
  {
    q: "How do I add or remove a teacher?",
    a: "Go to User Management from the sidebar. Click 'Add Teacher', fill in their name and email, and they will receive an email invitation to join the platform. To remove a teacher, find them in the table and click Suspend to restrict access, or Delete to permanently remove their account.",
  },
  {
    q: "How do I override an AI grade?",
    a: "Navigate to AI Grading Logs from the sidebar. Find the specific submission using the filters, then click the Override button. Enter the corrected grade and a reason for the override. The student's results page will update automatically.",
  },
  {
    q: "How do I suspend a school?",
    a: "Go to Schools from the sidebar. Find the school in the table and click the Suspend button in the Actions column. Confirm the action in the dialog that appears. All users belonging to that school will lose access until you reactivate it.",
  },
];

export function AdminHelp() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter((f) =>
    f.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="admin" pageTitle="Help & Support">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search help topics…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F0E47] placeholder-[#8686AC] focus:outline-none focus:border-[#272757] bg-white shadow-sm"
          />
        </div>

        {/* FAQ list */}
        {filtered.length === 0 && search !== "" ? (
          <p className="text-center text-[#64748B] text-sm py-10">
            No results for &quot;{search}&quot;
          </p>
        ) : (
          filtered.map((item, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl mb-3 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F8FAFC] transition-colors"
              >
                <span className="font-medium text-[#0F0E47] text-sm">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#8686AC] shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9]">
                  {item.a}
                </div>
              )}
            </div>
          ))
        )}

        {/* Contact card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mt-6 text-center">
          <Mail className="w-10 h-10 text-[#272757] mx-auto mb-3" style={{ strokeWidth: 1.75 }} />
          <p className="font-semibold text-[#0F0E47] mb-1">Still need help?</p>
          <p className="text-sm text-[#64748B] mb-3">Our support team is here for you.</p>
          <a
            href="mailto:support@quizmind.ai"
            className="text-[#272757] font-semibold hover:text-[#505081] underline text-sm"
          >
            support@quizmind.ai
          </a>
        </div>
      </div>
    </AppShell>
  );
}
