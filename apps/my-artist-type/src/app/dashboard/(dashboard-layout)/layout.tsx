import type { Metadata } from "next";
import "@repo/ui/globals.css";
import { AppSidebar } from "@repo/dashboard";
import {
  IconLayoutDashboard,
  IconSettings,
  IconUserBolt,
  IconDashboard,
} from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "My Artist Type",
  description:
    "My Artist Type with TypeScript, Tailwind CSS, NextAuth, Prisma, tRPC, and more.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const mainLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconLayoutDashboard />,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: <IconUserBolt />,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <IconSettings />,
    },
  ];

  const bottomLinks = [
    {
      label: "Admin",
      href: "/dashboard/admin",
      icon: <IconDashboard />,
    },
  ];

  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
  };

  return (
    <AppSidebar mainLinks={mainLinks} bottomLinks={bottomLinks} user={mockUser}>
      {children}
    </AppSidebar>
  );
}
