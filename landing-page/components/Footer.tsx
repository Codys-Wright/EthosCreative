import { cn } from "@/lib/utils";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandSpotify,
} from "@tabler/icons-react";
import Link from "next/link";
import type React from "react";
import { HeroData } from "../data/HeroData";

export function Footer() {
  const mainLinks = HeroData.navItems;

  const legalLinks = [
    { name: "Privacy Policy", link: "/privacy" },
    { name: "Terms of Service", link: "/terms" },
  ];

  return (
    <div className="relative w-full overflow-hidden border-t border-border bg-background px-8 py-16">
      <div className="mx-auto max-w-7xl items-start justify-between text-sm text-muted-foreground md:px-8">
        <div className="relative flex w-full flex-col items-center justify-center">
          <ul className="mb-8 flex list-none flex-col gap-6 sm:flex-row">
            {mainLinks.map((item, idx) => (
              <li key={idx} className="list-none">
                <Link
                  className="transition-colors hover:text-foreground"
                  href={item.link}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="flex list-none flex-col gap-6 text-xs sm:flex-row">
            {legalLinks.map((item, idx) => (
              <li key={idx} className="list-none">
                <Link
                  className="transition-colors hover:text-foreground"
                  href={item.link}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <GridLineHorizontal className="mx-auto mt-8 max-w-7xl" />
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-between sm:flex-row">
          <p className="mb-8 text-muted-foreground sm:mb-0">
            &copy; {new Date().getFullYear()} My Artist Type. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="transition-colors hover:text-foreground">
              <IconBrandYoutube className="h-5 w-5" />
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              <IconBrandTiktok className="h-5 w-5" />
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              <IconBrandSpotify className="h-5 w-5" />
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              <IconBrandFacebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              <IconBrandInstagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset || "200px",
        } as React.CSSProperties
      }
      className={cn(
        "h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,hsl(var(--border))_50%,transparent_0)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        className,
      )}
    ></div>
  );
};
