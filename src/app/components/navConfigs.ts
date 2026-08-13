import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  MessageSquare,
  HelpCircle,
  Database,
  TrendingUp,
  Trophy,
  Users,
  FileText,
  Bot,
  Building2,
  BarChart2,
  Megaphone,
  List,
  Paintbrush,
  Signal,
  User,
} from "lucide-react";
import type { NavItem } from "./DashboardLayout";

export const teacherNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/teacher" },
  { icon: GraduationCap, label: "My Classes", path: "/teacher/classes" },
  { icon: BookOpen, label: "My Quizzes", path: "/teacher/quizzes" },
  { icon: Sparkles, label: "Generate Quiz", path: "/teacher/quiz-builder" },
  { icon: Database, label: "Question Bank", path: "/teacher/question-bank" },
  { icon: BarChart3, label: "Results and Analytics", path: "/teacher/results/1" },
  { icon: MessageSquare, label: "Messages", path: "/teacher/messages" },
  { icon: Bell, label: "Notifications", path: "/teacher/notifications" },
  { icon: HelpCircle, label: "Help", path: "/teacher/help" },
  { icon: Settings, label: "Settings", path: "/teacher/settings" },
];

export const studentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student" },
  { icon: BookOpen, label: "My Quizzes", path: "/student/quizzes" },
  { icon: GraduationCap, label: "My Classes", path: "/student/classes" },
  { icon: BarChart3, label: "My Results", path: "/student/my-results" },
  { icon: TrendingUp, label: "My Progress", path: "/student/progress" },
  { icon: Trophy, label: "Leaderboard", path: "/student/leaderboard" },
  { icon: MessageSquare, label: "Messages", path: "/student/messages" },
  { icon: Bell, label: "Notifications", path: "/student/notifications" },
  { icon: HelpCircle, label: "Help", path: "/student/help" },
  { icon: Settings, label: "Settings", path: "/student/settings" },
];

export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "User Management", path: "/admin/users" },
  { icon: Building2, label: "Schools", path: "/admin/schools" },
  { icon: FileText, label: "Quiz Oversight", path: "/admin/quiz-oversight" },
  { icon: Bot, label: "AI Grading Logs", path: "/admin/grading-logs" },
  { icon: BarChart2, label: "Analytics", path: "/admin/analytics" },
  { icon: Megaphone, label: "Announcements", path: "/admin/announcements" },
  { icon: List, label: "Activity Log", path: "/admin/activity-log" },
  { icon: Paintbrush, label: "Platform Editor", path: "/admin/platform-editor" },
  { icon: Signal, label: "Platform Status", path: "/admin/platform-status" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: HelpCircle, label: "Help", path: "/admin/help" },
  { icon: Settings, label: "System Settings", path: "/admin/platform-settings" },
];

export const parentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "/parent" },
  { icon: BarChart3, label: "Results", path: "/parent/results" },
  { icon: TrendingUp, label: "Progress", path: "/parent/progress" },
  { icon: Bell, label: "Notifications", path: "/parent/notifications" },
  { icon: User, label: "Settings", path: "/parent/settings" },
];
