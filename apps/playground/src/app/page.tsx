import Link from "next/link";
import { Button, Badge, Switch } from "@repo/ui";

export default function HomePage() {
  return (
    <main>
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Button className="bg-red-500">Click me</Button>
        <Badge>Click me</Badge>
        <Switch />
      </div>
    </main>
  );
}
