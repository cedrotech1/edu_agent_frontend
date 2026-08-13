import type { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout";
import {
  adminNavItems,
  parentNavItems,
  studentNavItems,
  teacherNavItems,
} from "./navConfigs";
import { initials } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Role = "teacher" | "student" | "admin" | "parent";

const navByRole = {
  teacher: teacherNavItems,
  student: studentNavItems,
  admin: adminNavItems,
  parent: parentNavItems,
} as const;

const defaultName: Record<Role, string> = {
  teacher: "Teacher",
  student: "Student",
  admin: "Admin",
  parent: "Parent",
};

interface AppShellProps {
  role: Role;
  pageTitle: string;
  children: ReactNode;
  /** Show "Pending" badge — page still uses mock/incomplete features */
  pending?: boolean;
}

export function AppShell({ role, pageTitle, children, pending = false }: AppShellProps) {
  const { user } = useAuth();
  const userName = user?.name || defaultName[role];
  const userInitials = initials(userName);

  return (
    <DashboardLayout
      navItems={navByRole[role]}
      role={role}
      pageTitle={pageTitle}
      pending={pending}
      userName={userName}
      userInitials={userInitials}
      settingsPath={`/${role}/settings`}
    >
      {children}
    </DashboardLayout>
  );
}
