// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import type { FileTreeNode } from "@/lib/github/types";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

// <== FILE TREE PROPS ==>
interface FileTreeProps {
  // <== TREE DATA ==>
  tree: FileTreeNode[];
  // <== SELECTED PATH ==>
  selectedPath: string | null;
  // <== ON SELECT ==>
  onSelect: (path: string) => void;
  // <== CLASS NAME ==>
  className?: string;
}

// <== FILE TREE COMPONENT ==>
export const FileTree = ({
  tree,
  selectedPath,
  onSelect,
  className,
}: FileTreeProps) => {
  // STATE FOR SEARCH
  const [search, setSearch] = useState("");
  // FILTER TREE BY SEARCH
  const filteredTree = useMemo(() => {
    // IF NO SEARCH, RETURN TREE
    if (!search) return tree;
    // SEARCH LOWER
    const searchLower = search.toLowerCase();
    // <== RECURSIVE FILTER FUNCTION ==>
    function filterNodes(nodes: FileTreeNode[]): FileTreeNode[] {
      // REDUCE NODES
      return nodes.reduce<FileTreeNode[]>((acc, node) => {
        // MATCHES
        const matches = node.name.toLowerCase().includes(searchLower);
        // IF FOLDER, CHECK CHILDREN
        if (node.children) {
          // FILTER CHILDREN
          const filteredChildren = filterNodes(node.children);
          // IF MATCHES OR FILTERED CHILDREN HAS LENGTH, PUSH NODE
          if (matches || filteredChildren.length > 0) {
            // PUSH NODE
            acc.push({
              ...node,
              children: filteredChildren,
            });
          }
        } else if (matches) {
          // PUSH NODE
          acc.push(node);
        }
        // RETURN ACCUMULATOR
        return acc;
      }, []);
    }
    // FILTER NODES
    return filterNodes(tree);
  }, [tree, search]);
  // RETURNING COMPONENT
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* SEARCH */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>
      {/* TREE */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredTree.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No files found
            </p>
          ) : (
            filteredTree.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedPath}
                onSelect={onSelect}
                defaultExpanded={!!search}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// <== TREE NODE PROPS ==>
interface TreeNodeProps {
  // <== NODE ==>
  node: FileTreeNode;
  // <== DEPTH ==>
  depth: number;
  // <== SELECTED PATH ==>
  selectedPath: string | null;
  // <== ON SELECT ==>
  onSelect: (path: string) => void;
  // <== DEFAULT EXPANDED ==>
  defaultExpanded?: boolean;
}

// <== TREE NODE COMPONENT ==>
const TreeNode = ({
  node,
  depth,
  selectedPath,
  onSelect,
  defaultExpanded = false,
}: TreeNodeProps) => {
  // STATE FOR EXPANDED
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  // IS FOLDER
  const isFolder = node.type === "folder";
  // IS SELECTED
  const isSelected = selectedPath === node.path;
  // <== HANDLE CLICK ==>
  const handleClick = () => {
    // IF FOLDER, TOGGLE EXPANDED
    if (isFolder) {
      // TOGGLE EXPANDED
      setIsExpanded(!isExpanded);
    } else {
      // ON SELECT
      onSelect(node.path);
    }
  };
  // RETURNING NODE
  return (
    <div>
      {/* NODE ROW */}
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 w-full px-2 py-1 rounded-sm text-sm hover:bg-secondary/50 transition-colors text-left",
          isSelected && "bg-secondary text-foreground font-medium"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* CHEVRON */}
        {isFolder ? (
          isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {/* ICON */}
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="size-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="size-4 text-amber-500 shrink-0" />
          )
        ) : (
          <FileIcon path={node.path} />
        )}
        {/* NAME */}
        <span className="truncate">{node.name}</span>
      </button>
      {/* CHILDREN */}
      <AnimatePresence>
        {isFolder && isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// <== FILE ICON COMPONENT ==>
const FileIcon = ({ path }: { path: string }) => {
  // GET EXTENSION
  const ext = path.split(".").pop()?.toLowerCase();
  // GET FILE NAME
  const fileName = path.split("/").pop()?.toLowerCase() || "";
  // ICON COLOR BASED ON EXTENSION
  const getColor = () => {
    // SPECIAL FILES
    if (fileName === "package.json") return "text-green-500";
    // SPECIAL FILES
    if (fileName === "tsconfig.json") return "text-blue-500";
    // SPECIAL FILES
    if (fileName.startsWith(".env")) return "text-yellow-500";
    // SPECIAL FILES
    if (fileName === "dockerfile") return "text-sky-500";
    // SPECIAL FILES
    if (fileName === ".gitignore") return "text-orange-500";
    // BY EXTENSION
    switch (ext) {
      // JAVASCRIPT / TYPESCRIPT
      case "js":
      case "jsx":
        return "text-yellow-500";
      // TYPESCRIPT
      case "ts":
      case "tsx":
        return "text-blue-500";
      // PYTHON
      case "py":
        return "text-green-500";
      // RUBY
      case "rb":
        return "text-red-500";
      // GO
      case "go":
        return "text-cyan-500";
      // RUST
      case "rs":
        return "text-orange-500";
      // JAVA
      case "java":
        return "text-red-600";
      // MARKDOWN
      case "md":
      case "mdx":
        return "text-slate-500";
      // JSON
      case "json":
        return "text-amber-500";
      // YAML
      case "yaml":
      // YML
      case "yml":
        return "text-pink-500";
      // HTML
      case "html":
        return "text-orange-600";
      // CSS
      case "css":
      // SCSS
      case "scss":
      // SASS
      case "sass":
        return "text-purple-500";
      // VUE
      case "vue":
        return "text-emerald-500";
      // SVELTE
      case "svelte":
        return "text-orange-500";
      // DEFAULT
      default:
        return "text-muted-foreground";
    }
  };
  // RETURN FILE ICON
  return <File className={cn("size-4 shrink-0", getColor())} />;
};

// <== DETERMINISTIC SKELETON WIDTHS FOR FILE TREE ==>
const FILE_TREE_SKELETON_WIDTHS = [75, 85, 65, 90, 70, 80, 60, 72];

// <== FILE TREE SKELETON ==>
export const FileTreeSkeleton = () => {
  // RETURN FILE TREE SKELETON
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <div className="h-8 bg-secondary/50 rounded animate-pulse" />
      </div>
      <div className="p-2 space-y-1">
        {FILE_TREE_SKELETON_WIDTHS.map((width, i) => (
          <div
            key={i}
            className="h-7 bg-secondary/30 rounded animate-pulse"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </div>
  );
};
