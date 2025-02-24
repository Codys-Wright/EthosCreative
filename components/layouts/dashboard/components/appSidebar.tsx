"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconLayoutDashboard,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

// Badge variants
export const BADGE_VARIANTS = {
  default: "default",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
} as const;

export type BadgeVariant = keyof typeof BADGE_VARIANTS;

// Badge presets
export const BADGE_PRESETS = {
  new: {
    content: "New",
    variant: "success" as const,
  },
  comingSoon: {
    content: "Coming Soon",
    variant: "info" as const,
  },
  beta: {
    content: "Beta",
    variant: "warning" as const,
  },
  hidden: {
    content: "Hidden",
    variant: "default" as const,
  },
  developer: {
    content: "Developer",
    variant: "error" as const,
  },
  admin: {
    content: "Admin",
    variant: "error" as const,
  },
} as const;

export type BadgePreset = keyof typeof BADGE_PRESETS;

interface CustomBadge {
  content: string;
  variant?: BadgeVariant;
}

type Badge = BadgePreset | CustomBadge;

export interface NavLink {
  label: string | React.ReactElement;
  href: string;
  icon: React.ReactElement;
  badge?: Badge;
  muted?: boolean;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export interface NavLinks {
  top?: NavGroup[] | NavGroup;
  main?: NavGroup;
  bottom?: NavGroup;
}

interface User {
  name: string;
  email: string;
  image?: string;
}

export interface AppSidebarProps {
  children: React.ReactNode;
  navLinks?: NavLinks;
  user?: User;
  logo?: React.ReactNode;
  domain?: string;
}

interface SidebarItemProps {
  item: NavLink;
  setOpen: (open: boolean) => void;
}

function SidebarGroup({ group, setOpen, open }: { group: NavGroup; setOpen: (open: boolean) => void; open: boolean }) {
  return (
    <div className="flex flex-col gap-2 px-[0.15rem]">
      {group.links.map((item, idx) => (
        <SidebarItem
          key={idx}
          item={item}
          setOpen={setOpen}
        />
      ))}
    </div>
  );
}

function SidebarItem({ item, setOpen }: SidebarItemProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isActive = pathname === item.href;

  const handleClick = () => {
    if (isMobile && !item.muted) {
      setOpen(false);
    }
  };

  const getBadgeColor = (variant: string = "default") => {
    switch (variant) {
      case "success":
        return "bg-green-500/10 text-green-500 dark:bg-green-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 dark:bg-red-500/20";
      case "info":
        return "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-500 dark:bg-neutral-500/20";
    }
  };

  const getBadgeContent = (badge: Badge) => {
    if (typeof badge === "string") {
      return BADGE_PRESETS[badge];
    }
    return badge;
  };

  return (
    <div onClick={handleClick} className={cn(item.muted && "pointer-events-none")}>
      <SidebarLink
        link={{
          label: (
            <div className="flex items-center w-full min-h-[20px]">
              <span className={cn(item.muted && "text-neutral-400 dark:text-neutral-600")}>
                {item.label}
              </span>
              {item.badge && (
                <span className={cn(
                  "text-[10px] leading-[1.2] px-1.5 py-[0.15rem] rounded-full font-medium ml-2 flex-shrink-0",
                  getBadgeColor(getBadgeContent(item.badge).variant)
                )}>
                  {getBadgeContent(item.badge).content}
                </span>
              )}
            </div>
          ),
          href: item.muted ? "#" : item.href,
          icon: React.cloneElement(item.icon, {
            // @ts-ignore
            className: cn(
              "h-5 w-5 flex-shrink-0",
              item.muted 
                ? "text-neutral-400 dark:text-neutral-600" 
                : isActive 
                  ? "text-blue-600" 
                  : "text-neutral-700 dark:text-neutral-200"
            ),
          }),
        }}
        className={cn(
          isActive && !item.muted && "text-blue-600 dark:text-blue-400",
          item.muted && "pointer-events-none"
        )}
      />
    </div>
  );
}

export function AppSidebar({ 
  children, 
  navLinks = {},
  user,
  logo = <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />,
  domain = "App"
}: AppSidebarProps) {
  const [open, setOpen] = useState(false);

  // Check if multiple groups exist
  const hasMultipleGroups = [navLinks.top, navLinks.main, navLinks.bottom].filter(Boolean).length > 1;

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <Link
              href="#"
              className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
            >
              {logo}
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-black dark:text-white whitespace-pre"
                >
                  {domain}
                </motion.span>
              )}
            </Link>
            <div className="flex flex-col flex-1 mt-8">
              {/* Top Group */}
              {navLinks.top && (
                <div className="flex-shrink-0">
                  {Array.isArray(navLinks.top) ? (
                    navLinks.top.map((group, index) => (
                      <React.Fragment key={index}>
                        <SidebarGroup group={group} setOpen={setOpen} open={open} />
                        {Array.isArray(navLinks.top) && index < navLinks.top.length - 1 && (
                          <div className="relative h-px my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ opacity: open ? 1 : 0 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 px-2">
                                {navLinks.top[index + 1]?.label}
                              </span>
                            </motion.div>
                          </div>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <SidebarGroup group={navLinks.top} setOpen={setOpen} open={open} />
                  )}
                </div>
              )}
              
              {/* Spacer */}
              <div className="flex-1" />
              
              {/* Center Group */}
              {navLinks.main && (
                <div className="flex-shrink-0">
                  <div className="w-full">
                    {hasMultipleGroups && navLinks.top && (
                      <div className="relative h-px my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                        <motion.div
                          initial={false}
                          animate={{ opacity: open ? 1 : 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 px-2">
                            {navLinks.main.label}
                          </span>
                        </motion.div>
                      </div>
                    )}
                    <SidebarGroup group={navLinks.main} setOpen={setOpen} open={open} />
                  </div>
                </div>
              )}
              
              {/* Spacer */}
              <div className="flex-1" />
              
              {/* Bottom Group */}
              {navLinks.bottom && (
                <div className="flex-shrink-0 pb-4">
                  {hasMultipleGroups && (navLinks.top || navLinks.main) && (
                    <div className="relative h-px my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700" />
                      </div>
                      <motion.div
                        initial={false}
                        animate={{ opacity: open ? 1 : 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 px-2">
                          {navLinks.bottom.label}
                        </span>
                      </motion.div>
                    </div>
                  )}
                  <SidebarGroup group={navLinks.bottom} setOpen={setOpen} open={open} />
                </div>
              )}
            </div>
          </div>
          {user && (
            <div className="mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <SidebarLink
                link={{
                  label: (
                    <div className="flex flex-col -my-1">
                      <span className="leading-none">{user.name}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 leading-none mt-1">{user.email}</span>
                    </div>
                  ),
                  href: "/dashboard/profile",
                  icon: user.image ? (
                    <Image
                      src={user.image}
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                  ),
                }}
              />
            </div>
          )}
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 overflow-hidden">
        <div className="px-2 md:px-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

