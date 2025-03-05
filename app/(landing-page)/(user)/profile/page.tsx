import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "@/lib/better-auth/components/user-card";
import AccountSwitcher from "@/lib/better-auth/components/account-switch";

// Custom profile page that doesn't show the organization card
export default async function ProfilePage() {
  const [session, activeSessions, deviceSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      headers: await headers(),
    }),
  ]).catch((e) => {
    throw redirect("/sign-in");
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="w-full p-4">
        <div className="flex gap-4 flex-col">
          <AccountSwitcher
            sessions={JSON.parse(JSON.stringify(deviceSessions))}
          />
          <UserCard
            session={JSON.parse(JSON.stringify(session))}
            activeSessions={JSON.parse(JSON.stringify(activeSessions))}
          />
          {/* OrganizationCard is intentionally omitted for the /profile route */}
        </div>
      </div>
    </div>
  );
}
