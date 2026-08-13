import {
  LayoutDashboard, Users, BookOpen, Bell, Settings, Flag,
  Search, CheckCircle2, AlertTriangle, Info, XCircle,
  Home, Sparkles, GraduationCap, ChevronRight, Paintbrush,
} from "lucide-react";

// Standalone developer reference — no DashboardLayout

const ECLIPSE_COLORS = [
  { name: "Deep Navy",        hex: "#0F0E47", role: "Headings / Sidebar Background" },
  { name: "Primary Blue",     hex: "#272757", role: "Primary Button / Active Nav" },
  { name: "Hover Blue",       hex: "#1A1952", role: "Button Hover / Active Press" },
  { name: "Mid Blue",         hex: "#505081", role: "Secondary Color / Bar Charts" },
  { name: "Muted Lavender",   hex: "#8686AC", role: "Muted Labels / Inactive Nav" },
  { name: "Soft Violet",      hex: "#EDE9FE", role: "Unread Background / Chip Fill" },
  { name: "Page Background",  hex: "#F8FAFC", role: "App Background / Canvas" },
  { name: "Surface White",    hex: "#FFFFFF", role: "Cards / Panels" },
  { name: "Border",           hex: "#E2E8F0", role: "Dividers / Input Borders" },
  { name: "Subtext",          hex: "#64748B", role: "Secondary Text / Captions" },
];

const SEMANTIC_COLORS = [
  { name: "Success", bg: "#D1FAE5", text: "#065F46", label: "Active, Passing, Confirmed" },
  { name: "Warning", bg: "#FEF3C7", text: "#92400E", label: "Caution, Pending, Flagged" },
  { name: "Danger",  bg: "#FEE2E2", text: "#991B1B", label: "Error, Delete, Closed" },
  { name: "Info",    bg: "#DBEAFE", text: "#1E3A8A", label: "Informational, Notice" },
];

const TYPE_STYLES = [
  { name: "H1 Display",    sample: "Assessment AI",      font: "Poppins", size: "36px", weight: "800", lh: "1.2" },
  { name: "H2 Heading",    sample: "Class Dashboard",    font: "Poppins", size: "28px", weight: "700", lh: "1.3" },
  { name: "H3 Subheading", sample: "Recent Activity",    font: "Poppins", size: "20px", weight: "600", lh: "1.4" },
  { name: "Body Large",    sample: "Create and deliver quizzes with confidence.", font: "Inter", size: "16px", weight: "400", lh: "1.6" },
  { name: "Body Default",  sample: "QuizMind AI uses machine learning to grade short answers accurately.", font: "Inter", size: "14px", weight: "400", lh: "1.6" },
  { name: "Caption",       sample: "Last updated 2 hours ago",  font: "Inter", size: "12px", weight: "400", lh: "1.5" },
  { name: "Label",         sample: "QUIZ TITLE",               font: "Inter", size: "11px", weight: "600", lh: "1.4" },
  { name: "Link",          sample: "View all results →",        font: "Inter", size: "14px", weight: "500", lh: "1.6" },
];

const BADGE_VARIANTS = [
  { label: "Active",  bg: "#D1FAE5", text: "#065F46" },
  { label: "Draft",   bg: "#EDE9FE", text: "#272757" },
  { label: "Closed",  bg: "#F1F5F9", text: "#64748B" },
  { label: "Warning", bg: "#FEF3C7", text: "#92400E" },
  { label: "Danger",  bg: "#FEE2E2", text: "#991B1B" },
  { label: "Info",    bg: "#DBEAFE", text: "#1E3A8A" },
];

const SPACING = [4, 8, 12, 16, 24, 32, 48];

const ICONS = [
  { icon: LayoutDashboard, name: "LayoutDashboard" },
  { icon: Users,           name: "Users" },
  { icon: BookOpen,        name: "BookOpen" },
  { icon: Bell,            name: "Bell" },
  { icon: Settings,        name: "Settings" },
  { icon: Flag,            name: "Flag" },
  { icon: Search,          name: "Search" },
  { icon: CheckCircle2,    name: "CheckCircle2" },
  { icon: GraduationCap,   name: "GraduationCap" },
  { icon: Paintbrush,      name: "Paintbrush" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-[#0F0E47]">{children}</h2>
      <div className="mt-2 h-0.5 w-12 bg-[#272757] rounded-full" />
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="mb-14">{children}</section>;
}

export function StyleGuide() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F0E47] text-white px-12 py-10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">QuizMind AI</p>
          <h1 className="text-4xl font-extrabold mb-1">Design System</h1>
          <p className="text-white/60 text-sm">Blue Eclipse Palette · v1.0 · Developer Reference — not part of app navigation</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-12 py-12">

        {/* ── COLORS ── */}
        <Section>
          <SectionHeading>Colors</SectionHeading>

          <p className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-3">Blue Eclipse Palette</p>
          <div className="grid grid-cols-5 gap-4 mb-8">
            {ECLIPSE_COLORS.map(c => (
              <div key={c.hex} className="rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                <div className="h-16 border-b border-[#E2E8F0]" style={{ background: c.hex }} />
                <div className="bg-white p-3">
                  <p className="text-xs font-bold text-[#0F0E47] mb-0.5">{c.name}</p>
                  <p className="text-[10px] font-mono text-[#64748B] mb-1">{c.hex}</p>
                  <p className="text-[10px] text-[#94A3B8] leading-tight">{c.role}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-3">Semantic Colors</p>
          <div className="grid grid-cols-4 gap-4">
            {SEMANTIC_COLORS.map(s => (
              <div key={s.name} className="rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                <div className="h-12 flex items-center justify-center border-b border-[#E2E8F0]" style={{ background: s.bg }}>
                  <span className="text-sm font-bold" style={{ color: s.text }}>{s.name}</span>
                </div>
                <div className="bg-white p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-mono text-[#64748B]">bg: {s.bg}</span>
                    <span className="text-[9px] font-mono text-[#64748B]">text: {s.text}</span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TYPOGRAPHY ── */}
        <Section>
          <SectionHeading>Typography</SectionHeading>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            {TYPE_STYLES.map((ts, i) => (
              <div key={ts.name} className={`flex items-start gap-6 px-6 py-5 ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                <div className="w-32 flex-shrink-0 pt-1">
                  <p className="text-[11px] font-bold text-[#272757]">{ts.name}</p>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                    {ts.font} · {ts.size} · {ts.weight === "400" ? "Regular" : ts.weight === "500" ? "Medium" : ts.weight === "600" ? "SemiBold" : ts.weight === "700" ? "Bold" : "ExtraBold"}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] font-mono">LH {ts.lh}</p>
                </div>
                <p
                  className={`flex-1 ${ts.name === "Link" ? "text-[#272757] underline underline-offset-2" : "text-[#0F0E47]"}`}
                  style={{ fontFamily: ts.font, fontSize: ts.size, fontWeight: Number(ts.weight), lineHeight: ts.lh }}
                >
                  {ts.sample}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── BUTTONS ── */}
        <Section>
          <SectionHeading>Buttons</SectionHeading>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-center gap-2">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#272757] hover:bg-[#1A1952] transition-colors">Primary</button>
                <p className="text-[10px] text-[#94A3B8]">Primary Filled</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 border-[#272757] text-[#272757] hover:bg-[#EDE9FE] transition-colors">Secondary</button>
                <p className="text-[10px] text-[#94A3B8]">Secondary Outlined</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#EF4444] hover:bg-red-600 transition-colors">Danger</button>
                <p className="text-[10px] text-[#94A3B8]">Danger Red</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#272757] hover:bg-[#EDE9FE] transition-colors">Ghost</button>
                <p className="text-[10px] text-[#94A3B8]">Ghost Text Only</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button disabled className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed">Disabled</button>
                <p className="text-[10px] text-[#94A3B8]">Disabled</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#272757] hover:bg-[#1A1952] transition-colors">
                  <Sparkles className="w-4 h-4" /> With Icon
                </button>
                <p className="text-[10px] text-[#94A3B8]">Icon + Label</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#F1F5F9] flex flex-wrap gap-6">
              {[
                { swatch: "#272757", label: "Default: #272757" },
                { swatch: "#1A1952", label: "Hover: #1A1952" },
                { swatch: "#EDE9FE", label: "Ghost Hover: #EDE9FE", border: true },
                { swatch: "#E2E8F0", label: "Disabled: #E2E8F0" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-xs text-[#475569]">
                  <div className="w-4 h-4 rounded" style={{ background: s.swatch, border: s.border ? "1px solid #E2E8F0" : undefined }} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── INPUTS ── */}
        <Section>
          <SectionHeading>Input Fields</SectionHeading>
          <div className="grid grid-cols-5 gap-5">
            <div>
              <p className="text-[11px] font-bold text-[#475569] mb-2">Default</p>
              <input type="text" placeholder="Enter value…" readOnly className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none" />
              <p className="text-[10px] text-[#94A3B8] mt-1.5">Border #E2E8F0</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#475569] mb-2">Focused</p>
              <div className="w-full px-3 py-2 text-sm border-2 border-[#272757] rounded-lg bg-white ring-2 ring-[#272757]/20 text-[#0F0E47]">Quiz title…</div>
              <p className="text-[10px] text-[#94A3B8] mt-1.5">Border #272757 + ring</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#475569] mb-2">Error</p>
              <input type="text" defaultValue="bad@" readOnly className="w-full px-3 py-2 text-sm border-2 border-[#EF4444] rounded-lg bg-white focus:outline-none" />
              <p className="text-xs text-[#EF4444] flex items-center gap-1 mt-1"><XCircle className="w-3 h-3" /> Invalid email</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#475569] mb-2">Success</p>
              <div className="relative">
                <input type="text" defaultValue="teacher@school.rw" readOnly className="w-full px-3 py-2 text-sm border-2 border-[#10B981] rounded-lg bg-white focus:outline-none pr-8" />
                <CheckCircle2 className="w-4 h-4 text-[#10B981] absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1.5">Border #10B981</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#475569] mb-2">Disabled</p>
              <input type="text" defaultValue="Read only" disabled className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed" />
              <p className="text-[10px] text-[#94A3B8] mt-1.5">bg #F1F5F9</p>
            </div>
          </div>
        </Section>

        {/* ── BADGES ── */}
        <Section>
          <SectionHeading>Badges</SectionHeading>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
            <div className="flex flex-wrap gap-6 mb-6">
              {BADGE_VARIANTS.map(b => (
                <div key={b.label} className="flex flex-col items-center gap-2">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={{ background: b.bg, color: b.text }}>{b.label}</span>
                  <p className="text-[10px] text-[#94A3B8]">{b.label}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[#F1F5F9] grid grid-cols-6 gap-3">
              {BADGE_VARIANTS.map(b => (
                <div key={b.label + "-spec"} className="text-[10px] font-mono text-[#64748B]">
                  <p className="font-bold text-[#0F0E47] mb-0.5">{b.label}</p>
                  <p>bg: {b.bg}</p>
                  <p>text: {b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── CARD ── */}
        <Section>
          <SectionHeading>Card</SectionHeading>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#272757]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F0E47]">Biology Quiz 3</p>
                    <p className="text-xs text-[#64748B]">32 students · Due Jun 12</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]">Active</span>
              </div>
              <div className="h-1 rounded-full bg-[#E2E8F0] mb-4">
                <div className="h-1 rounded-full bg-[#272757] w-3/4" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B]">24 / 32 submitted</p>
                <button className="flex items-center gap-1 text-xs font-semibold text-[#272757] hover:text-[#1A1952]">
                  View Results <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
              <p className="text-xs font-bold text-[#0F0E47] mb-4 uppercase tracking-wide">Specifications</p>
              <div className="space-y-2 text-xs font-mono text-[#475569]">
                {[
                  ["Background",     "#FFFFFF"],
                  ["Border",         "#E2E8F0 · 1px"],
                  ["Border Radius",  "12px (rounded-xl)"],
                  ["Shadow",         "0 1px 2px rgba(0,0,0,.05)"],
                  ["Padding",        "20px (p-5)"],
                  ["Icon Container", "40px · rounded-xl"],
                  ["Icon Color",     "#272757 on #EDE9FE"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                    <span>{k}</span><span className="text-[#272757]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── SPACING ── */}
        <Section>
          <SectionHeading>Spacing (8px Grid)</SectionHeading>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
            <div className="flex items-end gap-8">
              {SPACING.map(px => (
                <div key={px} className="flex flex-col items-center gap-2">
                  <div className="bg-[#272757] rounded" style={{ width: Math.max(px, 4) + "px", height: Math.max(px, 4) + "px" }} />
                  <p className="text-[11px] font-mono text-[#475569]">{px}px</p>
                  <p className="text-[10px] text-[#94A3B8]">
                    {["p-1","p-2","p-3","p-4","p-6","p-8","p-12"][SPACING.indexOf(px)]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── ICONS ── */}
        <Section>
          <SectionHeading>Icon Style</SectionHeading>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
            <p className="text-xs text-[#94A3B8] mb-5">All icons from <span className="font-mono text-[#272757]">lucide-react</span> · Stroke 1.5 · Default 20px</p>
            <div className="flex flex-wrap gap-8 mb-8">
              {ICONS.map(({ icon: Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#272757]" />
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono">{name}</p>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-[#F1F5F9]">
              <p className="text-xs font-bold text-[#475569] mb-4">Size Scale</p>
              <div className="flex items-end gap-8">
                {[12, 14, 16, 20, 24, 32].map(size => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Home style={{ width: size, height: size }} className="text-[#272757]" />
                    <p className="text-[10px] font-mono text-[#94A3B8]">{size}px</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── ALERTS ── */}
        <Section>
          <SectionHeading>Alerts & Toasts</SectionHeading>
          <div className="space-y-3">
            {[
              { icon: CheckCircle2,  bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7", label: "Success", msg: "Branding saved successfully." },
              { icon: Info,          bg: "#DBEAFE", text: "#1E3A8A", border: "#93C5FD", label: "Info",    msg: "Your changes are saved as a draft." },
              { icon: AlertTriangle, bg: "#FEF3C7", text: "#92400E", border: "#FCD34D", label: "Warning", msg: "Publishing will go live immediately." },
              { icon: XCircle,       bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", label: "Danger",  msg: "Failed to save. Please try again." },
            ].map(({ icon: Icon, bg, text, border, label, msg }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ background: bg, borderColor: border }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: text }} />
                <div>
                  <span className="text-xs font-bold" style={{ color: text }}>{label}: </span>
                  <span className="text-xs" style={{ color: text }}>{msg}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="pt-8 border-t border-[#E2E8F0] text-center">
          <p className="text-xs text-[#94A3B8]">QuizMind AI · Blue Eclipse Design System · 1440px Desktop · 375px Mobile</p>
        </div>
      </div>
    </div>
  );
}
