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
import { cn } from "@repo/ui/lib/utils";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@repo/ui";

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactElement;
}

interface User {
  name: string;
  email: string;
  image?: string;
}

interface AppSidebarProps {
  children: React.ReactNode;
  mainLinks?: NavLink[];
  bottomLinks?: NavLink[];
  user?: User;
  logo?: React.ReactNode;
  domain?: string;
}

interface SidebarItemProps {
  item: NavLink;
  setOpen: (open: boolean) => void;
}

function SidebarItem({ item, setOpen }: SidebarItemProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isActive = pathname === item.href;

  const handleClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <div onClick={handleClick}>
      <SidebarLink
        link={{
          label: item.label,
          href: item.href,
          icon: React.cloneElement(item.icon, {
            className: cn(
              "h-5 w-5 flex-shrink-0",
              isActive ? "text-blue-600" : "text-neutral-700 dark:text-neutral-200"
            ),
          }),
        }}
        className={cn(isActive && "text-blue-600 dark:text-blue-400")}
      />
    </div>
  );
}

export function AppSidebar({ 
  children, 
  mainLinks = [], 
  bottomLinks = [], 
  user,
  logo = <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />,
  domain = "App"
}: AppSidebarProps) {
  const [open, setOpen] = useState(false);

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
            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                {mainLinks.map((item, idx) => (
                  <SidebarItem
                    key={`main-${idx}`}
                    item={item}
                    setOpen={setOpen}
                  />
                ))}
              </div>
              {bottomLinks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="h-px bg-neutral-200 dark:bg-neutral-700 mx-2" />
                  {bottomLinks.map((item, idx) => (
                    <SidebarItem
                      key={`bottom-${idx}`}
                      item={item}
                      setOpen={setOpen}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {user && (
            <div>
              <SidebarLink
                link={{
                  label: user.name,
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

