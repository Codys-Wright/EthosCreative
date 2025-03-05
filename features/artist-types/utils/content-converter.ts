import { artistTypeContent } from "@/landing-page/data/ArtistTypeContent";
import { BlogSchema } from "../types/artist-type.type";
import { Schema as S } from "effect";

/**
 * ArtistTypeContent from landing page format
 */
export interface LandingPageArtistType {
  title: string;
  summary: string;
  date: string;
  author: string;
  authorImage: string;
  thumbnail: string;
  content: string;
}

/**
 * Blog format used in ArtistType schema
 */
export type BlogType = typeof BlogSchema.Type;

/**
 * Converts a landing page artist type content to blog format
 */
export function convertToArtistTypeBlog(
  content: LandingPageArtistType,
): BlogType {
  return {
    title: content.title,
    content: content.content,
    author: content.author,
    publishDate: content.date
      ? new Date(content.date).toISOString()
      : undefined,
    tags: ["imported", "landing-page"], // Default tags for imported content
    // Additional fields can be added here
  };
}

/**
 * Gets artist type content by key and converts it to blog format
 */
export function getArtistTypeContentAsBlog(key: string): BlogType | undefined {
  const content = artistTypeContent[key];
  if (!content) return undefined;

  return convertToArtistTypeBlog(content);
}

/**
 * Gets all available artist type content keys
 */
export function getAvailableArtistTypeContentKeys(): string[] {
  return Object.keys(artistTypeContent);
}

/**
 * Gets a preview of all available artist type content
 */
export function getAllArtistTypeContentPreviews(): Array<{
  key: string;
  title: string;
  summary: string;
  thumbnail: string;
}> {
  return Object.entries(artistTypeContent).map(([key, content]) => ({
    key,
    title: content.title,
    summary: content.summary,
    thumbnail: content.thumbnail,
  }));
}
