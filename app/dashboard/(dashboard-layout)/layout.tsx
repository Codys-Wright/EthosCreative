import * as React from "react";
import { AppSidebar } from "@/components/layouts/dashboard";
import type { NavLinks } from "@/components/layouts/dashboard";
import {
  IconFolder,
  IconBook2,
  IconUserBolt,
  IconChartBar,
  IconMessages,
  IconTarget,
  IconCalendar,
  IconSettings,
  IconDashboard,
  IconUsers,
  IconPencil,
  IconClipboardList,
  IconQuestionMark,
  IconBuilding,
  IconUser,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
}

type User = {
  name: string;
  email: string;
  image?: string;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const navLinks: NavLinks = {
    top: [
      {
        label: "Overview",
        links: [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: <IconChartBar />,
            badge: {
              content: "Not Implemented",
              variant: "default",
            },
          },
        ],
      },
      {
        label: "Quiz",
        links: [
          {
            label: "Quiz Editor",
            href: "/dashboard/quiz",
            icon: <IconClipboardList />,
            badge: {
              content: "Editor",
              variant: "default",
            },
          },
        ],
      },
      {
        label: "CRM",
        links: [
          {
            label: "Company",
            href: "/dashboard/crm/company",
            icon: <IconBuilding />,
            badge: {
              content: "Not Implemented",
              variant: "default",
            },
          },
          {
            label: "Front Page",
            href: "/dashboard/crm/front-page",
            icon: <IconBook2 />,
            badge: {
              content: "Not Implemented",
              variant: "default",
            },
          },
          {
            label: "Artist Types",
            href: "/dashboard/crm/artist-type",
            icon: <IconUserBolt />,
            badge: {
              content: "Not Implemented",
              variant: "default",
            },
          },
        ],
      },
      {
        label: "Manage",
        links: [
          {
            label: "Users",
            href: "/dashboard/manage/users",
            icon: <IconUsers />,
            badge: {
              content: "Not Implemented",
              variant: "default",
            },
          },
        ],
      },
    ],
  };

  return (
    <AppSidebar navLinks={navLinks} domain="My Artist Type">
      {children}
    </AppSidebar>
  );
}
