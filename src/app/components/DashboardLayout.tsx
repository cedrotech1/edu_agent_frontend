import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Badge } from "./ui/badge";
import {
  ChevronLeft, ChevronRight, LogOut, User,
  Settings as SettingsIcon, Menu, Search, Bell, Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
  badge?: number;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  role: "teacher" | "student" | "admin";
  pageTitle: string;
  pending?: boolean;
  userName: string;
  userInitials: string;
  settingsPath: string;
  children: React.ReactNode;
}

const roleStyle = {
  teacher: { avatarBg: "bg-[#272757]",  badgeCls: "bg-[#EDE9FE] text-[#BFDBFE]"  },
  student: { avatarBg: "bg-[#505081]",  badgeCls: "bg-[#505081]/30 text-white"  },
  admin:   { avatarBg: "bg-[#8686AC]",  badgeCls: "bg-[#8686AC]/30 text-white"  },
};

export function DashboardLayout({
  navItems, role, pageTitle, pending = false, userName, userInitials, settingsPath, children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const { avatarBg, badgeCls } = roleStyle[role];

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.notifications.list();
        if (cancelled) return;
        if (typeof res.unreadCount === "number") {
          setUnread(res.unreadCount);
          return;
        }
        const rows = (res.data as any[]) || [];
        setUnread(
          rows.filter((n: any) => !(n.isRead ?? n.read)).length,
        );
      } catch {
        if (!cancelled) setUnread(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    toast.success("Logged out");
    navigate("/login");
  };

  const isItemActive = (path: string | null): boolean => {
    if (!path) return false;
    const loc = location.pathname;
    const roleBase = `/${role}`;

    // Exact match for the dashboard root of each role
    if (path === roleBase) return loc === roleBase;

    // Strip trailing numeric segment from the nav path (e.g. /teacher/results/1 → /teacher/results)
    const base = path.replace(/\/\d+$/, "");

    // Exact match
    if (loc === base) return true;

    // Current location is a sub-path of this nav item's base
    // e.g. loc=/teacher/classes/s3-bio matches base=/teacher/classes
    if (loc.startsWith(base + "/")) return true;

    // Special case: quiz builder/editor pages should highlight Generate Quiz
    // when navigated from the quiz builder flow
    if (base === `/${role}/quiz-builder` && loc.startsWith(`/${role}/quiz-builder`)) return true;

    return false;
  };
  const activeIndex = (() => {
    let bestIdx = -1;
    let bestLen = 0;
    navItems.forEach(({ path }, i) => {
      if (!path) return;
      const base = path.replace(/\/\d+$/, "");
      if (isItemActive(path)) {
        const len = base === `/${role}` ? 0 : base.length;
        if (len > bestLen || bestIdx === -1) {
          bestLen = len;
          bestIdx = i;
        }
      }
    });
    return bestIdx;
  })();

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-[#0F0E47]/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={[
        "fixed left-0 top-0 h-screen bg-[#0F0E47] flex flex-col z-50 transition-all duration-200 ease-in-out",
        collapsed ? "w-16" : "w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}>

        {/* Logo */}
        <div className={`h-16 border-b border-[#1A1952] flex items-center shrink-0 ${collapsed ? "justify-center px-0" : "px-5"}`}>
          {collapsed ? (
            <div className="w-8 h-8 bg-[#272757] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">Q</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#272757] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-black">Q</span>
              </div>
              <div>
                <span className="text-white font-bold text-base leading-none">QuizMind</span>
                <span className="block text-[#8686AC] text-[10px] font-medium mt-0.5">AI Platform</span>
              </div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map(({ icon: Icon, label, path, badge }, i) => {
              const active = i === activeIndex;
              return (
                <li key={label}>
                  <button
                    title={collapsed ? label : undefined}
                    onClick={() => {
                      if (path) { navigate(path); setMobileOpen(false); }
                      else if (label === "Notifications") {
                        const notifPath = role === "teacher" ? "/teacher/notifications" : role === "student" ? "/student/notifications" : "/admin/notifications";
                        navigate(notifPath); setMobileOpen(false);
                      }
                      else toast.info(`${label} — coming soon`);
                    }}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      collapsed ? "justify-center" : "",
                      active
                        ? "bg-[#272757] text-white shadow-sm"
                        : "text-[#8686AC] hover:bg-[#1A1952] hover:text-white",
                    ].join(" ")}
                  >
                    <span className="relative shrink-0">
                      <Icon
                        className={`w-[18px] h-[18px] ${active ? "text-white" : "text-[#8686AC]"}`}
                        style={{ strokeWidth: 1.75 }}
                      />
                      {badge && badge > 0 && collapsed && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
                      )}
                    </span>
                    {!collapsed && <span className="truncate flex-1 text-left">{label}</span>}
                    {!collapsed && badge && badge > 0 && (
                      <span className="ml-auto min-w-[18px] h-[18px] bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-[#1A1952] p-3 shrink-0">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                {userInitials}
              </div>
              <button onClick={handleLogout} title="Logout"
                className="p-2 text-[#8686AC] hover:text-red-400 rounded-lg hover:bg-red-900/30 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 mb-2 px-1">
                <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
                  <Badge className={`${badgeCls} text-[10px] px-1.5 py-0 rounded-full capitalize border-0`}>{role}</Badge>
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-[#8686AC] hover:text-red-400 hover:bg-red-900/30 transition-colors">
                <LogOut className="w-3.5 h-3.5" style={{ strokeWidth: 1.75 }} /> Log out
              </button>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-white border border-[#E2E8F0] rounded-full items-center justify-center shadow-sm hover:shadow-md transition-shadow hidden lg:flex"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-[#64748B]" />
            : <ChevronLeft className="w-3 h-3 text-[#64748B]" />}
        </button>
      </aside>

      {/* ── Content area ── */}
      <div className={`min-h-screen flex flex-col transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-60"}`}>

        {/* Sticky header */}
        <header className="sticky top-0 h-16 bg-white border-b border-[#E2E8F0] flex items-center gap-4 px-6 z-30 shrink-0 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <button onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] lg:hidden">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-[17px] font-bold text-[#0F0E47] whitespace-nowrap truncate">{pageTitle}</h1>
            {pending && (
              <span
                title="This page still uses demo data or incomplete API features"
                className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30"
              >
                Pending
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* Search — only submit on Enter (not onChange) to avoid autofill hijacking */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8686AC] pointer-events-none" style={{ strokeWidth: 1.75 }} />
            <input
              type="search"
              name="dashboard-search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Search…"
              className="pl-9 pr-4 h-[38px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#272757]/20 focus:border-[#272757] w-48 transition-all font-[Poppins] text-[#0F0E47]"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const v = (e.target as HTMLInputElement).value.trim();
                if (v.length >= 3) navigate(`/search?q=${encodeURIComponent(v)}`);
              }}
            />
          </div>

          {/* Dark mode toggle */}
          <button
            className="p-2 rounded-xl hover:bg-[#EDE9FE] transition-colors text-[#8686AC] hover:text-[#272757]"
            onClick={() => {}}
            title="Toggle Dark Mode"
          >
            <Moon className="w-5 h-5" style={{ strokeWidth: 1.5 }} />
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => {
                const notifPath = role === "teacher" ? "/teacher/notifications" : role === "student" ? "/student/notifications" : "/admin/notifications";
                navigate(notifPath);
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[#64748B] hover:bg-[#EDE9FE] hover:text-[#272757] transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" style={{ strokeWidth: 1.75 }} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 ring-1 ring-white">
                  {unread}
                </span>
              )}
            </button>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`w-9 h-9 ${avatarBg} rounded-full flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity ring-2 ring-white hover:ring-[#272757]/30`}
            >
              {userInitials}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50">
                <div className="px-4 pb-2 mb-1 border-b border-[#F1F5F9]">
                  <p className="text-sm font-semibold text-[#0F0E47] truncate">{userName}</p>
                  <p className="text-xs text-[#64748B] capitalize">{role}</p>
                </div>
                <button
                  onClick={() => { navigate(settingsPath); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0F0E47] hover:bg-[#EDE9FE] hover:text-[#272757] transition-colors"
                >
                  <User className="w-4 h-4 text-[#8686AC]" style={{ strokeWidth: 1.75 }} /> My Profile
                </button>
                <button
                  onClick={() => { navigate(settingsPath); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0F0E47] hover:bg-[#EDE9FE] hover:text-[#272757] transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-[#8686AC]" style={{ strokeWidth: 1.75 }} /> Settings
                </button>
                <div className="border-t border-[#E2E8F0] my-1" />
                <button
                  onClick={() => { handleLogout(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" style={{ strokeWidth: 1.75 }} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
