"use client";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
} from "@components";
import {
  SignedIn,
  SignedOut,
  UserButton,
  isAdminAtom,
  isAnonymousAtom,
} from "@auth";
import { lastResponseIdAtom } from "@quiz";
import { ModeToggle } from "@theme";
import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { useHydrated } from "@core/client";

// ============================================================================
// Types
// ============================================================================

type NavItem = { name: string; link: string };

// ============================================================================
// Constants
// ============================================================================

/** Static nav items shown to all users - never changes to prevent layout shift */
const MAIN_NAV_ITEMS: NavItem[] = [
  { name: "Artist Types", link: "/artist-types" },
  { name: "Quiz", link: "/quiz" },
  { name: "About", link: "/about" },
];

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get quiz button configuration based on user's quiz history.
 * Returns text and link for the quiz/results CTA button.
 */
function useQuizButton() {
  const lastResponseId = useAtomValue(lastResponseIdAtom);
  const isClient = useHydrated();

  const hasResults = isClient && lastResponseId !== null;

  return {
    text: hasResults ? "My Results" : "Take the Quiz!",
    href: hasResults ? `/my-response/${lastResponseId}` : "/quiz",
  };
}

// ============================================================================
// Subcomponents
// ============================================================================

type DesktopNavLinksProps = {
  items: NavItem[];
  hovered: number | null;
  onHover: (idx: number | null) => void;
};

function DesktopNavLinks({ items, hovered, onHover }: DesktopNavLinksProps) {
  return (
    <motion.div
      onMouseLeave={() => onHover(null)}
      className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2"
    >
      {items.map((item, idx) => (
        <a
          key={`desktop-link-${idx}`}
          href={item.link}
          onMouseEnter={() => onHover(idx)}
          className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-800"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
}

type MobileNavLinksProps = {
  items: NavItem[];
  onClose: () => void;
};

function MobileNavLinks({ items, onClose }: MobileNavLinksProps) {
  return (
    <>
      {items.map((item, idx) => (
        <a
          key={`mobile-link-${idx}`}
          href={item.link}
          onClick={onClose}
          className="relative text-neutral-600 dark:text-neutral-300"
        >
          <span className="block">{item.name}</span>
        </a>
      ))}
    </>
  );
}

/** Admin link - only visible to admins, rendered separately from main nav */
function AdminLink({
  variant,
  onClose,
}: {
  variant: "desktop" | "mobile";
  onClose?: () => void;
}) {
  const isAdmin = useAtomValue(isAdminAtom);
  const isClient = useHydrated();
  const isMobile = variant === "mobile";

  if (!isClient || !isAdmin) return null;

  return (
    <NavbarButton
      href="/admin"
      onClick={onClose}
      variant="secondary"
      className={isMobile ? "w-full" : undefined}
    >
      Admin
    </NavbarButton>
  );
}

type AuthButtonsProps = {
  variant: "desktop" | "mobile";
  onClose?: () => void;
};

function AuthButtons({ variant, onClose }: AuthButtonsProps) {
  const isAnonymous = useAtomValue(isAnonymousAtom);
  const isClient = useHydrated();
  const isMobile = variant === "mobile";

  return (
    <>
      <SignedOut>
        <NavbarButton
          href="/auth/sign-in"
          onClick={onClose}
          variant="secondary"
          className={isMobile ? "w-full" : undefined}
        >
          Login
        </NavbarButton>
      </SignedOut>
      <SignedIn>
        {isClient && isAnonymous ? (
          <NavbarButton
            href="/account/claim-account"
            onClick={onClose}
            variant="secondary"
            className={isMobile ? "w-full" : undefined}
          >
            {isMobile ? "Claim Your Account!" : "Claim Account"}
          </NavbarButton>
        ) : isMobile ? (
          <div className="flex justify-center">
            <UserButton size="default" />
          </div>
        ) : (
          <UserButton size="icon" />
        )}
      </SignedIn>
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NavbarHome({ children }: { children?: ReactNode }) {
  const quizButton = useQuizButton();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative w-full">
      <Navbar className="fixed inset-x-0 top-0 z-50">
        <NavBody>
          <NavbarLogo />
          {/* Static nav items - never change to prevent layout shift */}
          <DesktopNavLinks
            items={MAIN_NAV_ITEMS}
            hovered={hovered}
            onHover={setHovered}
          />
          <div className="flex items-center gap-4">
            {/* Admin link - separate from main nav, right-aligned next to profile */}
            <AdminLink variant="desktop" />
            <AuthButtons variant="desktop" />
            <NavbarButton
              href={quizButton.href}
              variant="primary"
              className="min-w-[130px] text-center"
            >
              {quizButton.text}
            </NavbarButton>
            <div className="relative z-[70]">
              <ModeToggle />
            </div>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
            <MobileNavLinks items={MAIN_NAV_ITEMS} onClose={closeMobileMenu} />
            <div className="flex w-full flex-col gap-4">
              <AdminLink variant="mobile" onClose={closeMobileMenu} />
              <AuthButtons variant="mobile" onClose={closeMobileMenu} />
              <NavbarButton
                href={quizButton.href}
                onClick={closeMobileMenu}
                variant="primary"
                className="w-full"
              >
                {quizButton.text}
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {children}
    </div>
  );
}
