// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Code,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// <== CUSTOM SKELETON COMPONENT ==>
const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  // RETURNING SKELETON COMPONENT
  return (
    <div
      className={cn("bg-secondary animate-pulse rounded", className)}
      {...props}
    />
  );
};
import { FileTree, FileTreeSkeleton, FileTreeHandle } from "./file-tree";
import { FileViewer, FileViewerSkeleton } from "./file-viewer";
import {
  useProjectFileTree,
  useFileContent,
  useSyncProjectFiles,
} from "@/hooks";

// <== CODE BROWSER PROPS ==>
interface CodeBrowserProps {
  // <== PROJECT ID ==>
  projectId: string;
  // <== GITHUB URL ==>
  githubUrl?: string | null;
  // <== CLASS NAME ==>
  className?: string;
  // <== DEFAULT HEIGHT ==>
  defaultHeight?: string | number;
}

// <== CODE BROWSER COMPONENT ==>
export const CodeBrowser = ({
  projectId,
  githubUrl,
  className,
  defaultHeight = "500px",
}: CodeBrowserProps) => {
  // SELECTED PATH STATE
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // SIDEBAR COLLAPSED STATE
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // TREE EXPANDED STATE
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  // FILE TREE REF
  const fileTreeRef = useRef<FileTreeHandle>(null);
  // FILE TREE QUERIES
  const {
    data: fileTree,
    isLoading: isLoadingTree,
    error: treeError,
    refetch: refetchTree,
  } = useProjectFileTree(projectId);
  // FILE CONTENT QUERIES
  const {
    data: fileContent,
    isLoading: isLoadingContent,
    error: contentError,
  } = useFileContent(projectId, selectedPath);
  // SYNC PROJECT FILES MUTATION
  const syncFiles = useSyncProjectFiles();
  // <== HANDLE SELECT FILE FUNCTION ==>
  const handleSelectFile = (path: string) => {
    // SET SELECTED PATH
    setSelectedPath(path);
  };
  // <== HANDLE CLOSE FILE ==>
  const handleCloseFile = () => {
    // CLEAR SELECTED PATH
    setSelectedPath(null);
  };
  // <== HANDLE SYNC ==>
  const handleSync = async () => {
    // SYNC FILES
    await syncFiles.mutateAsync({ projectId });
    // REFETCH FILE TREE
    refetchTree();
  };
  // <== HANDLE TOGGLE EXPAND ALL ==>
  const handleToggleExpandAll = () => {
    // TOGGLE STATE
    const newState = !isAllExpanded;
    setIsAllExpanded(newState);
    // CALL FILE TREE METHOD
    if (fileTreeRef.current) {
      if (newState) {
        fileTreeRef.current.expandAll();
      } else {
        fileTreeRef.current.collapseAll();
      }
    }
  };
  // NO GITHUB URL
  if (!githubUrl) {
    // RETURNING COMPONENT
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Code className="size-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">No Repository Linked</h3>
        <p className="text-sm text-muted-foreground">
          Link a GitHub repository to browse the source code.
        </p>
      </Card>
    );
  }
  // TREE ERROR
  if (treeError && !isLoadingTree) {
    // RETURNING COMPONENT
    return (
      <Card className={cn("p-8 text-center", className)}>
        <AlertCircle className="size-12 mx-auto mb-4 text-destructive" />
        <h3 className="font-semibold mb-2">Failed to Load Code</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {treeError instanceof Error
            ? treeError.message
            : "Unable to fetch repository files."}
        </p>
        <Button onClick={() => refetchTree()} variant="outline">
          <RefreshCw className="size-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }
  // RETURNING COMPONENT
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* RESPONSIVE LAYOUT: VERTICAL ON MOBILE, HORIZONTAL ON DESKTOP */}
      <div
        className="flex flex-col md:flex-row"
        style={{ height: defaultHeight }}
      >
        {/* SIDEBAR */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full md:w-[280px] h-[200px] md:h-full border-b md:border-b-0 md:border-r flex flex-col shrink-0"
            >
              {/* SIDEBAR HEADER */}
              <div className="flex items-center justify-between p-2 border-b bg-secondary/20">
                <span className="text-xs sm:text-sm font-medium">Files</span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {/* EXPAND/COLLAPSE ALL BUTTON */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                          onClick={handleToggleExpandAll}
                          title={isAllExpanded ? "Collapse all" : "Expand all"}
                        >
                          {isAllExpanded ? (
                            <ChevronsDownUp className="size-3.5 sm:size-4" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 sm:size-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isAllExpanded ? "Collapse all" : "Expand all"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* SYNC BUTTON */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                          onClick={handleSync}
                          disabled={syncFiles.isPending}
                          title="Sync files from GitHub"
                        >
                          <RefreshCw
                            className={cn(
                              "size-3.5 sm:size-4",
                              syncFiles.isPending && "animate-spin"
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sync from GitHub</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* GITHUB LINK */}
                  {githubUrl && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                            asChild
                            title="View on GitHub"
                          >
                            <a
                              href={githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-3.5 sm:size-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View on GitHub</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {/* COLLAPSE BUTTON - HIDDEN ON MOBILE */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden md:flex h-6 w-6 sm:h-7 sm:w-7 p-0"
                          onClick={() => setSidebarCollapsed(true)}
                          title="Collapse sidebar"
                        >
                          <ChevronLeft className="size-3.5 sm:size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Collapse sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {/* FILE TREE */}
              <div className="flex-1 overflow-hidden">
                {isLoadingTree ? (
                  <FileTreeSkeleton />
                ) : fileTree ? (
                  <FileTree
                    ref={fileTreeRef}
                    tree={fileTree}
                    selectedPath={selectedPath}
                    onSelect={handleSelectFile}
                  />
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* COLLAPSED SIDEBAR TOGGLE - HIDDEN ON MOBILE */}
        {sidebarCollapsed && (
          <div className="hidden md:flex border-r w-10 flex-col">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-none"
                    onClick={() => setSidebarCollapsed(false)}
                    title="Expand sidebar"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Expand sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* FILE VIEWER */}
        <div className="flex-1 overflow-hidden min-h-[250px] md:min-h-0">
          <FileViewer
            path={selectedPath}
            content={fileContent?.content ?? null}
            language={fileContent?.language}
            isLoading={isLoadingContent}
            error={contentError instanceof Error ? contentError.message : null}
            githubUrl={githubUrl}
            onClose={handleCloseFile}
          />
        </div>
      </div>
    </Card>
  );
};

// <== CODE BROWSER SKELETON ==>
export const CodeBrowserSkeleton = ({
  height = "500px",
}: {
  height?: string | number;
}) => {
  return (
    <Card className="overflow-hidden" style={{ height }}>
      {/* RESPONSIVE LAYOUT: VERTICAL ON MOBILE, HORIZONTAL ON DESKTOP */}
      <div className="flex flex-col md:flex-row h-full">
        {/* SIDEBAR */}
        <div className="w-full md:w-[280px] h-[200px] md:h-full border-b md:border-b-0 md:border-r flex flex-col shrink-0">
          <div className="flex items-center justify-between p-2 border-b bg-secondary/20">
            <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Skeleton className="size-6 sm:size-7" />
              <Skeleton className="size-6 sm:size-7" />
              <Skeleton className="size-6 sm:size-7" />
              <Skeleton className="hidden md:block size-6 sm:size-7" />
            </div>
          </div>
          <FileTreeSkeleton />
        </div>
        {/* CONTENT */}
        <div className="flex-1 min-h-[250px] md:min-h-0">
          <FileViewerSkeleton />
        </div>
      </div>
    </Card>
  );
};
