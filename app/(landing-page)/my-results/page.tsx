"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyResultsPage() {
  const { data: session } = useSession();

  if (!session?.session) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your artist type results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need to be signed in to access your personal results. If you haven't taken the quiz yet, you'll be able to do so after signing in.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/sign-in" className="w-full">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">My Artist Type Results</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Results</CardTitle>
          <CardDescription>
            View your artist type and personalized insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your results will be displayed here. If you haven't taken the quiz yet, you can do so now.
          </p>
          <Link href="/quiz">
            <Button variant="outline">Take the Quiz</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
