"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function MyResultsPage() {
  const { data: session } = useSession();

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Your Artist Type Results</CardTitle>
          <CardDescription>
            View your artist type and personalized insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your results will be displayed here. If you haven't taken the quiz
            yet, you can do so now.
          </p>
          <Link href="/quiz">
            <Button variant="outline">Take the Quiz</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
