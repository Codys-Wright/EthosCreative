"use client";

import { SignIn } from "@repo/auth";
import { SignUp } from "@repo/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import { authClient } from "@repo/auth";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    authClient.oneTap();
  }, []);

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="md:w-[400px]">
          <Tabs defaultValue="sign-in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in">
              <SignIn />
            </TabsContent>
            <TabsContent value="sign-up">
              <SignUp />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
