/**
 * Announcements Widget
 *
 * Dashboard widget showing the latest course announcements.
 * Links to the full messages page for more details.
 */

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Button, Card } from "@shadcn";
import { Megaphone, ArrowRight, MessageSquare } from "lucide-react";
import type { ChatMessage } from "@chat";

interface AnnouncementsWidgetProps {
  announcements?: ChatMessage[];
  maxItems?: number;
}

export function AnnouncementsWidget({
  announcements = [],
  maxItems = 3,
}: AnnouncementsWidgetProps) {
  const displayedAnnouncements = announcements.slice(0, maxItems);

  if (displayedAnnouncements.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Announcements</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            No announcements yet. Check back later for updates from your
            instructor.
          </p>
          <Link to="/messages" search={{ room: "announcements" }}>
            <Button variant="outline" size="sm" className="gap-2">
              Go to Messages
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Announcements</h3>
        </div>
        <Link to="/messages" search={{ room: "announcements" }}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {displayedAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="border-l-2 border-primary/50 pl-3"
          >
            <p className="text-sm line-clamp-2">{announcement.content}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{formatRelativeTime(announcement.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
