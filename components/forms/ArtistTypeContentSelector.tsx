"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import {
  getAllArtistTypeContentPreviews,
  getArtistTypeContentAsBlog,
} from "@/features/artist-types/utils/content-converter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlogType } from "@/features/artist-types/types/artist-type.type";

interface ArtistTypeContentSelectorProps {
  value?: BlogType;
  onChange: (blog: BlogType) => void;
}

export function ArtistTypeContentSelector({
  value,
  onChange,
}: ArtistTypeContentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentPreviews = getAllArtistTypeContentPreviews();

  const handleSelect = (key: string) => {
    const blogContent = getArtistTypeContentAsBlog(key);
    if (blogContent) {
      onChange(blogContent);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {value?.title ? (
        <Card className="relative">
          <CardHeader>
            <CardTitle>{value.title}</CardTitle>
            <CardDescription>
              {value.author && `By ${value.author}`}
              {value.publishDate &&
                ` • ${new Date(value.publishDate).toLocaleDateString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="line-clamp-3 text-sm text-muted-foreground">
              {value.content?.substring(0, 200)}...
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsOpen(true)}>
              Change Content
            </Button>
            <Button variant="ghost" onClick={() => onChange({})}>
              Clear
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button onClick={() => setIsOpen(true)}>
          Select Artist Type Content
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Artist Type Content</DialogTitle>
            <DialogDescription>
              Choose content from the artist type library to use in this artist
              type
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] rounded-md">
            <div className="grid grid-cols-2 gap-4 py-4">
              {contentPreviews.map((preview) => (
                <Card
                  key={preview.key}
                  className="cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={() => handleSelect(preview.key)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-3">
                      {preview.thumbnail && (
                        <div className="h-10 w-10 relative flex-shrink-0">
                          <Image
                            src={preview.thumbnail}
                            alt={preview.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <CardTitle className="text-base">
                        {preview.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="line-clamp-2">
                      {preview.summary}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
