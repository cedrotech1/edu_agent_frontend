import { createBrowserRouter, Navigate } from "react-router";
import type { ComponentType } from "react";
import { LandingPage } from "./pages/auth/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { HowItWorks } from "./pages/auth/HowItWorks";
import { TeacherOnboarding } from "./pages/auth/TeacherOnboarding";
import { StudentOnboarding } from "./pages/auth/StudentOnboarding";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { ClassDetail } from "./pages/teacher/ClassDetail";
import { QuizBuilder } from "./pages/teacher/QuizBuilder";
import { QuizResults } from "./pages/teacher/QuizResults";
import { FlaggedAnswers } from "./pages/teacher/FlaggedAnswers";
import { TeacherSettings } from "./pages/teacher/TeacherSettings";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { QuizTaking } from "./pages/student/QuizTaking";
import { StudentResults } from "./pages/student/StudentResults";
import { QuizClosed } from "./pages/student/QuizClosed";
import { StudentSettings } from "./pages/student/StudentSettings";
import { StudentQuizzes } from "./pages/student/StudentQuizzes";
import { StudentClasses } from "./pages/student/StudentClasses";
import { StudentClassDetail } from "./pages/student/StudentClassDetail";
import { StudentMyResults } from "./pages/student/StudentMyResults";
import { StudentProgress } from "./pages/student/StudentProgress";
import { QuizLobby } from "./pages/student/QuizLobby";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUserManagement } from "./pages/admin/AdminUserManagement";
import { AdminQuizOversight } from "./pages/admin/AdminQuizOversight";
import { AdminGradingLogs } from "./pages/admin/AdminGradingLogs";
import { AdminPlatformSettings } from "./pages/admin/AdminPlatformSettings";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminSchools } from "./pages/admin/AdminSchools";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminAnnouncements } from "./pages/admin/AdminAnnouncements";
import { TeacherAnnouncements, StudentAnnouncements } from "./pages/shared/AnnouncementsPage";
import {
  AdminSubmissionDetail,
  TeacherSubmissionDetail,
} from "./pages/shared/SubmissionDetailPage";
import { AdminActivityLog } from "./pages/admin/AdminActivityLog";
import { AdminQuizSubmissions } from "./pages/admin/AdminQuizSubmissions";
import { StyleGuide } from "./pages/admin/StyleGuide";
import { MyClasses } from "./pages/teacher/MyClasses";
import { MyQuizzes } from "./pages/teacher/MyQuizzes";
import { TeacherHelp } from "./pages/help/TeacherHelp";
import { StudentHelp } from "./pages/help/StudentHelp";
import { AdminHelp } from "./pages/help/AdminHelp";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TeacherNotifications } from "./pages/teacher/TeacherNotifications";
import { TeacherResults } from "./pages/teacher/TeacherResults";
import { StudentNotifications } from "./pages/student/StudentNotifications";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { SearchResults } from "./pages/SearchResults";
import { PasswordResetSuccess } from "./pages/auth/PasswordResetSuccess";
import { TeacherMessages } from "./pages/teacher/TeacherMessages";
import { StudentMessages } from "./pages/student/StudentMessages";
import { AdminMessages } from "./pages/admin/AdminMessages";
import { NotFound } from "./pages/NotFound";
import { SessionExpired } from "./pages/SessionExpired";
import { TwoFactorLogin } from "./pages/auth/TwoFactorLogin";
import { AdminPlatformStatus } from "./pages/admin/AdminPlatformStatus";
import { PublicQuizTaking } from "./pages/quiz/PublicQuizTaking";
import { PublicQuizThankYou } from "./pages/quiz/PublicQuizThankYou";
import { ProtectedRoute } from "./components/ProtectedRoute";
import type { UserRole } from "@/lib/api";

function protect(Component: ComponentType, role?: UserRole) {
  return function Protected() {
    return (
      <ProtectedRoute role={role}>
        <Component />
      </ProtectedRoute>
    );
  };
}

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/how-it-works", Component: HowItWorks },
  { path: "/login", Component: LoginPage },
  { path: "/signup", Component: SignUpPage },
  { path: "/verify-email", Component: VerifyEmailPage },
  { path: "/2fa", Component: TwoFactorLogin },
  { path: "/quiz/public/:quizId", Component: PublicQuizTaking },
  { path: "/quiz/public-thank-you", Component: PublicQuizThankYou },
  { path: "/onboarding/teacher", Component: protect(TeacherOnboarding, "teacher") },
  { path: "/onboarding/student", Component: protect(StudentOnboarding, "student") },

  // Teacher routes
  { path: "/teacher", Component: protect(TeacherDashboard, "teacher") },
  { path: "/teacher/classes", Component: protect(MyClasses, "teacher") },
  { path: "/teacher/quizzes", Component: protect(MyQuizzes, "teacher") },
  { path: "/teacher/class/:classId", Component: protect(ClassDetail, "teacher") },
  { path: "/teacher/quiz-builder", Component: protect(QuizBuilder, "teacher") },
  { path: "/teacher/results", Component: protect(TeacherResults, "teacher") },
  { path: "/teacher/results/:quizId", Component: protect(QuizResults, "teacher") },
  { path: "/teacher/results/:quizId/flagged", Component: protect(FlaggedAnswers, "teacher") },
  {
    path: "/teacher/results/:quizId/submission/:submissionId",
    Component: protect(TeacherSubmissionDetail, "teacher"),
  },
  { path: "/teacher/settings", Component: protect(TeacherSettings, "teacher") },
  { path: "/teacher/help", Component: protect(TeacherHelp, "teacher") },
  { path: "/teacher/notifications", Component: protect(TeacherNotifications, "teacher") },
  { path: "/teacher/messages", Component: protect(TeacherMessages, "teacher") },
  { path: "/teacher/announcements", Component: protect(TeacherAnnouncements, "teacher") },

  // Student routes
  { path: "/student", Component: protect(StudentDashboard, "student") },
  { path: "/student/quizzes", Component: protect(StudentQuizzes, "student") },
  { path: "/student/classes", Component: protect(StudentClasses, "student") },
  { path: "/student/classes/:classId", Component: protect(StudentClassDetail, "student") },
  { path: "/student/my-results", Component: protect(StudentMyResults, "student") },
  { path: "/student/progress", Component: protect(StudentProgress, "student") },
  { path: "/student/quiz/:quizId/lobby", Component: protect(QuizLobby, "student") },
  { path: "/student/quiz/:quizId", Component: protect(QuizTaking, "student") },
  { path: "/student/results/:quizId", Component: protect(StudentResults, "student") },
  { path: "/student/quiz-closed", Component: protect(QuizClosed, "student") },
  { path: "/student/settings", Component: protect(StudentSettings, "student") },
  { path: "/student/help", Component: protect(StudentHelp, "student") },
  { path: "/student/notifications", Component: protect(StudentNotifications, "student") },
  { path: "/student/messages", Component: protect(StudentMessages, "student") },
  { path: "/student/announcements", Component: protect(StudentAnnouncements, "student") },

  // Admin routes
  { path: "/admin", Component: protect(AdminDashboard, "admin") },
  { path: "/admin/users", Component: protect(AdminUserManagement, "admin") },
  { path: "/admin/quiz-oversight", Component: protect(AdminQuizOversight, "admin") },
  { path: "/admin/grading-logs", Component: protect(AdminGradingLogs, "admin") },
  { path: "/admin/platform-settings", Component: protect(AdminPlatformSettings, "admin") },
  { path: "/admin/settings", Component: protect(AdminSettings, "admin") },
  { path: "/admin/schools", Component: protect(AdminSchools, "admin") },
  { path: "/admin/analytics", Component: protect(AdminAnalytics, "admin") },
  { path: "/admin/platform-editor", element: <Navigate to="/admin/platform-settings" replace /> },
  { path: "/admin/announcements", Component: protect(AdminAnnouncements, "admin") },
  { path: "/admin/activity-log", Component: protect(AdminActivityLog, "admin") },
  { path: "/admin/quiz/:quizId/submissions", Component: protect(AdminQuizSubmissions, "admin") },
  {
    path: "/admin/quiz/:quizId/submissions/:submissionId",
    Component: protect(AdminSubmissionDetail, "admin"),
  },
  { path: "/admin/help", Component: protect(AdminHelp, "admin") },
  { path: "/admin/notifications", Component: protect(AdminNotifications, "admin") },
  { path: "/admin/messages", Component: protect(AdminMessages, "admin") },
  { path: "/admin/platform-status", Component: protect(AdminPlatformStatus, "admin") },
  { path: "/admin/style-guide", Component: StyleGuide },

  // Public utility routes
  { path: "/search", Component: SearchResults },
  { path: "/password-reset-success", Component: PasswordResetSuccess },
  { path: "/terms", Component: TermsOfService },
  { path: "/privacy", Component: PrivacyPolicy },
  { path: "/session-expired", Component: SessionExpired },
  { path: "*", Component: NotFound },
]);
