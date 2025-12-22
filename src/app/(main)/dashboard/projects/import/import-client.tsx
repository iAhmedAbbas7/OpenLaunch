// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  useGitHubConnectionStatus,
  useGitHubRepositories,
  useExtractProjectInfo,
  useCreateProject,
  useDebounce,
} from "@/hooks";
import {
  Github,
  Star,
  GitFork,
  Search,
  ArrowRight,
  AlertCircle,
  Lock,
  Loader2,
  RefreshCw,
  Settings,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// <== PER PAGE ==>
const PER_PAGE = 15;
// <== SEARCH DEBOUNCE MS ==>
const SEARCH_DEBOUNCE_MS = 400;

// <== SORT OPTIONS ==>
const sortOptions = [
  // <== RECENTLY UPDATED ==>
  { value: "updated", label: "Recently Updated" },
  // <== RECENTLY CREATED ==>
  { value: "created", label: "Recently Created" },
  // <== <== RECENTLY PUSHED ==>
  { value: "pushed", label: "Recently Pushed" },
  // <== NAME (A-Z) ==>
  { value: "full_name", label: "Name (A-Z)" },
] as const;

// <== LANGUAGE COLORS ==>
const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  "C#": "#178600",
  C: "#555555",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
};

// <== GET LANGUAGE COLOR ==>
const getLanguageColor = (language: string): string => {
  // RETURN LANGUAGE COLOR
  return languageColors[language] || "#8b949e";
};

// <== FORMAT RELATIVE TIME ==>
const formatRelativeTime = (dateString: string): string => {
  // CREATE DATE OBJECT
  const date = new Date(dateString);
  // CREATE NOW DATE OBJECT
  const now = new Date();
  // CALCULATE DIFFERENCE IN SECONDS
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  // CHECK IF DIFFERENCE IS LESS THAN 60 SECONDS
  if (diffInSeconds < 60) return "just now";
  // CHECK IF DIFFERENCE IS LESS THAN 3600 SECONDS
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  // CHECK IF DIFFERENCE IS LESS THAN 86400 SECONDS
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  // CHECK IF DIFFERENCE IS LESS THAN 604800 SECONDS
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  // CHECK IF DIFFERENCE IS LESS THAN 2592000 SECONDS
  if (diffInSeconds < 2592000)
    // CHECK IF DIFFERENCE IS LESS THAN 2592000 SECONDS
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  // RETURN FORMATTED RELATIVE TIME
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

// <== IMPORT FROM GITHUB CLIENT ==>
export const ImportFromGitHubClient = () => {
  // ROUTER NAVIGATION
  const router = useRouter();
  // STATE VARIABLES
  const [page, setPage] = useState(1);
  // SORT STATE
  const [sort, setSort] = useState<
    "created" | "updated" | "pushed" | "full_name"
  >("updated");
  // SEARCH STATE
  const [search, setSearch] = useState("");
  // SELECTED REPO URL STATE
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string | null>(null);
  // IMPORTING STATE
  const [isImporting, setIsImporting] = useState(false);
  // DEBOUNCED SEARCH
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  // CONNECTION STATUS QUERY
  const { data: connectionStatus, isLoading: isLoadingConnection } =
    useGitHubConnectionStatus();
  // REPOSITORIES QUERY
  const {
    data: repoData,
    isLoading: isLoadingRepos,
    isFetching: isFetchingRepos,
    refetch: refetchRepos,
  } = useGitHubRepositories(page, PER_PAGE, sort, debouncedSearch);
  // EXTRACT PROJECT INFO MUTATION
  const extractProjectInfo = useExtractProjectInfo();
  // CREATE PROJECT MUTATION
  const createProject = useCreateProject({ skipSuccessToast: true });
  // REPOSITORIES FROM SERVER
  const repositories = repoData?.repositories ?? [];
  // CALCULATE PAGINATION STATE
  const hasRepos = repositories.length > 0;
  // CHECK IF HAS MORE REPOSITORIES
  const hasMore = repoData?.hasMore ?? false;
  // CHECK IF FIRST PAGE
  const isFirstPage = page === 1;
  // CHECK IF SHOW PAGINATION
  const showPagination = !isFirstPage || hasMore;
  // CHECK IF SEARCH IS PENDING
  const isSearchPending = search !== debouncedSearch;
  // CHECK IF SHOW SKELETON
  const showSkeleton = isLoadingRepos || isFetchingRepos || isSearchPending;
  // <== HANDLE SEARCH CHANGE ==>
  const handleSearchChange = (value: string) => {
    // SET SEARCH VALUE
    setSearch(value);
    // RESET TO PAGE 1 WHEN SEARCH CHANGES
    if (page !== 1) {
      // RESET TO PAGE 1
      setPage(1);
    }
  };
  // <== HANDLE SORT CHANGE ==>
  const handleSortChange = (value: string) => {
    // SET SORT VALUE
    setSort(value as typeof sort);
    // RESET TO PAGE 1 ON SORT CHANGE
    setPage(1);
  };
  // <== HANDLE IMPORT ==>
  const handleImport = async (repoUrl: string) => {
    // SET SELECTED REPO
    setSelectedRepoUrl(repoUrl);
    // SET IMPORTING STATE
    setIsImporting(true);
    // TRY TO IMPORT PROJECT
    try {
      // EXTRACT PROJECT INFO
      const projectInfo = await extractProjectInfo.mutateAsync(repoUrl);
      // CREATE PROJECT
      const result = await createProject.mutateAsync({
        name: projectInfo.name,
        tagline: projectInfo.tagline,
        description: projectInfo.description || undefined,
        techStack: projectInfo.techStack,
        isOpenSource: projectInfo.isOpenSource,
        license: projectInfo.license || undefined,
        githubUrl: projectInfo.githubUrl,
        categoryIds: [],
        status: "draft",
      });
      // NAVIGATE TO EDIT PAGE
      if (result.slug) {
        // SHOW SUCCESS TOAST
        toast.success("Project imported! Let's add some more details.");
        // NAVIGATE TO EDIT PAGE
        router.push(`/dashboard/projects/${result.slug}/edit`);
      }
    } catch (error) {
      // ERROR HANDLED IN HOOKS
      console.error("Import error:", error);
    } finally {
      // SET IMPORTING STATE TO FALSE
      setIsImporting(false);
      // SET SELECTED REPO URL TO NULL
      setSelectedRepoUrl(null);
    }
  };
  // <== HANDLE PAGE CHANGE ==>
  const handlePreviousPage = () => {
    // CHECK IF PAGE IS GREATER THAN 1
    if (page > 1) {
      // SET PAGE TO PREVIOUS PAGE
      setPage((p) => p - 1);
    }
  };
  const handleNextPage = () => {
    // CHECK IF HAS MORE REPOSITORIES
    if (hasMore) {
      // SET PAGE TO NEXT PAGE
      setPage((p) => p + 1);
    }
  };
  // <== IF LOADING CONNECTION ==>
  if (isLoadingConnection) {
    // RETURN IMPORT PAGE SKELETON
    return <ImportPageSkeleton />;
  }
  // IF NOT CONNECTED
  if (!connectionStatus?.isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <Card className="p-6 sm:p-8 text-center border-dashed">
          <div className="mx-auto size-16 sm:size-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4 sm:mb-6">
            <Github className="size-8 sm:size-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading mb-2 sm:mb-3">
            Connect Your GitHub
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
            To import repositories, you need to connect your GitHub account.
            This allows us to access your repositories and import them as
            projects automatically.
          </p>
          <div className="space-y-3 sm:space-y-4">
            <Button size="lg" className="w-full" asChild>
              <Link href="/settings/connections">
                <Github className="size-5 mr-2" />
                Connect GitHub Account
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              We only request read access to your repositories
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }
  // DETERMINE EMPTY STATE TYPE
  const getEmptyStateContent = () => {
    // SEARCH ACTIVE - NO MATCHING RESULTS
    if (debouncedSearch) {
      // RETURN NO MATCHING REPOSITORIES CONTENT
      return {
        title: "No Matching Repositories",
        description: `No repositories match "${debouncedSearch}". Try a different keyword.`,
        showClearSearch: true,
      };
    }
    // FIRST PAGE WITH NO REPOS - USER HAS NO REPOS
    if (isFirstPage && !hasRepos) {
      // RETURN NO REPOSITORIES FOUND CONTENT
      return {
        title: "No Repositories Found",
        description:
          "You don't have any repositories yet. Create one on GitHub first!",
        showClearSearch: false,
      };
    }
    // RETURN NO MORE REPOSITORIES CONTENT
    return {
      title: "No More Repositories",
      description: "You've reached the end of your repositories.",
      showClearSearch: false,
    };
  };
  // RETURNING COMPONENT
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* CONNECTED STATUS BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-3 sm:p-4 bg-green-500/5 border-green-500/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative shrink-0">
                {connectionStatus.avatarUrl ? (
                  <Image
                    src={connectionStatus.avatarUrl}
                    alt={connectionStatus.username || "GitHub"}
                    width={40}
                    height={40}
                    className="rounded-full size-9 sm:size-10"
                  />
                ) : (
                  <div className="size-9 sm:size-10 rounded-full bg-secondary flex items-center justify-center">
                    <Github className="size-4 sm:size-5" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 size-3.5 sm:size-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <CheckCircle2 className="size-2 sm:size-2.5 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm truncate">
                  Connected as{" "}
                  <a
                    href={`https://github.com/${connectionStatus.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @{connectionStatus.username}
                  </a>
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  Select a repository below to import
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 sm:h-9 text-xs sm:text-sm"
              asChild
            >
              <Link href="/settings/connections">
                <Settings className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Manage</span>
              </Link>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3"
      >
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-10 sm:h-11"
          />
          {/* SEARCH LOADING INDICATOR */}
          {isSearchPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
          )}
        </div>
        {/* SORT */}
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-52 h-10 sm:h-11">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* REFRESH */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-full sm:h-11 sm:w-11 shrink-0"
          onClick={() => refetchRepos()}
          disabled={isFetchingRepos}
        >
          <RefreshCw
            className={cn("size-4", isFetchingRepos && "animate-spin")}
          />
          <span className="sm:hidden ml-2">Refresh</span>
        </Button>
      </motion.div>

      {/* REPOSITORIES LIST */}
      {showSkeleton ? (
        <RepositoryListSkeleton />
      ) : repositories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 sm:p-12 text-center">
            <AlertCircle className="size-10 sm:size-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">
              {getEmptyStateContent().title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              {getEmptyStateContent().description}
            </p>
            {getEmptyStateContent().showClearSearch && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                Clear Search
              </Button>
            )}
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {repositories.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={cn(
                    "p-3 sm:p-5 hover:border-primary/50 transition-all duration-200 group",
                    selectedRepoUrl === repo.url &&
                      "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* REPO ICON */}
                    <div className="size-10 sm:size-12 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Github className="size-5 sm:size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {/* REPO INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                          {repo.name}
                        </h3>
                        {repo.isPrivate && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] sm:text-xs shrink-0 h-5"
                          >
                            <Lock className="size-2.5 sm:size-3 mr-0.5 sm:mr-1" />
                            Private
                          </Badge>
                        )}
                        {repo.isFork && (
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs shrink-0 h-5 hidden sm:flex"
                          >
                            <GitFork className="size-2.5 sm:size-3 mr-0.5 sm:mr-1" />
                            Fork
                          </Badge>
                        )}
                      </div>
                      {repo.description ? (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                          {repo.description}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground/50 italic mb-2 sm:mb-3">
                          No description provided
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
                        {/* LANGUAGE */}
                        {repo.language && (
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <span
                              className="size-2.5 sm:size-3 rounded-full"
                              style={{
                                backgroundColor: getLanguageColor(
                                  repo.language
                                ),
                              }}
                            />
                            {repo.language}
                          </span>
                        )}
                        {/* STARS */}
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <Star className="size-3 sm:size-3.5" />
                          {formatNumber(repo.stars)}
                        </span>
                        {/* FORKS */}
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <GitFork className="size-3 sm:size-3.5" />
                          {formatNumber(repo.forks)}
                        </span>
                        {/* UPDATED */}
                        <span className="hidden sm:flex items-center gap-0.5 sm:gap-1">
                          <Clock className="size-3 sm:size-3.5" />
                          {formatRelativeTime(repo.updatedAt)}
                        </span>
                        {/* EXTERNAL LINK */}
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden sm:flex items-center gap-0.5 sm:gap-1 hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="size-3 sm:size-3.5" />
                          View
                        </a>
                      </div>
                    </div>
                    {/* IMPORT BUTTON */}
                    <Button
                      size="sm"
                      className="shrink-0 h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
                      onClick={() => handleImport(repo.url)}
                      disabled={isImporting}
                    >
                      {isImporting && selectedRepoUrl === repo.url ? (
                        <>
                          <Loader2 className="size-3.5 sm:size-4 animate-spin" />
                          <span className="hidden sm:inline ml-2">
                            Importing...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3.5 sm:size-4" />
                          <span className="ml-1 sm:ml-2">Import</span>
                          <ArrowRight className="size-3.5 sm:size-4 ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all hidden sm:block" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {/* PAGINATION */}
      {showPagination && !showSkeleton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t"
        >
          <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Page {page} • {repositories.length} repos
            {repoData?.totalCount !== undefined &&
              ` of ${repoData.totalCount} total`}
          </p>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={handlePreviousPage}
              disabled={isFirstPage || isFetchingRepos}
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={handleNextPage}
              disabled={!hasMore || isFetchingRepos}
            >
              Next
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
      {/* TIP CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-2 sm:gap-3">
            <Sparkles className="size-4 sm:size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-primary mb-0.5 sm:mb-1">
                What happens when you import?
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We&apos;ll automatically extract the project name, description
                from README, detect the tech stack from languages, and set up
                your project. You can customize everything before publishing.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// <== SKELETON BASE COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURN SKELETON COMPONENT
  return (
    <div className={cn("bg-secondary rounded animate-pulse", className)} />
  );
};

// <== REPOSITORY CARD SKELETON ==>
const RepositoryCardSkeleton = () => {
  // RETURN REPOSITORY CARD SKELETON COMPONENT
  return (
    <Card className="p-3 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* ICON */}
        <Skeleton className="size-10 sm:size-12 rounded-lg shrink-0" />
        {/* INFO */}
        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 sm:h-5 w-28 sm:w-40" />
            <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded-full hidden sm:block" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-md" />
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-20" />
            <Skeleton className="h-2.5 sm:h-3 w-8 sm:w-12" />
            <Skeleton className="h-2.5 sm:h-3 w-8 sm:w-12" />
            <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16 hidden sm:block" />
          </div>
        </div>
        {/* BUTTON */}
        <Skeleton className="h-8 sm:h-10 w-16 sm:w-28 shrink-0" />
      </div>
    </Card>
  );
};

// <== REPOSITORY LIST SKELETON ==>
const RepositoryListSkeleton = () => {
  // RETURN REPOSITORY LIST SKELETON COMPONENT
  return (
    <div className="grid gap-2 sm:gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <RepositoryCardSkeleton key={i} />
      ))}
    </div>
  );
};

// <== IMPORT PAGE SKELETON ==>
const ImportPageSkeleton = () => {
  // RETURN IMPORT PAGE SKELETON COMPONENT
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* STATUS BANNER */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="size-9 sm:size-10 rounded-full" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-3.5 sm:h-4 w-32 sm:w-40" />
              <Skeleton className="h-2.5 sm:h-3 w-36 sm:w-48 hidden sm:block" />
            </div>
          </div>
          <Skeleton className="h-8 sm:h-9 w-10 sm:w-24" />
        </div>
      </Card>
      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Skeleton className="h-10 sm:h-11 flex-1" />
        <Skeleton className="h-10 sm:h-11 w-full sm:w-52" />
        <Skeleton className="h-10 sm:h-11 w-full sm:w-11" />
      </div>
      {/* REPOS */}
      <RepositoryListSkeleton />
    </div>
  );
};

// <== EXPORT SKELETON FOR LOADING.TSX ==>
export { ImportPageSkeleton };
