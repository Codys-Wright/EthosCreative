"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "@/components/next-themes/theme-toggle";
import { useSession } from "@/lib/auth-client";
import { useMyArtistTypeOrg } from "@/lib/hooks/useMyArtistTypeOrg";

interface NavbarProps {
  navItems: { name: string; link: string }[];
}

export function Navbar({ navItems }: NavbarProps) {
  return (
    <div className="overflow-visible bg-card">
      <div className="relative z-[60] mx-auto grid w-full max-w-7xl grid-cols-3 items-center overflow-visible px-12 py-6">
        <DesktopNav />
        <div className="z-20 flex items-center justify-center overflow-visible">
          <Logo />
        </div>
        <div className="flex items-center justify-end gap-4">
          <ThemeToggle />
          <LoginButton />
          <MobileNavToggle />
        </div>
      </div>
    </div>
  );
}

const DesktopNav = () => {
  return (
    <nav className="hidden space-x-10 lg:flex">
      <Link
        className="whitespace-nowrap text-base text-foreground transition-colors hover:text-muted-foreground"
        href="/"
      >
        <span>Home</span>
      </Link>
      <Link
        className="whitespace-nowrap text-base text-foreground transition-colors hover:text-muted-foreground"
        href="/artist-types"
      >
        <span>Artist Types</span>
      </Link>
      <Link
        className="whitespace-nowrap text-base text-foreground transition-colors hover:text-muted-foreground"
        href="/about"
      >
        <span>About</span>
      </Link>
      {/* <Link
        className="whitespace-nowrap text-base text-foreground transition-colors hover:text-muted-foreground"
        href="/shop"
      >
        <span>Shop</span>
      </Link> */}
      <Link
        className="z-50 whitespace-nowrap text-base text-foreground transition-colors hover:text-muted-foreground"
        href="/contact"
      >
        <span>Contact</span>
      </Link>
    </nav>
  );
};

const MobileNavToggle = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isMyArtistTypeOrg } = useMyArtistTypeOrg();

  return (
    <>
      <IconMenu2
        onClick={() => setOpen(!open)}
        className="h-7 w-7 cursor-pointer text-foreground lg:hidden"
      />
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center space-y-12 bg-background text-2xl font-bold lg:hidden">
            <IconX
              className="absolute right-8 top-8 h-7 w-7 cursor-pointer text-foreground"
              onClick={() => setOpen(!open)}
            />
            <Link
              href="/"
              className="text-foreground transition-colors hover:text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <span>Home</span>
            </Link>
            <Link
              href="/artist-types"
              className="text-foreground transition-colors hover:text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <span>Artist Types</span>
            </Link>
            <Link
              href="/about"
              className="text-foreground transition-colors hover:text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <span>About</span>
            </Link>
            {/* <Link
              href="/shop"
              className="text-foreground transition-colors hover:text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <span>Shop</span>
            </Link> */}
            <Link
              href="/contact"
              className="z-100 text-foreground transition-colors hover:text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <span>Contact</span>
            </Link>
            <Link
              href="/my-results"
              className="text-foreground transition-colors hover:text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <span>My Results</span>
            </Link>
            {isAuthenticated && isMyArtistTypeOrg && (
              <Link
                href="/dashboard"
                className="text-foreground transition-colors hover:text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                <span>Dashboard</span>
              </Link>
            )}
            <div className="flex items-center gap-6">
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex h-[50px] w-[200px] items-center justify-center overflow-visible"
    >
      <Image
        src="/myArtistTypeLogo.svg"
        alt="My Artist Type Logo"
        width={600}
        height={150}
        className="scale-[2.5] transform-gpu overflow-visible dark:invert"
        priority
      />
    </Link>
  );
};

const LoginButton = () => {
  const { isAuthenticated, isMyArtistTypeOrg } = useMyArtistTypeOrg();

  return (
    <>
      <Link
        href="/my-results"
        className="hidden rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 lg:block"
      >
        My Results
      </Link>
      
      {isAuthenticated && isMyArtistTypeOrg && (
        <Link
          href="/dashboard"
          className="hidden ml-2 rounded-lg bg-secondary px-6 py-3 text-base font-medium text-secondary-foreground transition-colors hover:bg-secondary/90 lg:block"
        >
          Dashboard
        </Link>
      )}
    </>
  );
};
