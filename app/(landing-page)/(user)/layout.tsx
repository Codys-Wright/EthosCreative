"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Redirect to sign-in if not authenticated
  if (!session?.session) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access this page. If you haven't taken the quiz yet, 
            you'll be able to do so after signing in.
          </p>
          <Link href="/sign-in" className="w-full">
            <Button className="w-full">Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname.includes("/profile")) return "profile";
    return "my-results";
  };

  return (
    <div className="container mx-auto py-8">
      
      <Tabs 
        defaultValue={getActiveTab()} 
        className="w-full mb-8"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-results" asChild>
            <Link href="/my-results">My Results</Link>
          </TabsTrigger>
          <TabsTrigger value="profile" asChild>
            <Link href="/profile">My Profile</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
} 