import { useState, useRef, useCallback } from "react";
import {
  Settings,
  Upload,
  X,
  Monitor,
  Smartphone,
  Undo2,
  Clock,
  RefreshCw,
  ChevronDown,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";

type Device = "desktop" | "mobile";
type PreviewPage = "home" | "login" | "signup" | "student" | "teacher" | "quiz";

interface IdentityState {
  platformName: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}

interface TextState {
  tagline: string;
  loginWelcome: string;
  signupTitle: string;
  ctaButton: string;
  footerTagline: string;
  supportEmail: string;
  emailSender: string;
}

interface MediaAsset {
  id: string;
  name: string;
  url: string;
}

interface HistoryVersion {
  id: string;
  date: string;
  admin: string;
  label: string;
}

const DEFAULTS: { identity: IdentityState; text: TextState } = {
  identity: {
    platformName: "QuizMind AI",
    primaryColor: "#272757",
    secondaryColor: "#505081",
    bgColor: "#F8FAFC",
    logoUrl: null,
    faviconUrl: null,
  },
  text: {
    tagline: "Assess smarter with AI",
    loginWelcome: "Welcome back! Sign in to continue.",
    signupTitle: "Create your account",
    ctaButton: "Get Started Free",
    footerTagline: "Empowering educators with AI.",
    supportEmail: "support@quizmind.ai",
    emailSender: "QuizMind AI",
  },
};

const INITIAL_BANNERS = [
  { id: "home",      label: "Home Page Hero Banner",        helper: "The large banner image on the home page background",            url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&h=200&fit=crop" },
  { id: "login",     label: "Login Page Background",         helper: "The background image shown behind the login form",              url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&h=200&fit=crop" },
  { id: "signup",    label: "Sign Up Page Background",       helper: "The background image shown behind the sign up form",            url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=200&fit=crop" },
  { id: "dashboard", label: "Dashboard Welcome Banner",      helper: "The banner shown at the top of dashboards for first-time users", url: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=600&h=200&fit=crop" },
];

const INITIAL_ASSETS: MediaAsset[] = [
  { id: "1", name: "hero-banner.jpg",    url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200&h=120&fit=crop" },
  { id: "2", name: "login-bg.jpg",       url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=200&h=120&fit=crop" },
  { id: "3", name: "empty-state.png",    url: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=200&h=120&fit=crop" },
  { id: "4", name: "onboarding-1.png",   url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&h=120&fit=crop" },
  { id: "5", name: "quiz-cover.png",     url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=120&fit=crop" },
  { id: "6", name: "dashboard-hero.jpg", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=120&fit=crop" },
];

const HISTORY: HistoryVersion[] = [
  { id: "h1", date: "Aug 4, 2026 — 14:32", admin: "Admin",         label: "Updated primary color" },
  { id: "h2", date: "Aug 3, 2026 — 11:05", admin: "Admin",         label: "Replaced hero banner" },
  { id: "h3", date: "Aug 1, 2026 — 09:17", admin: "Sarah Mukama",  label: "Changed login welcome" },
  { id: "h4", date: "Jul 30, 2026 — 16:44", admin: "Admin",        label: "Updated footer tagline" },
  { id: "h5", date: "Jul 28, 2026 — 08:20", admin: "Jean Bosco",   label: "New logo uploaded" },
  { id: "h6", date: "Jul 25, 2026 — 13:55", admin: "Admin",        label: "CTA button text changed" },
  { id: "h7", date: "Jul 22, 2026 — 10:00", admin: "Sarah Mukama", label: "Background color update" },
  { id: "h8", date: "Jul 20, 2026 — 15:30", admin: "Admin",        label: "Platform name updated" },
  { id: "h9", date: "Jul 18, 2026 — 09:45", admin: "Jean Bosco",   label: "Signup page background" },
  { id: "h10",date: "Jul 15, 2026 — 11:10", admin: "Admin",        label: "Initial configuration" },
];

const PAGE_OPTIONS: { value: PreviewPage; label: string }[] = [
  { value: "home",    label: "Home Page" },
  { value: "login",   label: "Login Page" },
  { value: "signup",  label: "Sign Up Page" },
  { value: "student", label: "Student Dashboard" },
  { value: "teacher", label: "Teacher Dashboard" },
  { value: "quiz",    label: "Quiz Taking Page" },
];

function FieldHelper({ text }: { text: string }) {
  return <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">{text}</p>;
}

function ColorRow({ label, value, helper, onChange }: { label: string; value: string; helper: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-[#475569] mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
          className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#272757]/20 focus:border-[#272757]"
        />
        <label className="w-9 h-9 rounded-lg border-2 border-[#E2E8F0] cursor-pointer overflow-hidden flex-shrink-0 relative" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </label>
      </div>
      <FieldHelper text={helper} />
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-[#E2E8F0] my-6" />;
}

function ResetLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#475569] transition-colors mt-3"
    >
      <RefreshCw className="w-3 h-3" />
      Reset to Default
    </button>
  );
}

/* ─── Preview components ─── */

function PreviewHome({ id, text, bannerUrl, device }: { id: IdentityState; text: TextState; bannerUrl: string; device: Device }) {
  return (
    <div style={{ background: id.bgColor }} className="flex flex-col min-h-full">
      {/* Nav */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-sm" style={{ color: id.primaryColor }}>{id.platformName}</span>
        {device === "desktop" && (
          <div className="flex gap-4 text-xs text-[#475569]">
            {["Features", "Pricing", "About"].map(l => <span key={l}>{l}</span>)}
          </div>
        )}
        <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: id.primaryColor }}>{text.ctaButton}</button>
      </div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: device === "mobile" ? 200 : 260 }}>
        <img src={bannerUrl} alt="hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white" style={{ background: `${id.primaryColor}CC` }}>
          <p className="font-bold mb-2" style={{ fontSize: device === "mobile" ? 18 : 26 }}>{id.platformName}</p>
          <p className="text-xs opacity-80 mb-4 text-center px-6">{text.tagline}</p>
          <button className="px-5 py-2 rounded-xl text-xs font-bold text-white border-2 border-white">{text.ctaButton}</button>
        </div>
      </div>
      {/* Footer */}
      <div className="mt-auto py-4 text-center text-[10px] text-[#94A3B8]">{text.footerTagline}</div>
    </div>
  );
}

function PreviewLogin({ id, text, bannerUrl, device }: { id: IdentityState; text: TextState; bannerUrl: string; device: Device }) {
  return (
    <div className="flex" style={{ minHeight: device === "mobile" ? 500 : 400 }}>
      {device === "desktop" && (
        <div className="flex-1 relative overflow-hidden">
          <img src={bannerUrl} alt="login-bg" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${id.primaryColor}BB` }}>
            <p className="text-white font-bold text-lg px-6 text-center">{id.platformName}</p>
          </div>
        </div>
      )}
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8">
        <p className="text-base font-bold text-[#0F0E47] mb-1">{text.loginWelcome}</p>
        <p className="text-xs text-[#64748B] mb-5">Sign in to your account</p>
        <div className="w-full max-w-xs space-y-3">
          <div className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#94A3B8]">Email address</div>
          <div className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#94A3B8]">Password</div>
          <button className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{ background: id.primaryColor }}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

function PreviewSignup({ id, text, bannerUrl, device }: { id: IdentityState; text: TextState; bannerUrl: string; device: Device }) {
  return (
    <div className="flex" style={{ minHeight: device === "mobile" ? 560 : 440 }}>
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8">
        <p className="text-base font-bold text-[#0F0E47] mb-1">{text.signupTitle}</p>
        <p className="text-xs text-[#64748B] mb-5">Join thousands of educators</p>
        <div className="w-full max-w-xs space-y-3">
          {["Full name", "Email address", "Password", "Confirm password"].map(ph => (
            <div key={ph} className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#94A3B8]">{ph}</div>
          ))}
          <button className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{ background: id.primaryColor }}>{text.ctaButton}</button>
        </div>
      </div>
      {device === "desktop" && (
        <div className="flex-1 relative overflow-hidden">
          <img src={bannerUrl} alt="signup-bg" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${id.primaryColor}BB` }}>
            <p className="text-white font-bold text-lg px-6 text-center">{text.tagline}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewDashboard({ id, text, role, device }: { id: IdentityState; text: TextState; role: "student" | "teacher"; device: Device }) {
  const studentNav = ["Dashboard","My Quizzes","My Classes","My Results","My Progress"];
  const teacherNav = ["Dashboard","My Classes","My Quizzes","Generate Quiz","Analytics"];
  const navLabels = role === "student" ? studentNav : teacherNav;
  const stats = role === "student"
    ? [{ label: "Quizzes Done", val: "12" }, { label: "Avg Score", val: "78%" }, { label: "Streak", val: "5d" }, { label: "Classes", val: "3" }]
    : [{ label: "My Classes", val: "4" }, { label: "Quizzes", val: "18" }, { label: "Students", val: "96" }, { label: "Avg Score", val: "74%" }];
  return (
    <div className="flex overflow-hidden" style={{ minHeight: device === "mobile" ? 480 : 380, background: id.bgColor }}>
      {device === "desktop" && (
        <div className="w-36 flex-shrink-0 flex flex-col" style={{ background: "#0F0E47" }}>
          <div className="px-3 py-3 border-b border-white/10">
            <span className="text-xs font-bold text-white">{id.platformName}</span>
          </div>
          <nav className="py-2 px-1.5 space-y-0.5 flex-1">
            {navLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: i === 0 ? id.primaryColor : "transparent" }}>
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: i === 0 ? "white" : "#8686AC" }} />
                <span className="text-[10px]" style={{ color: i === 0 ? "white" : "#8686AC" }}>{label}</span>
              </div>
            ))}
          </nav>
          <div className="px-3 py-2 border-t border-white/10">
            <p className="text-[8px] text-white/40">{text.footerTagline}</p>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-bold text-[#0F0E47]">Dashboard</span>
          <div className="w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: id.primaryColor }}>
            {role === "student" ? "AM" : "JN"}
          </div>
        </div>
        <div className="p-4 flex-1">
          <div className="rounded-xl p-4 mb-3 text-white" style={{ background: `linear-gradient(135deg, ${id.primaryColor}, ${id.secondaryColor})` }}>
            <p className="text-[9px] opacity-70">Hello, {role === "student" ? "Alex" : "Mrs. Nkosi"}</p>
            <p className="text-sm font-bold mt-0.5">{role === "student" ? "Welcome back!" : "Manage your classes"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-xl p-2.5 border border-[#E2E8F0]">
                <p className="text-[9px] text-[#64748B]">{s.label}</p>
                <p className="text-sm font-bold" style={{ color: id.primaryColor }}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewQuiz({ id, text, device }: { id: IdentityState; text: TextState; device: Device }) {
  return (
    <div style={{ background: id.bgColor, minHeight: device === "mobile" ? 480 : 380 }} className="flex flex-col">
      <div className="bg-white px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-bold text-[#0F0E47]">{id.platformName}</span>
        <span className="text-[10px] text-[#64748B]">Question 3 of 10</span>
      </div>
      <div className="p-5 flex-1">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full mb-4">
            <div className="h-full rounded-full w-[30%]" style={{ background: id.primaryColor }} />
          </div>
          <p className="text-xs font-semibold text-[#0F0E47] mb-4">What is the capital city of Rwanda?</p>
          <div className="space-y-2">
            {["Kigali", "Butare", "Gisenyi", "Ruhengeri"].map((opt, i) => (
              <div key={opt} className="flex items-center gap-2 p-2.5 rounded-lg border transition-colors cursor-pointer"
                style={{ borderColor: i === 0 ? id.primaryColor : "#E2E8F0", background: i === 0 ? `${id.primaryColor}12` : "white" }}>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: i === 0 ? id.primaryColor : "#CBD5E1" }}>
                  {i === 0 && <div className="w-2 h-2 rounded-full" style={{ background: id.primaryColor }} />}
                </div>
                <span className="text-xs" style={{ color: i === 0 ? id.primaryColor : "#475569" }}>{opt}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: id.primaryColor }}>Next Question</button>
        </div>
      </div>
    </div>
  );
}

export function AdminPlatformEditor() {
  const [device, setDevice] = useState<Device>("desktop");
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");

  const [identity, setIdentity] = useState<IdentityState>({ ...DEFAULTS.identity });
  const [savedIdentity] = useState<IdentityState>({ ...DEFAULTS.identity });
  const [text, setText] = useState<TextState>({ ...DEFAULTS.text });
  const [savedText] = useState<TextState>({ ...DEFAULTS.text });

  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);

  // History of recent states for undo
  const [history, setHistory] = useState<{ identity: IdentityState; text: TextState }[]>([]);

  // Panel states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<HistoryVersion | null>(null);
  const [discardModal, setDiscardModal] = useState(false);
  const [publishOverlay, setPublishOverlay] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<"identity" | "text" | "media" | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customCss, setCustomCss] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const bannerRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const replaceRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const pushHistory = useCallback(() => {
    setHistory(h => [{ identity, text }, ...h].slice(0, 20));
  }, [identity, text]);

  const handleUndo = () => {
    if (history.length === 0) { toast("Nothing to undo"); return; }
    const [prev, ...rest] = history;
    setIdentity(prev.identity);
    setText(prev.text);
    setHistory(rest);
    toast("Last change undone");
  };

  const setIdentityField = (patch: Partial<IdentityState>) => {
    pushHistory();
    setIdentity(s => ({ ...s, ...patch }));
  };

  const setTextField = (patch: Partial<TextState>) => {
    pushHistory();
    setText(s => ({ ...s, ...patch }));
  };

  const handleDiscard = () => {
    setIdentity({ ...DEFAULTS.identity });
    setText({ ...DEFAULTS.text });
    setHistory([]);
    setDiscardModal(false);
    toast("All unsaved changes discarded");
  };

  const handlePublish = () => {
    setPublishOverlay(false);
    toast.success("Changes published successfully");
  };

  const handleRestore = (v: HistoryVersion) => {
    setRestoreVersion(null);
    setHistoryOpen(false);
    toast.success(`Restored version from ${v.date}`);
  };

  const handleReset = () => {
    if (resetModal === "identity") { setIdentity({ ...DEFAULTS.identity }); toast("Identity reset to defaults"); }
    if (resetModal === "text") { setText({ ...DEFAULTS.text }); toast("Page text reset to defaults"); }
    if (resetModal === "media") { setBanners(INITIAL_BANNERS); setAssets(INITIAL_ASSETS); toast("Media reset to defaults"); }
    setResetModal(null);
  };

  const handleAssetUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setAssets(prev => [...prev, { id: Date.now() + file.name, name: file.name, url }]);
    });
    toast.success("Asset uploaded");
  };

  const handleAssetReplace = (id: string, files: FileList | null) => {
    if (!files?.[0]) return;
    const url = URL.createObjectURL(files[0]);
    setAssets(prev => prev.map(a => a.id === id ? { ...a, url, name: files[0].name } : a));
  };

  const handleBannerReplace = (id: string, files: FileList | null) => {
    if (!files?.[0]) return;
    const url = URL.createObjectURL(files[0]);
    setBanners(prev => prev.map(b => b.id === id ? { ...b, url } : b));
  };

  const confirmDelete = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setDeleteModal(null);
    toast.success("Asset deleted");
  };

  // Compute changed fields for publish comparison
  const changes: string[] = [];
  if (identity.platformName !== savedIdentity.platformName) changes.push(`Platform name changed to "${identity.platformName}"`);
  if (identity.primaryColor !== savedIdentity.primaryColor) changes.push(`Primary color changed from ${savedIdentity.primaryColor.toUpperCase()} to ${identity.primaryColor.toUpperCase()}`);
  if (identity.secondaryColor !== savedIdentity.secondaryColor) changes.push(`Secondary color changed from ${savedIdentity.secondaryColor.toUpperCase()} to ${identity.secondaryColor.toUpperCase()}`);
  if (identity.bgColor !== savedIdentity.bgColor) changes.push(`Background color changed`);
  if (identity.logoUrl !== savedIdentity.logoUrl) changes.push("Logo updated");
  if (text.tagline !== savedText.tagline) changes.push("Platform tagline updated");
  if (text.loginWelcome !== savedText.loginWelcome) changes.push("Login welcome message updated");
  if (text.signupTitle !== savedText.signupTitle) changes.push("Sign up title updated");
  if (text.ctaButton !== savedText.ctaButton) changes.push("CTA button text updated");
  if (text.footerTagline !== savedText.footerTagline) changes.push("Footer tagline updated");
  if (text.supportEmail !== savedText.supportEmail) changes.push("Support email updated");

  const homeBanner = banners.find(b => b.id === "home")!;
  const loginBanner = banners.find(b => b.id === "login")!;
  const signupBanner = banners.find(b => b.id === "signup")!;

  const renderPreview = (overrideDevice?: Device) => {
    const d = overrideDevice ?? device;
    const props = { id: identity, text, device: d };
    switch (previewPage) {
      case "home":    return <PreviewHome    {...props} bannerUrl={homeBanner.url} />;
      case "login":   return <PreviewLogin   {...props} bannerUrl={loginBanner.url} />;
      case "signup":  return <PreviewSignup  {...props} bannerUrl={signupBanner.url} />;
      case "student": return <PreviewDashboard {...props} role="student" />;
      case "teacher": return <PreviewDashboard {...props} role="teacher" />;
      case "quiz":    return <PreviewQuiz    {...props} />;
    }
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#272757]/20 focus:border-[#272757]";
  const saveBtnCls = "w-full py-2.5 rounded-xl text-sm font-bold text-white bg-[#272757] hover:bg-[#1A1952] transition-colors mt-4";

  return (
    <AppShell role="admin" pending={true} pageTitle="Platform Editor">
      <div className="flex h-[calc(100vh-64px)] -mx-6 -mt-6 overflow-hidden">

        {/* ══════════════════ LEFT PANEL ══════════════════ */}
        <div className="w-[420px] flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden">

          {/* Top bar: Undo + History */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2E8F0] flex-shrink-0">
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <Clock className="w-3.5 h-3.5" /> Change History
            </button>
            <div className="ml-auto text-[10px] text-[#94A3B8]">{history.length} unsaved change{history.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Scrollable sections */}
          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* ─── IDENTITY SECTION ─── */}
            <div>
              <h3 className="text-sm font-bold text-[#0F0E47]">Identity</h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5 mb-4">Control what your platform is called and how it looks.</p>

              {/* Platform Name */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Platform Name</label>
                <input
                  type="text"
                  value={identity.platformName}
                  onChange={e => setIdentityField({ platformName: e.target.value })}
                  className={inputCls}
                />
                <FieldHelper text="This name appears in the browser tab, login page, emails and the navigation logo." />
              </div>

              {/* Logo Upload */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Logo Upload</label>
                <div className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                  <div className="w-20 h-10 flex-shrink-0 rounded-lg bg-[#0F0E47] flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
                    {identity.logoUrl
                      ? <img src={identity.logoUrl} alt="logo" className="w-full h-full object-contain" />
                      : <span className="text-white text-xs font-bold">Q</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <button
                      onClick={() => logoRef.current?.click()}
                      className="py-1.5 text-xs font-semibold border border-[#272757] text-[#272757] rounded-lg hover:bg-[#EDE9FE] transition-colors"
                    >
                      Replace Logo
                    </button>
                    <button
                      onClick={() => setIdentityField({ logoUrl: null })}
                      className="py-1.5 text-xs font-semibold border border-[#E2E8F0] text-[#94A3B8] rounded-lg hover:bg-[#F1F5F9] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <input ref={logoRef} type="file" accept="image/png,image/svg+xml" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) setIdentityField({ logoUrl: URL.createObjectURL(e.target.files[0]) }); }} />
                </div>
                <FieldHelper text="Upload a PNG or SVG file. Recommended size 200 × 60 pixels." />
              </div>

              {/* Favicon Upload */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Favicon Upload</label>
                <div className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                  <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#0F0E47] flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
                    {identity.faviconUrl
                      ? <img src={identity.faviconUrl} alt="favicon" className="w-full h-full object-contain" />
                      : <span className="text-white text-xs font-bold">Q</span>}
                  </div>
                  <button
                    onClick={() => faviconRef.current?.click()}
                    className="px-4 py-1.5 text-xs font-semibold border border-[#272757] text-[#272757] rounded-lg hover:bg-[#EDE9FE] transition-colors"
                  >
                    Replace
                  </button>
                  <input ref={faviconRef} type="file" accept="image/png" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) setIdentityField({ faviconUrl: URL.createObjectURL(e.target.files[0]) }); }} />
                </div>
                <FieldHelper text="This small icon appears in browser tabs. Upload a square PNG 32 × 32 pixels." />
              </div>

              <ColorRow
                label="Primary Color"
                value={identity.primaryColor}
                helper="This color is used for buttons, links, active menu items and highlights across the platform."
                onChange={v => setIdentityField({ primaryColor: v })}
              />
              <ColorRow
                label="Secondary Color"
                value={identity.secondaryColor}
                helper="This color is used for hover states and secondary accents."
                onChange={v => setIdentityField({ secondaryColor: v })}
              />
              <ColorRow
                label="Background Color"
                value={identity.bgColor}
                helper="This is the main page background color. Avoid very dark colors as they may make text hard to read."
                onChange={v => setIdentityField({ bgColor: v })}
              />

              {/* Advanced toggle */}
              <div className="mt-2 mb-4">
                <button
                  onClick={() => setShowAdvanced(s => !s)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#505081] hover:text-[#272757] transition-colors"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                  {showAdvanced ? "Hide" : "Show"} Advanced Settings
                </button>
                {showAdvanced && (
                  <div className="mt-4 space-y-4 p-4 bg-[#FFF8F0] border border-[#FDE68A] rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#92400E]">Incorrect values in these fields may break the platform appearance. Only modify if you know what you are doing.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Custom CSS</label>
                      <textarea
                        rows={5}
                        value={customCss}
                        onChange={e => setCustomCss(e.target.value)}
                        placeholder=":root { --brand: #272757; }"
                        className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#272757]/20 focus:border-[#272757] font-mono bg-white"
                      />
                      <FieldHelper text="Add custom CSS overrides. Incorrect CSS may break the platform appearance." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1.5">Custom Domain</label>
                      <input
                        type="text"
                        value={customDomain}
                        onChange={e => setCustomDomain(e.target.value)}
                        placeholder="quizzes.myschool.rw"
                        className={inputCls}
                      />
                      <FieldHelper text="Set a white-label domain. Incorrect values may break the platform." />
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => toast.success("Identity saved successfully")} className={saveBtnCls}>
                Save Identity
              </button>
              <ResetLink onClick={() => setResetModal("identity")} />
            </div>

            <SectionDivider />

            {/* ─── PAGES AND TEXT SECTION ─── */}
            <div>
              <h3 className="text-sm font-bold text-[#0F0E47]">Pages and Text</h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5 mb-4">Edit the words your users see across the platform.</p>

              {[
                { label: "Platform Tagline",                key: "tagline",      helper: "Shown on the home page hero section below the platform name." },
                { label: "Login Page Welcome Message",      key: "loginWelcome", helper: "Shown above the login form when users arrive at the login page." },
                { label: "Sign Up Page Title",              key: "signupTitle",  helper: "Shown at the top of the sign up form." },
                { label: "Home Page Call to Action Button", key: "ctaButton",    helper: "The main button on the home page that invites users to sign up." },
                { label: "Footer Tagline",                  key: "footerTagline",helper: "Shown at the bottom of every page." },
                { label: "Support Email Address",           key: "supportEmail", helper: "Shown on the Help page and in automated emails." },
                { label: "Email Sender Name",               key: "emailSender",  helper: "The name that appears in the From field of all emails sent by the platform." },
              ].map(({ label, key, helper }) => (
                <div key={key} className="mb-5">
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={(text as Record<string, string>)[key]}
                    onChange={e => setTextField({ [key]: e.target.value })}
                    className={inputCls}
                  />
                  <FieldHelper text={helper} />
                </div>
              ))}

              <button onClick={() => toast.success("Page text saved successfully")} className={saveBtnCls}>
                Save Text
              </button>
              <ResetLink onClick={() => setResetModal("text")} />
            </div>

            <SectionDivider />

            {/* ─── MEDIA SECTION ─── */}
            <div>
              <h3 className="text-sm font-bold text-[#0F0E47]">Media</h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5 mb-5">Upload and manage images and icons used across the platform.</p>

              {/* Page Banners */}
              <p className="text-xs font-bold text-[#0F0E47] mb-3">Page Banners</p>
              <div className="space-y-5 mb-6">
                {banners.map(banner => (
                  <div key={banner.id}>
                    <p className="text-xs font-semibold text-[#475569] mb-1">{banner.label}</p>
                    <div className="rounded-xl overflow-hidden border border-[#E2E8F0] aspect-[3/1]">
                      <img src={banner.url} alt={banner.label} className="w-full h-full object-cover" />
                    </div>
                    <FieldHelper text={banner.helper} />
                    <button
                      onClick={() => bannerRefs.current[banner.id]?.click()}
                      className="mt-2 w-full py-1.5 text-xs font-semibold border border-[#272757] text-[#272757] rounded-lg hover:bg-[#EDE9FE] transition-colors"
                    >
                      Replace Image
                    </button>
                    <input
                      ref={el => { bannerRefs.current[banner.id] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleBannerReplace(banner.id, e.target.files)}
                    />
                  </div>
                ))}
              </div>

              {/* Media Library */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#0F0E47]">Media Library</p>
                <button
                  onClick={() => {
                    const inp = document.createElement("input");
                    inp.type = "file";
                    inp.accept = "image/jpeg,image/png,image/svg+xml,image/gif";
                    inp.multiple = true;
                    inp.onchange = e => handleAssetUpload((e.target as HTMLInputElement).files);
                    inp.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#272757] text-white rounded-lg hover:bg-[#1A1952] transition-colors"
                >
                  <Upload className="w-3 h-3" /> Upload New Asset
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                {assets.map(asset => (
                  <div key={asset.id}>
                    <div className="aspect-video rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F1F5F9]">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-0.5 truncate">{asset.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      <button
                        onClick={() => replaceRefs.current[asset.id]?.click()}
                        className="flex-1 py-0.5 text-[10px] font-semibold border border-[#272757] text-[#272757] rounded hover:bg-[#EDE9FE] transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => setDeleteModal(asset.id)}
                        className="flex-1 py-0.5 text-[10px] font-semibold border border-[#FEE2E2] text-[#EF4444] rounded hover:bg-[#FEE2E2] transition-colors"
                      >
                        Delete
                      </button>
                      <input
                        ref={el => { replaceRefs.current[asset.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleAssetReplace(asset.id, e.target.files)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => toast.success("Media saved successfully")} className={saveBtnCls}>
                Save Media
              </button>
              <ResetLink onClick={() => setResetModal("media")} />
            </div>

            <div className="h-8" />
          </div>
        </div>

        {/* ══════════════════ RIGHT PANEL ══════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F1F5F9]">

          {/* Action bar: Discard + Publish */}
          <div className="flex items-center justify-end gap-2 px-6 py-3 bg-white border-b border-[#E2E8F0] flex-shrink-0">
            <button
              onClick={() => setDiscardModal(true)}
              className="px-4 py-2 text-xs font-semibold border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              Discard Changes
            </button>
            <button
              onClick={() => setPublishOverlay(true)}
              className="px-4 py-2 text-xs font-bold bg-[#272757] text-white rounded-lg hover:bg-[#1A1952] transition-colors"
            >
              Publish Changes
            </button>
          </div>

          {/* Preview toolbar */}
          <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-[#E2E8F0] flex-shrink-0">
            <span className="text-xs text-[#94A3B8] font-medium">Live Preview</span>

            {/* Page selector */}
            <div className="flex-1 max-w-[220px] relative">
              <select
                value={previewPage}
                onChange={e => setPreviewPage(e.target.value as PreviewPage)}
                className="w-full appearance-none px-3 py-1.5 pr-8 text-xs font-semibold border border-[#E2E8F0] rounded-lg bg-white text-[#0F0E47] focus:outline-none focus:border-[#272757] cursor-pointer"
              >
                {PAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Device toggle */}
            <div className="ml-auto flex items-center bg-[#F1F5F9] rounded-lg p-0.5">
              <button
                onClick={() => setDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${device === "desktop" ? "bg-white text-[#272757] shadow-sm" : "text-[#8686AC] hover:text-[#272757]"}`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${device === "mobile" ? "bg-white text-[#272757] shadow-sm" : "text-[#8686AC] hover:text-[#272757]"}`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* Preview viewport */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-8">
            {device === "mobile" ? (
              <div className="w-[375px] border-4 border-[#1A1952] rounded-[36px] overflow-hidden shadow-2xl bg-white">
                <div className="flex justify-between items-center px-6 py-2" style={{ background: identity.primaryColor }}>
                  <span className="text-[10px] text-white/70 font-semibold">9:41</span>
                  <span className="text-[10px] text-white font-bold">{identity.platformName}</span>
                  <span className="text-[10px] text-white/70">●●●</span>
                </div>
                <div className="overflow-hidden">{renderPreview()}</div>
              </div>
            ) : (
              <div className="w-full max-w-[1100px] rounded-2xl overflow-hidden shadow-xl border border-[#E2E8F0]">
                {/* Browser chrome */}
                <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-[#94A3B8] border border-[#E2E8F0]">
                    quizmind.ai{previewPage === "login" ? "/login" : previewPage === "signup" ? "/signup" : previewPage === "student" ? "/student" : previewPage === "teacher" ? "/teacher" : previewPage === "quiz" ? "/quiz/1" : "/"}
                  </div>
                </div>
                <div className="overflow-hidden bg-white">{renderPreview()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════ CHANGE HISTORY PANEL ══════════════════ */}
      {historyOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setHistoryOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-[320px] bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#272757]" />
                <h3 className="text-sm font-bold text-[#0F0E47]">Change History</h3>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-[#8686AC]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {HISTORY.map((v, i) => (
                <div key={v.id} className={`p-3 rounded-xl border ${i === 0 ? "border-[#272757]/20 bg-[#EDE9FE]" : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"} transition-colors`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#0F0E47] leading-snug">{v.label}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{v.date}</p>
                      <p className="text-[10px] text-[#64748B]">by {v.admin}</p>
                    </div>
                    <button
                      onClick={() => setRestoreVersion(v)}
                      className="px-2.5 py-1 text-[10px] font-bold border border-[#272757] text-[#272757] rounded-lg hover:bg-[#EDE9FE] transition-colors flex-shrink-0"
                    >
                      Restore
                    </button>
                  </div>
                  {i === 0 && <span className="inline-block mt-1.5 text-[9px] font-bold text-[#272757] bg-white border border-[#272757]/20 px-1.5 py-0.5 rounded-full">Current</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ PUBLISH OVERLAY ══════════════════ */}
      {publishOverlay && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#272757]" />
              <h2 className="text-base font-bold text-[#0F0E47]">Review Changes Before Publishing</h2>
            </div>
            <button onClick={() => setPublishOverlay(false)} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-[#8686AC]" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="grid grid-cols-2 gap-6 max-w-[1200px] mx-auto">
              {/* Current version */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8686AC]" />
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wide">Current Version</span>
                </div>
                <div className="rounded-2xl overflow-hidden border-2 border-[#E2E8F0] shadow-sm">
                  <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                    </div>
                    <div className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] text-[#94A3B8] border border-[#E2E8F0]">quizmind.ai</div>
                  </div>
                  <div className="overflow-hidden">
                    <PreviewHome id={savedIdentity} text={savedText} bannerUrl={homeBanner.url} device="desktop" />
                  </div>
                </div>
              </div>

              {/* New version */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-bold text-[#10B981] uppercase tracking-wide">New Version</span>
                </div>
                <div className="rounded-2xl overflow-hidden border-2 border-[#10B981]/40 shadow-sm">
                  <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                    </div>
                    <div className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] text-[#94A3B8] border border-[#E2E8F0]">quizmind.ai</div>
                  </div>
                  <div className="overflow-hidden">
                    <PreviewHome id={identity} text={text} bannerUrl={homeBanner.url} device="desktop" />
                  </div>
                </div>
              </div>
            </div>

            {/* Change summary */}
            <div className="max-w-[1200px] mx-auto mt-6 p-5 bg-white rounded-2xl border border-[#E2E8F0]">
              <p className="text-xs font-bold text-[#0F0E47] mb-3">Summary of Changes</p>
              {changes.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No changes detected since last publish.</p>
              ) : (
                <ul className="space-y-1.5">
                  {changes.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#272757] flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-[#E2E8F0] bg-white">
            <button
              onClick={() => setPublishOverlay(false)}
              className="px-6 py-2.5 text-sm font-semibold border border-[#E2E8F0] text-[#475569] rounded-xl hover:bg-[#F8FAFC] transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handlePublish}
              className="px-6 py-2.5 text-sm font-bold bg-[#272757] text-white rounded-xl hover:bg-[#1A1952] transition-colors"
            >
              Confirm and Publish
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ DISCARD MODAL ══════════════════ */}
      {discardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h3 className="text-base font-bold text-[#0F0E47]">Discard all unsaved changes?</h3>
            </div>
            <p className="text-sm text-[#64748B] mb-6">This cannot be undone. All edits made since your last save will be permanently lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setDiscardModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button onClick={handleDiscard} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#EF4444] hover:bg-red-600 transition-colors">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RESTORE VERSION MODAL ══════════════════ */}
      {restoreVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#D97706]" />
              </div>
              <h3 className="text-base font-bold text-[#0F0E47]">Restore this version?</h3>
            </div>
            <p className="text-sm text-[#64748B] mb-1">Version from <span className="font-semibold text-[#0F0E47]">{restoreVersion.date}</span></p>
            <p className="text-sm text-[#64748B] mb-6">All current unsaved changes will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setRestoreVersion(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleRestore(restoreVersion)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#272757] hover:bg-[#1A1952] transition-colors">
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RESET MODAL ══════════════════ */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-[#D97706]" />
              </div>
              <h3 className="text-base font-bold text-[#0F0E47]">Reset to default?</h3>
            </div>
            <p className="text-sm text-[#64748B] mb-6">
              {resetModal === "identity" && "This will reset all Identity settings back to the original QuizMind AI defaults. Any custom changes in this section will be lost."}
              {resetModal === "text" && "This will reset all page text back to the original QuizMind AI defaults. Any custom changes in this section will be lost."}
              {resetModal === "media" && "This will reset all media and banners back to the original QuizMind AI defaults. Any custom uploads in this section will be lost."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResetModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#272757] hover:bg-[#1A1952] transition-colors">
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ DELETE ASSET MODAL ══════════════════ */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h3 className="text-base font-bold text-[#0F0E47]">Delete asset?</h3>
            </div>
            <p className="text-sm text-[#64748B] mb-6">Are you sure you want to delete this asset? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button onClick={() => confirmDelete(deleteModal)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#EF4444] hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
