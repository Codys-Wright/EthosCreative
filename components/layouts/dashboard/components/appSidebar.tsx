"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconLayoutDashboard,
  IconSettings,
  IconUserBolt,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession, signOut } from "@/lib/auth-client";

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

function SidebarGroup({
  group,
  setOpen,
  open,
}: {
  group: NavGroup;
  setOpen: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 px-[0.15rem]">
      {group.links.map((item, idx) => (
        <SidebarItem key={idx} item={item} setOpen={setOpen} />
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
    <div
      onClick={handleClick}
      className={cn(item.muted && "pointer-events-none")}
    >
      <SidebarLink
        link={{
          label: (
            <div className="flex items-center w-full min-h-[20px]">
              <span
                className={cn(
                  item.muted && "text-neutral-400 dark:text-neutral-600",
                )}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] leading-[1.2] px-1.5 py-[0.15rem] rounded-full font-medium ml-2 flex-shrink-0",
                    getBadgeColor(getBadgeContent(item.badge).variant),
                  )}
                >
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
                  : "text-neutral-700 dark:text-neutral-200",
            ),
          }),
        }}
        className={cn(
          isActive && !item.muted && "text-blue-600 dark:text-blue-400",
          item.muted && "pointer-events-none",
        )}
      />
    </div>
  );
}

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  open: boolean;
}

function UserMenu({ user, open }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isGuest = user.email === "guest@example.com";
  const [imageError, setImageError] = useState(false);

  return (
    <div className="mt-auto pt-4 border-t border-border relative">
      <div
        className={cn(
          "flex items-center py-2 cursor-pointer",
          open ? "gap-3 justify-start" : "justify-center",
        )}
        onClick={() => open && setShowMenu(!showMenu)}
      >
        <div className={cn("flex-shrink-0 relative", !open && "mx-auto")}>
          <div className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {user.image && !imageError ? (
              <Image
                src={user.image}
                alt={user.name}
                width={36}
                height={36}
                className="h-full w-full object-cover"
                unoptimized={true}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-lg font-semibold text-muted-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {open && !isGuest && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background dark:border-background"></div>
          )}
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-medium text-sm truncate max-w-[170px] text-foreground">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[170px]">
              {user.email}
            </span>
          </motion.div>
        )}

        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto"
          >
            <div className="p-1.5 hover:bg-accent rounded-full transition-colors">
              <IconSettings className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Dropdown Menu */}
      {open && showMenu && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-popover rounded-md shadow-lg border border-border py-1 z-50">
          {isGuest ? (
            <Link
              href="/sign-in"
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary w-full text-left hover:bg-accent transition-colors"
            >
              <IconUser className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <IconUser className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <IconSettings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <div className="border-t border-border my-1"></div>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.href = "/";
                  } catch (error) {
                    console.error("Error signing out:", error);
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-destructive w-full text-left hover:bg-accent transition-colors"
              >
                <IconLogout className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function AppSidebar({
  children,
  navLinks = {},
  user: propUser,
  logo = (
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
  ),
  domain = "App",
}: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // If user prop is provided, use it
    if (propUser) {
      setUser(propUser);
    }
    // Otherwise use the session user if available
    else if (session?.user) {
      // Ensure user image is a valid URL or undefined
      let userImage = undefined;
      if (session.user.image) {
        try {
          // Check if it's a valid URL or data URI
          if (
            session.user.image.startsWith("data:") ||
            session.user.image.startsWith("http") ||
            session.user.image.startsWith("/")
          ) {
            userImage = session.user.image;
          }
        } catch (e) {
          console.error("Invalid user image URL", e);
        }
      }

      setUser({
        name: session.user.name || "User",
        email: session.user.email || "",
        image: userImage,
      });
    }
    // Fallback to guest user
    else if (!isPending) {
      setUser({
        name: "Guest User",
        email: "guest@example.com",
        image: "",
      });
    }
  }, [propUser, session, isPending]);

  // Check if multiple groups exist
  const hasMultipleGroups =
    [navLinks.top, navLinks.main, navLinks.bottom].filter(Boolean).length > 1;

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <Link
              href="/"
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
              {/* Navigation groups */}
              {/* Top Group */}
              {navLinks.top && (
                <div className="flex-shrink-0">
                  {Array.isArray(navLinks.top) ? (
                    navLinks.top.map((group, index) => (
                      <React.Fragment key={index}>
                        <SidebarGroup
                          group={group}
                          setOpen={setOpen}
                          open={open}
                        />
                        {index !== (navLinks.top as NavGroup[]).length - 1 && (
                          <div className="h-1 my-4"></div>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <SidebarGroup
                      group={navLinks.top}
                      setOpen={setOpen}
                      open={open}
                    />
                  )}
                </div>
              )}
              {navLinks.main && (
                <>
                  {hasMultipleGroups && <div className="h-1 my-4"></div>}
                  <SidebarGroup
                    group={navLinks.main}
                    setOpen={setOpen}
                    open={open}
                  />
                </>
              )}
              {navLinks.bottom && (
                <>
                  {hasMultipleGroups && <div className="h-1 my-4"></div>}
                  <SidebarGroup
                    group={navLinks.bottom}
                    setOpen={setOpen}
                    open={open}
                  />
                </>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          {user && <UserMenu user={user} open={open} />}
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
