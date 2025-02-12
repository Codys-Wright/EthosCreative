import type { Metadata } from "next";
import "@repo/ui/globals.css";
import { AppSidebar, NavLinks } from "@repo/ui";
import {
  IconLayoutDashboard,
  IconSettings,
  IconUserBolt,
  IconDashboard,
  IconBook2,
  IconFolder,
  IconChartBar,
  IconMessages,
  IconTarget,
  IconCalendar,
} from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "My Artist Type",
  description:
    "My Artist Type with TypeScript, Tailwind CSS, NextAuth, Prisma, tRPC, and more.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const navLinks: NavLinks = {
    top: [
      {
        label: "Quick Actions",
        links: [
          {
            label: "New Project",
            href: "/dashboard/projects/new",
            icon: <IconFolder />,
          },
          {
            label: "Start Course",
            href: "/dashboard/courses/start",
            icon: <IconBook2 />,
          },
        ],
      },
      {
        label: "Overview",
        links: [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: <IconLayoutDashboard />,
          },
          {
            label: "Courses",
            href: "/dashboard/courses",
            icon: <IconBook2 />,
          },
          {
            label: "Projects",
            href: "/dashboard/projects",
            icon: <IconFolder />,
          },
        ],
      },
      {
        label: "Recent",
        links: [
          {
            label: "Last Course",
            href: "/dashboard/courses/last",
            icon: <IconBook2 />,
          },
          {
            label: "Last Project",
            href: "/dashboard/projects/last",
            icon: <IconFolder />,
          },
        ],
      },
    ],
    main: {
      label: "Features",
      links: [
        {
          label: "Profile",
          href: "/dashboard/profile",
          icon: <IconUserBolt />,
        },
        {
          label: "Charts",
          href: "/dashboard/charts",
          icon: <IconChartBar />,
          badge: {
            content: "check this out",
            variant: "info",
          },
        },
        {
          label: "Messages",
          href: "/dashboard/chats",
          icon: <IconMessages />,
          muted: true,
          badge: "admin",
        },
        {
          label: "Goals",
          href: "/dashboard/tracking",
          icon: <IconTarget />,
        },
        {
          label: "Schedule",
          href: "/dashboard/schedule",
          icon: <IconCalendar />,
        },
      ],
    },
    bottom: {
      label: "Settings",
      links: [
        {
          label: "Settings",
          href: "/dashboard/settings",
          icon: <IconSettings />,
        },
        {
          label: "Admin",
          href: "/dashboard/admin",
          icon: <IconDashboard />,
        },
      ],
    },
  };

  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
  };

  return (
    <AppSidebar navLinks={navLinks} user={mockUser} domain="My Artist Type">
      {children}
    </AppSidebar>
  );
}
