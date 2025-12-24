// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Link as LinkIcon } from "lucide-react";

// <== COVER IMAGE UPLOAD PROPS ==>
interface CoverImageUploadProps {
  // <== VALUE ==>
  value: string | null;
  // <== ON CHANGE ==>
  onChange: (url: string | null) => void;
  // <== DISABLED ==>
  disabled?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== COVER IMAGE UPLOAD COMPONENT ==>
export const CoverImageUpload = ({
  value,
  onChange,
  disabled = false,
  className,
}: CoverImageUploadProps) => {
  // URL INPUT STATE
  const [urlInput, setUrlInput] = useState("");
  // DIALOG OPEN STATE
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // ERROR STATE
  const [error, setError] = useState("");
  // HANDLE URL SUBMIT FUNCTION
  const handleUrlSubmit = useCallback(() => {
    // CHECK IF URL INPUT IS EMPTY
    if (!urlInput.trim()) {
      // SET ERROR
      setError("Please enter a URL");
      // RETURN
      return;
    }
    // TRY TO CONVERT URL INPUT TO A URL OBJECT
    try {
      // CONVERT URL INPUT TO A URL OBJECT
      const url = new URL(urlInput.trim());
      // CHECK IF URL PROTOCOL IS HTTP OR HTTPS
      if (!["http:", "https:"].includes(url.protocol)) {
        // SET ERROR
        setError("Please enter a valid HTTP or HTTPS URL");
        // RETURN
        return;
      }
      // UPDATE VALUE
      onChange(urlInput.trim());
      // SET URL INPUT TO EMPTY STRING
      setUrlInput("");
      // SET ERROR TO EMPTY STRING
      setError("");
      // CLOSE DIALOG
      setIsDialogOpen(false);
    } catch {
      // SET ERROR
      setError("Please enter a valid URL");
    }
  }, [urlInput, onChange]);
  // HANDLE REMOVE FUNCTION
  const handleRemove = useCallback(() => {
    // UPDATE VALUE TO NULL
    onChange(null);
  }, [onChange]);
  // RETURN COVER IMAGE UPLOAD COMPONENT
  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        // IMAGE PREVIEW
        <div className="relative aspect-video rounded-lg overflow-hidden border bg-secondary">
          <Image
            src={value}
            alt="Cover image"
            fill
            className="object-cover"
            unoptimized
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="absolute top-2 right-2 size-8"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ) : (
        // UPLOAD AREA
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "w-full aspect-video rounded-lg border-2 border-dashed",
                "flex flex-col items-center justify-center gap-2",
                "text-muted-foreground hover:text-foreground hover:border-foreground/50",
                "transition-colors cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <ImagePlus className="size-8 sm:size-10" />
              <span className="text-sm sm:text-base font-medium">
                Add Cover Image
              </span>
              <span className="text-xs sm:text-sm">Click to add image URL</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Cover Image</DialogTitle>
              <DialogDescription>
                Enter the URL of the image you want to use as your cover.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUrlSubmit();
                      }
                    }}
                    className="pl-9"
                  />
                </div>
                <Button type="button" onClick={handleUrlSubmit}>
                  Add
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                Recommended size: 1200x630 pixels for best results on social
                media.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// <== EXPORTING COVER IMAGE UPLOAD ==>
export default CoverImageUpload;
