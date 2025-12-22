// <== IMPORTS ==>
import type { GitHubTree, FileTreeNode } from "./types";
import { getRepositoryTree, getFileContent, parseGitHubUrl } from "./client";

// <== BUILD FILE TREE FROM GITHUB TREE ==>
export function buildFileTree(tree: GitHubTree): FileTreeNode[] {
  // ROOT NODES
  const root: FileTreeNode[] = [];
  // MAP FOR QUICK LOOKUP
  const nodeMap = new Map<string, FileTreeNode>();
  // SORT ITEMS (FOLDERS FIRST, THEN FILES)
  const sortedItems = [...tree.tree].sort((a, b) => {
    // FOLDERS COME FIRST
    if (a.type === "tree" && b.type !== "tree") return -1;
    // CHECK IF NODE IS A FILE
    if (a.type !== "tree" && b.type === "tree") return 1;
    // THEN SORT BY NAME
    return a.path.localeCompare(b.path);
  });
  // LOOP THROUGH SORTED ITEMS
  for (const item of sortedItems) {
    // CREATE FILE TREE NODE
    const node: FileTreeNode = {
      name: getFileName(item.path),
      path: item.path,
      type: item.type === "tree" ? "folder" : "file",
      size: item.size,
      sha: item.sha,
      language: item.type === "blob" ? detectLanguage(item.path) : undefined,
      children: item.type === "tree" ? [] : undefined,
    };
    // ADD TO MAP
    nodeMap.set(item.path, node);
    // GET PARENT PATH
    const parentPath = getParentPath(item.path);
    // ADD TO PARENT OR ROOT
    if (parentPath) {
      // GET PARENT NODE
      const parent = nodeMap.get(parentPath);
      // CHECK IF PARENT HAS CHILDREN
      if (parent?.children) {
        // ADD NODE TO PARENT CHILDREN
        parent.children.push(node);
      }
    } else {
      // ADD NODE TO ROOT
      root.push(node);
    }
  }
  // SORT CHILDREN (FOLDERS FIRST)
  sortTreeChildren(root);
  // RETURN ROOT
  return root;
}

// <== SORT TREE CHILDREN RECURSIVELY ==>
function sortTreeChildren(nodes: FileTreeNode[]): void {
  // SORT NODES
  nodes.sort((a, b) => {
    // FOLDERS COME FIRST
    if (a.type === "folder" && b.type !== "folder") return -1;
    // CHECK IF NODE IS A FILE
    if (a.type !== "folder" && b.type === "folder") return 1;
    // THEN SORT BY NAME
    return a.name.localeCompare(b.name);
  });
  // SORT CHILDREN
  for (const node of nodes) {
    // CHECK IF NODE HAS CHILDREN
    if (node.children) {
      // SORT CHILDREN
      sortTreeChildren(node.children);
    }
  }
}

// <== GET FILE NAME FROM PATH ==>
function getFileName(path: string): string {
  // SPLIT PATH BY /
  const parts = path.split("/");
  // RETURN LAST PART
  return parts[parts.length - 1];
}

// <== GET PARENT PATH ==>
function getParentPath(path: string): string | null {
  // FIND LAST / IN PATH
  const lastSlash = path.lastIndexOf("/");
  // RETURN PARENT PATH OR NULL
  return lastSlash > 0 ? path.substring(0, lastSlash) : null;
}

// <== DETECT LANGUAGE FROM FILE PATH ==>
export function detectLanguage(path: string): string | undefined {
  // GET FILE EXTENSION
  const ext = path.split(".").pop()?.toLowerCase();
  // EXTENSION TO LANGUAGE MAP
  const languageMap: Record<string, string> = {
    // JAVASCRIPT / TYPESCRIPT
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",
    // WEB
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    // DATA
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    toml: "toml",
    // CONFIG
    md: "markdown",
    mdx: "markdown",
    txt: "text",
    // PYTHON
    py: "python",
    pyw: "python",
    pyx: "python",
    // RUBY
    rb: "ruby",
    erb: "ruby",
    // GO
    go: "go",
    // RUST
    rs: "rust",
    // JAVA
    java: "java",
    kt: "kotlin",
    kts: "kotlin",
    // C FAMILY
    c: "c",
    h: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    cs: "csharp",
    // SWIFT
    swift: "swift",
    // PHP
    php: "php",
    // SHELL
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
    ps1: "powershell",
    // SQL
    sql: "sql",
    // DOCKER
    dockerfile: "dockerfile",
    // OTHER
    graphql: "graphql",
    gql: "graphql",
    vue: "vue",
    svelte: "svelte",
    prisma: "prisma",
    env: "dotenv",
  };
  // CHECK SPECIAL FILES
  const fileName = getFileName(path).toLowerCase();
  // SPECIAL FILES MAP
  const specialFiles: Record<string, string> = {
    dockerfile: "dockerfile",
    ".gitignore": "gitignore",
    ".env": "dotenv",
    ".env.local": "dotenv",
    ".env.example": "dotenv",
    makefile: "makefile",
    "package.json": "json",
    "tsconfig.json": "json",
    "tailwind.config.js": "javascript",
    "tailwind.config.ts": "typescript",
    "next.config.js": "javascript",
    "next.config.ts": "typescript",
    "vite.config.js": "javascript",
    "vite.config.ts": "typescript",
  };
  // CHECK SPECIAL FILES FIRST
  if (specialFiles[fileName]) {
    // RETURN SPECIAL FILE LANGUAGE
    return specialFiles[fileName];
  }
  // RETURN LANGUAGE OR UNDEFINED
  return ext ? languageMap[ext] : undefined;
}

// <== FETCH FILE TREE ==>
export async function fetchFileTree(
  owner: string,
  repo: string,
  branch?: string,
  accessToken?: string
): Promise<FileTreeNode[]> {
  // FETCH REPOSITORY TREE
  const tree = await getRepositoryTree(
    owner,
    repo,
    branch || "HEAD",
    true,
    accessToken
  );
  // BUILD AND RETURN FILE TREE
  return buildFileTree(tree);
}

// <== FETCH FILE TREE BY URL ==>
export async function fetchFileTreeByUrl(
  githubUrl: string,
  branch?: string,
  accessToken?: string
): Promise<FileTreeNode[] | null> {
  // PARSE URL
  const parsed = parseGitHubUrl(githubUrl);
  // CHECK IF VALID
  if (!parsed) return null;
  // FETCH AND RETURN TREE
  return fetchFileTree(parsed.owner, parsed.repo, branch, accessToken);
}

// <== FETCH FILE CONTENT ==>
export async function fetchFile(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
  accessToken?: string
): Promise<{ content: string; language: string | undefined }> {
  // FETCH CONTENT
  const content = await getFileContent(owner, repo, path, ref, accessToken);
  // DETECT LANGUAGE
  const language = detectLanguage(path);
  // RETURN CONTENT AND LANGUAGE
  return { content, language };
}

// <== FETCH FILE CONTENT BY URL ==>
export async function fetchFileByUrl(
  githubUrl: string,
  path: string,
  ref?: string,
  accessToken?: string
): Promise<{ content: string; language: string | undefined } | null> {
  // PARSE URL
  const parsed = parseGitHubUrl(githubUrl);
  // CHECK IF VALID
  if (!parsed) return null;
  // FETCH AND RETURN FILE
  return fetchFile(parsed.owner, parsed.repo, path, ref, accessToken);
}

// <== FILE SIZE FORMATTER ==>
export function formatFileSize(bytes: number): string {
  // CHECK IF ZERO
  if (bytes === 0) return "0 B";
  // SIZE UNITS
  const units = ["B", "KB", "MB", "GB"];
  // CALCULATE UNIT INDEX
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  // CALCULATE SIZE
  const size = bytes / Math.pow(1024, unitIndex);
  // FORMAT SIZE
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

// <== CHECK IF FILE IS BINARY ==>
export function isBinaryFile(path: string): boolean {
  // BINARY EXTENSIONS
  const binaryExtensions = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "bmp",
    "ico",
    "webp",
    "svg",
    "pdf",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "exe",
    "dll",
    "so",
    "dylib",
    "bin",
    "dat",
    "db",
    "sqlite",
    "mp3",
    "mp4",
    "wav",
    "ogg",
    "webm",
    "avi",
    "mov",
    "woff",
    "woff2",
    "ttf",
    "eot",
    "otf",
  ];
  // GET EXTENSION
  const ext = path.split(".").pop()?.toLowerCase();
  // CHECK IF BINARY
  return ext ? binaryExtensions.includes(ext) : false;
}

// <== CHECK IF FILE IS IMAGE ==>
export function isImageFile(path: string): boolean {
  // IMAGE EXTENSIONS
  const imageExtensions = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "bmp",
    "ico",
    "webp",
    "svg",
  ];
  // GET EXTENSION
  const ext = path.split(".").pop()?.toLowerCase();
  // CHECK IF IMAGE
  return ext ? imageExtensions.includes(ext) : false;
}

// <== GET FILE ICON ==>
export function getFileIcon(path: string, type: "file" | "folder"): string {
  // FOLDER ICON
  if (type === "folder") return "📁";
  // GET LANGUAGE
  const language = detectLanguage(path);
  // LANGUAGE TO ICON MAP
  const iconMap: Record<string, string> = {
    javascript: "📜",
    typescript: "📘",
    python: "🐍",
    ruby: "💎",
    go: "🐹",
    rust: "🦀",
    java: "☕",
    kotlin: "🟣",
    swift: "🍎",
    php: "🐘",
    html: "🌐",
    css: "🎨",
    scss: "🎨",
    json: "📋",
    yaml: "📋",
    markdown: "📝",
    shell: "🖥️",
    dockerfile: "🐳",
    sql: "🗄️",
    vue: "💚",
    svelte: "🔶",
    graphql: "◼️",
  };
  // CHECK FOR IMAGE
  if (isImageFile(path)) return "🖼️";
  // RETURN ICON OR DEFAULT
  return language ? iconMap[language] || "📄" : "📄";
}
