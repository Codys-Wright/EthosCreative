"use client";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Blog } from "../types/Blog";

interface BlogContentWithTocProps {
  blog: Blog;
  showAuthor?: boolean;
}

function extractHeadings(content: string) {
  const headings: { title: string; href: string }[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    // Match ## or ### headings
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match?.[2]) {
      const title = match[2].trim();
      const href = "#" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      headings.push({ title, href });
    }
  });

  return headings;
}

export function BlogContentWithToc({ blog, showAuthor = true }: BlogContentWithTocProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse the date once during component initialization
  const parsedDate = new Date(blog.date);
  const formattedDate = !isNaN(parsedDate.getTime())
    ? format(parsedDate, "LLLL d, yyyy")
    : blog.date;

  const headings = extractHeadings(blog.content);

  return (
    <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-[250px_1fr_400px]">
      <Toc mounted={mounted} links={headings} />

      {/* Content */}
      <div className="row-start-3 flex max-w-[50rem] flex-1 flex-col md:row-start-3 lg:col-start-2 lg:row-auto">
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-black dark:text-white md:text-4xl lg:text-5xl">
          {blog.title}
        </h2>

        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-lg prose-p:leading-relaxed prose-a:text-primary prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-strong:text-primary prose-em:text-neutral-600 dark:prose-em:text-neutral-400 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2 prose-img:rounded-xl mt-10 max-w-none">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>

        {showAuthor && (
          <>
          <div className="mt-10 max-w-2xl">
            <div className="h-px w-full bg-neutral-200 dark:bg-neutral-900" />
            <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800" />
          </div>
          <div className="mt-10 flex items-center">
            <Image
              src={blog.authorImage}
              alt={blog.author}
              className="h-8 w-8 rounded-full"
              height={32}
              width={32}
            />
            <p className="pl-2 text-sm text-neutral-600 dark:text-neutral-400">
              {blog.author}
            </p>
            <div className="mx-2 h-1 w-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <p className="pl-1 text-sm text-neutral-600 dark:text-neutral-400">
              {formattedDate}
            </p>
          </div>
          </>
        )}
      </div>

      {/* Image - shown at top on mobile and medium, right side on desktop */}
      <div className="row-start-2 block md:row-start-2 lg:sticky lg:top-20 lg:col-start-3 lg:row-auto lg:h-[calc(100vh-5rem)]">
        <div className="relative mx-auto h-60 w-full max-w-[400px] md:h-[30rem] lg:h-[600px] lg:max-h-[calc(100vh-8rem)]">
          <Image
            src={blog.thumbnail}
            alt={blog.title}
            className="rounded-3xl object-cover object-center"
            fill
            priority
            sizes="(max-width: 1024px) 400px, 400px"
          />
        </div>
      </div>
    </div>
  );
}

interface TocProps {
  mounted: boolean;
  links: { title: string; href: string }[];
}

const Toc = ({ mounted, links }: TocProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="sticky left-0 top-20 hidden max-w-xs flex-col self-start pr-10 lg:flex">
      {links.map((link, index) => (
        <Link
          className="group/toc-link relative rounded-lg px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200"
          key={link.href}
          href={link.href}
          onMouseEnter={mounted ? () => setHovered(index) : undefined}
          onMouseLeave={mounted ? () => setHovered(null) : undefined}
        >
          {mounted && hovered === index && (
            <motion.span
              layoutId="toc-indicator"
              className="absolute left-0 top-0 h-full w-1 rounded-br-full rounded-tr-full bg-neutral-200 dark:bg-neutral-700"
            />
          )}
          <span
            className={`inline-block ${mounted ? "transition duration-200 group-hover/toc-link:translate-x-1" : ""}`}
          >
            {link.title}
          </span>
        </Link>
      ))}
    </div>
  );
};
