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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { FileTree, FileTreeSkeleton } from "./file-tree";
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
  // <== HANDLE SYNC ==>
  const handleSync = async () => {
    // SYNC FILES
    await syncFiles.mutateAsync({ projectId });
    // REFETCH FILE TREE
    refetchTree();
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
    <Card
      className={cn("overflow-hidden", className)}
      style={{ height: defaultHeight }}
    >
      <div className="flex h-full">
        {/* SIDEBAR */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r flex flex-col"
            >
              {/* SIDEBAR HEADER */}
              <div className="flex items-center justify-between p-2 border-b bg-secondary/20">
                <span className="text-sm font-medium">Files</span>
                <div className="flex items-center gap-1">
                  {/* SYNC BUTTON */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleSync}
                    disabled={syncFiles.isPending}
                    title="Sync files from GitHub"
                  >
                    <RefreshCw
                      className={cn(
                        "size-4",
                        syncFiles.isPending && "animate-spin"
                      )}
                    />
                  </Button>
                  {/* GITHUB LINK */}
                  {githubUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      asChild
                      title="View on GitHub"
                    >
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  )}
                  {/* COLLAPSE BUTTON */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setSidebarCollapsed(true)}
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>
              </div>
              {/* FILE TREE */}
              <div className="flex-1 overflow-hidden">
                {isLoadingTree ? (
                  <FileTreeSkeleton />
                ) : fileTree ? (
                  <FileTree
                    tree={fileTree}
                    selectedPath={selectedPath}
                    onSelect={handleSelectFile}
                  />
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COLLAPSED SIDEBAR TOGGLE */}
        {sidebarCollapsed && (
          <div className="border-r w-10 flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 rounded-none"
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {/* FILE VIEWER */}
        <div className="flex-1 overflow-hidden">
          <FileViewer
            path={selectedPath}
            content={fileContent?.content ?? null}
            language={fileContent?.language}
            isLoading={isLoadingContent}
            error={contentError instanceof Error ? contentError.message : null}
            githubUrl={githubUrl}
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
      <div className="flex h-full">
        {/* SIDEBAR */}
        <div className="w-[280px] border-r flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
          <FileTreeSkeleton />
        </div>
        {/* CONTENT */}
        <div className="flex-1">
          <FileViewerSkeleton />
        </div>
      </div>
    </Card>
  );
};
