"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconChevronDown,
  IconChevronUp,
  IconPalette,
} from "@tabler/icons-react";
import { ArtistTypeData } from "../data/ArtistTypeData";
import Link from "next/link";
import { Button } from "@repo/ui";

export function ArtistTypeFolddown() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex h-full flex-col">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <IconPalette className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <h2 className="whitespace-nowrap text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Explore the Artist Types
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Discover your unique artistic personality and creative style. Each
              type represents a distinct approach to art and creativity.
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Link href="/artist-types">
              <Button variant="outline" size="lg" className="text-base">
                See Full Description of Types
              </Button>
            </Link>
          </div>
        </div>

        <div className="min-h-[400px] divide-y divide-border">
          {ArtistTypeData.map((artistType, index) => (
            <ArtistTypeItem
              key={index}
              name={artistType.name}
              shortDescription={artistType.shortDescription}
              open={open}
              setOpen={setOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const ArtistTypeItem = ({
  name,
  shortDescription,
  setOpen,
  open,
}: {
  name: string;
  shortDescription: string;
  open: string | null;
  setOpen: (open: string | null) => void;
}) => {
  const isOpen = open === name;

  return (
    <div
      className="cursor-pointer py-6 transition-all first:pt-0 last:pb-0"
      onClick={() => {
        if (isOpen) {
          setOpen(null);
        } else {
          setOpen(name);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground md:text-xl">
          {name}
        </h3>
        <div className="ml-4 flex-shrink-0">
          {isOpen ? (
            <IconChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <IconChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden text-muted-foreground"
          >
            <p className="mt-4 text-base leading-relaxed">{shortDescription}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
