// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SyntaxHighlighter } from "./syntax-highlighter";
import { isBinaryFile, isImageFile } from "@/lib/github/files";
import { Copy, Check, ExternalLink, File, AlertCircle } from "lucide-react";

// <== DETERMINISTIC SKELETON WIDTHS ==>
const SKELETON_WIDTHS = [
  75, 60, 85, 50, 70, 65, 80, 55, 90, 45, 72, 58, 68, 82, 62,
];

// <== FILE VIEWER PROPS ==>
interface FileViewerProps {
  // <== FILE PATH ==>
  path: string | null;
  // <== FILE CONTENT ==>
  content: string | null;
  // <== LANGUAGE ==>
  language: string | null | undefined;
  // <== IS LOADING ==>
  isLoading?: boolean;
  // <== ERROR ==>
  error?: string | null;
  // <== GITHUB URL ==>
  githubUrl?: string | null;
  // <== CLASS NAME ==>
  className?: string;
}

// <== FILE VIEWER COMPONENT ==>
export const FileViewer = ({
  path,
  content,
  language,
  isLoading,
  error,
  githubUrl,
  className,
}: FileViewerProps) => {
  // STATE FOR COPIED
  const [copied, setCopied] = useState(false);
  // <== HANDLE COPY ==>
  const handleCopy = async () => {
    // IF NO CONTENT, RETURN
    if (!content) return;
    // TRY TO COPY CONTENT
    try {
      // COPY CONTENT TO CLIPBOARD
      await navigator.clipboard.writeText(content);
      // SET COPIED TO TRUE
      setCopied(true);
      // SHOW SUCCESS TOAST
      toast.success("Copied to clipboard");
      // SET COPIED TO FALSE AFTER 2 SECONDS
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // SHOW ERROR TOAST
      toast.error("Failed to copy");
    }
  };
  // <== GET GITHUB FILE URL ==>
  const getGitHubFileUrl = () => {
    // IF NO GITHUB URL OR PATH, RETURN NULL
    if (!githubUrl || !path) return null;
    // RETURN GITHUB FILE URL
    return `${githubUrl}/blob/main/${path}`;
  };
  // NO FILE SELECTED
  if (!path) {
    // RETURNING COMPONENT
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full text-muted-foreground",
          className
        )}
      >
        <File className="size-12 mb-4 opacity-50" />
        <p className="text-sm">Select a file to view its contents</p>
      </div>
    );
  }
  // LOADING STATE
  if (isLoading) {
    // RETURNING COMPONENT
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* HEADER */}
        <div className="flex items-center justify-between p-3 border-b">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-20" />
        </div>
        {/* CONTENT */}
        <div className="flex-1 p-4 space-y-2">
          {SKELETON_WIDTHS.map((width, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>
    );
  }
  // ERROR STATE
  if (error) {
    // RETURNING COMPONENT
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full text-muted-foreground",
          className
        )}
      >
        <AlertCircle className="size-12 mb-4 text-destructive" />
        <p className="text-sm text-center max-w-sm">{error}</p>
      </div>
    );
  }
  // BINARY FILE
  if (path && isBinaryFile(path)) {
    // RETURNING COMPONENT
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* HEADER */}
        <FileViewerHeader
          path={path}
          language={language}
          githubFileUrl={getGitHubFileUrl()}
        />
        {/* CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          {isImageFile(path) && githubUrl ? (
            <div className="relative p-8">
              <Image
                src={`${githubUrl}/raw/main/${path}`}
                alt={path}
                width={400}
                height={400}
                className="max-w-full max-h-[400px] w-auto h-auto rounded-lg border object-contain"
                unoptimized
              />
            </div>
          ) : (
            <>
              <File className="size-12 mb-4 opacity-50" />
              <p className="text-sm">Binary file cannot be displayed</p>
            </>
          )}
        </div>
      </div>
    );
  }
  // RETURNING COMPONENT
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* HEADER */}
      <FileViewerHeader
        path={path}
        language={language}
        lineCount={content?.split("\n").length}
        githubFileUrl={getGitHubFileUrl()}
        onCopy={handleCopy}
        copied={copied}
      />
      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        <SyntaxHighlighter
          code={content || ""}
          language={language}
          className="h-full"
        />
      </div>
    </div>
  );
};

// <== FILE VIEWER HEADER PROPS ==>
interface FileViewerHeaderProps {
  // <== FILE PATH ==>
  path: string;
  // <== LANGUAGE ==>
  language: string | null | undefined;
  // <== LINE COUNT ==>
  lineCount?: number;
  // <== GITHUB FILE URL ==>
  githubFileUrl?: string | null;
  // <== ON COPY ==>
  onCopy?: () => void;
  // <== COPIED ==>
  copied?: boolean;
}

// <== FILE VIEWER HEADER ==>
const FileViewerHeader = ({
  path,
  language,
  lineCount,
  githubFileUrl,
  onCopy,
  copied,
}: FileViewerHeaderProps) => {
  // GET FILE NAME
  const fileName = path.split("/").pop() || path;
  // RETURNING COMPONENT
  return (
    <div className="flex items-center justify-between p-3 border-b bg-secondary/20">
      {/* FILE INFO */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-sm truncate">{fileName}</span>
        {language && (
          <Badge variant="secondary" className="text-xs capitalize">
            {language}
          </Badge>
        )}
        {lineCount && (
          <span className="text-xs text-muted-foreground">
            {formatNumber(lineCount)} lines
          </span>
        )}
      </div>
      {/* ACTIONS */}
      <div className="flex items-center gap-1">
        {onCopy && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={onCopy}
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : "Copy code"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {githubFileUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  asChild
                >
                  <a
                    href={githubFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on GitHub</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

// <== FILE VIEWER SKELETON ==>
export const FileViewerSkeleton = () => {
  // RETURNING COMPONENT
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex-1 p-4 space-y-2">
        {SKELETON_WIDTHS.map((width, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${width}%` }} />
        ))}
      </div>
    </div>
  );
};
