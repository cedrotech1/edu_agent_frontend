import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";
import { LandingPage } from "./pages/auth/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
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
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUserManagement } from "./pages/admin/AdminUserManagement";
import { AdminQuizOversight } from "./pages/admin/AdminQuizOversight";
import { AdminGradingLogs } from "./pages/admin/AdminGradingLogs";
import { AdminPlatformSettings } from "./pages/admin/AdminPlatformSettings";
import { AdminSubscriptionPlan } from "./pages/admin/AdminSubscriptionPlan";
import { AdminBillingPayment } from "./pages/admin/AdminBillingPayment";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { StyleGuide } from "./pages/admin/StyleGuide";
import { ProtectedRoute } from "./components/ProtectedRoute";

function protect(Component: ComponentType, role?: "teacher" | "student" | "admin") {
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
  { path: "/onboarding/teacher", Component: protect(TeacherOnboarding, "teacher") },
  { path: "/onboarding/student", Component: protect(StudentOnboarding, "student") },
  { path: "/teacher", Component: protect(TeacherDashboard, "teacher") },
  { path: "/teacher/class/:classId", Component: protect(ClassDetail, "teacher") },
  { path: "/teacher/quiz-builder", Component: protect(QuizBuilder, "teacher") },
  { path: "/teacher/results/:quizId", Component: protect(QuizResults, "teacher") },
  { path: "/teacher/results/:quizId/flagged", Component: protect(FlaggedAnswers, "teacher") },
  { path: "/teacher/settings", Component: protect(TeacherSettings, "teacher") },
  { path: "/student", Component: protect(StudentDashboard, "student") },
  { path: "/student/quiz/:quizId", Component: protect(QuizTaking, "student") },
  { path: "/student/results/:quizId", Component: protect(StudentResults, "student") },
  { path: "/student/quiz-closed", Component: protect(QuizClosed, "student") },
  { path: "/student/settings", Component: protect(StudentSettings, "student") },
  { path: "/admin", Component: protect(AdminDashboard, "admin") },
  { path: "/admin/users", Component: protect(AdminUserManagement, "admin") },
  { path: "/admin/quiz-oversight", Component: protect(AdminQuizOversight, "admin") },
  { path: "/admin/grading-logs", Component: protect(AdminGradingLogs, "admin") },
  { path: "/admin/platform-settings", Component: protect(AdminPlatformSettings, "admin") },
  { path: "/admin/subscription", Component: protect(AdminSubscriptionPlan, "admin") },
  { path: "/admin/billing", Component: protect(AdminBillingPayment, "admin") },
  { path: "/admin/settings", Component: protect(AdminSettings, "admin") },
  { path: "/admin/style-guide", Component: StyleGuide },
]);
