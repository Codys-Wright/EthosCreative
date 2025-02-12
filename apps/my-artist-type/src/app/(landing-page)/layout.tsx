import type { Metadata } from "next";
import { Navbar } from "../../landing-page/components/Navbar";
import { HeroData } from "../../landing-page/data/HeroData";

export const metadata: Metadata = {
  title: "My Artist Type",
  description: "Discover your unique artist type and creative personality",
};

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar navItems={HeroData.navItems} />
      {children}
    </div>
  );
}
