/**
 * Navbar Component
 *
 * A simple navigation bar for the landing page with logo and account info.
 * Shows sign in button when logged out, user button when logged in.
 */

import { Link } from "@tanstack/react-router";
import { useAtomValue } from "@effect-atom/atom-react";
import { Button } from "@shadcn";
import {
  Music,
  LogIn,
  MessageSquare,
  Settings,
  FlaskConical,
} from "lucide-react";
import { UserButton, SignedIn, SignedOut, sessionAtom } from "@auth";

export function Navbar() {
  const sessionResult = useAtomValue(sessionAtom);
  const session = sessionResult._tag === "Success" ? sessionResult.value : null;
  const isInstructor =
    session?.user?.role === "admin" ||
    session?.user?.role === "superadmin" ||
    session?.user?.role === "instructor";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Songmaking</span>
          </Link>

          {/* Account Section */}
          <div className="flex items-center gap-3">
            <SignedIn>
              {isInstructor && (
                <>
                  <Link
                    to="/$courseSlug"
                    params={{ courseSlug: "example-course" }}
                  >
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FlaskConical className="w-4 h-4" />
                      <span className="hidden sm:inline">Example Course</span>
                    </Button>
                  </Link>
                  <Link
                    to="/$courseSlug/admin"
                    params={{ courseSlug: "songmaking" }}
                    search={{ tab: "overview" }}
                  >
                    <Button variant="ghost" size="icon" className="relative">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                </>
              )}
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>
              <UserButton size="default" />
            </SignedIn>
            <SignedOut>
              <Link to="/auth/$authView" params={{ authView: "sign-in" }}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/$authView" params={{ authView: "sign-up" }}>
                <Button size="sm">Get Started</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
