// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectMedia } from "@/lib/db/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Play, ImageIcon, Images } from "lucide-react";

// <== PROJECT GALLERY PROPS ==>
interface ProjectGalleryProps {
  // <== MEDIA ==>
  media: ProjectMedia[];
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROJECT GALLERY COMPONENT ==>
export const ProjectGallery = ({ media, className }: ProjectGalleryProps) => {
  // STATE FOR LIGHTBOX
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // STATE FOR CURRENT INDEX
  const [currentIndex, setCurrentIndex] = useState(0);
  // HANDLE EMPTY
  if (media.length === 0) {
    // RETURN NULL
    return null;
  }
  // <== HANDLE PREVIOUS ==>
  const handlePrevious = () => {
    // SET CURRENT INDEX
    setCurrentIndex((prev: number) =>
      prev === 0 ? media.length - 1 : prev - 1
    );
  };
  // <== HANDLE NEXT ==>
  const handleNext = () => {
    // SET CURRENT INDEX
    setCurrentIndex((prev: number) =>
      prev === media.length - 1 ? 0 : prev + 1
    );
  };
  // <== HANDLE KEY DOWN ==>
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // HANDLE ARROW LEFT
    if (e.key === "ArrowLeft") handlePrevious();
    // HANDLE ARROW RIGHT
    if (e.key === "ArrowRight") handleNext();
    // HANDLE ESCAPE
    if (e.key === "Escape") setLightboxOpen(false);
  };
  // CURRENT MEDIA
  const currentMedia = media[currentIndex];
  // RETURN PROJECT GALLERY COMPONENT
  return (
    <>
      {/* GALLERY GRID */}
      <Card className={cn("p-4 sm:p-6", className)}>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <div className="size-7 sm:size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Images className="size-3.5 sm:size-4 text-primary" />
          </div>
          Screenshots
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {media.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="relative aspect-video rounded-lg overflow-hidden bg-secondary group cursor-pointer"
              onClick={() => {
                setCurrentIndex(index);
                setLightboxOpen(true);
              }}
            >
              {/* IMAGE */}
              {item.type === "image" || item.type === "gif" ? (
                <Image
                  src={item.url}
                  alt={item.caption ?? `Screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                // VIDEO THUMBNAIL
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <Play className="size-8 sm:size-10 text-muted-foreground" />
                </div>
              )}
              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {/* VIDEO ICON */}
              {item.type === "video" && (
                <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2">
                  <div className="p-1 sm:p-1.5 rounded-full bg-black/60">
                    <Play className="size-2.5 sm:size-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
      {/* LIGHTBOX */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/95"
          onKeyDown={handleKeyDown}
        >
          {/* CLOSE BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="size-5" />
          </Button>
          {/* NAVIGATION */}
          {media.length > 1 && (
            <>
              {/* PREVIOUS */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="size-6" />
              </Button>
              {/* NEXT */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="size-6" />
              </Button>
            </>
          )}
          {/* MEDIA CONTENT */}
          <div className="flex items-center justify-center min-h-[60vh] p-8">
            {currentMedia?.type === "video" ? (
              // VIDEO
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg"
              />
            ) : currentMedia ? (
              // IMAGE
              <div className="relative w-full h-[80vh]">
                <Image
                  src={currentMedia.url}
                  alt={currentMedia.caption ?? `Screenshot ${currentIndex + 1}`}
                  fill
                  sizes="95vw"
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>
          {/* CAPTION & COUNTER */}
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 text-white/80">
            {currentMedia?.caption && (
              <p className="text-sm px-4 text-center">{currentMedia.caption}</p>
            )}
            <p className="text-xs">
              {currentIndex + 1} / {media.length}
            </p>
          </div>
          {/* THUMBNAILS */}
          {media.length > 1 && (
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "relative size-12 rounded overflow-hidden shrink-0 transition-all",
                    index === currentIndex
                      ? "ring-2 ring-white"
                      : "opacity-50 hover:opacity-100"
                  )}
                  onClick={() => setCurrentIndex(index)}
                >
                  {item.type === "image" || item.type === "gif" ? (
                    <Image
                      src={item.url}
                      alt={item.caption ?? `Thumbnail ${index + 1}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                      <Play className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// <== PROJECT GALLERY EMPTY STATE ==>
export const ProjectGalleryEmpty = ({ className }: { className?: string }) => {
  // RETURN PROJECT GALLERY EMPTY STATE
  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
        <div className="size-7 sm:size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Images className="size-3.5 sm:size-4 text-primary" />
        </div>
        Screenshots
      </h3>
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
        <div className="size-12 sm:size-14 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
          <ImageIcon className="size-5 sm:size-6 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-sm sm:text-base mb-1">No screenshots yet</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">
          This project hasn&apos;t added any screenshots.
        </p>
      </div>
    </Card>
  );
};
