// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Search,
  X,
  FolderKanban,
  FileText,
  Users,
  Loader2,
  SearchX,
} from "lucide-react";
import {
  useInfiniteSearchProjects,
  useInfiniteSearchArticles,
  useInfiniteSearchUserProfiles,
  useSearchAll,
} from "@/hooks/use-search";
import {
  ProjectResultItem,
  ProjectResultItemSkeleton,
  ArticleResultItem,
  ArticleResultItemSkeleton,
  UserResultItem,
  UserResultItemSkeleton,
  SearchResultsList,
  SearchResultsSummary,
} from "@/components/search";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useState, useEffect, useCallback } from "react";
import type { SearchType } from "@/lib/validations/search";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// <== SEARCH DEBOUNCE DELAY (MS) ==>
const SEARCH_DEBOUNCE_DELAY = 300;

// <== TAB OPTIONS ==>
const tabOptions: {
  value: SearchType;
  label: string;
  icon: React.ElementType;
}[] = [
  // ALL TAB
  { value: "all", label: "All", icon: Search },
  // PROJECTS TAB
  { value: "projects", label: "Projects", icon: FolderKanban },
  // ARTICLES TAB
  { value: "articles", label: "Articles", icon: FileText },
  // USERS TAB
  { value: "users", label: "Users", icon: Users },
];

// <== SEARCH PAGE CLIENT COMPONENT ==>
export const SearchPageClient = () => {
  // ROUTER
  const router = useRouter();
  // SEARCH PARAMS
  const searchParams = useSearchParams();
  // INITIAL QUERY
  const initialQuery = searchParams.get("q") ?? "";
  // INITIAL TAB
  const initialTab = (searchParams.get("type") as SearchType) ?? "all";
  // SEARCH STATE
  const [search, setSearch] = useState(initialQuery);
  // ACTIVE TAB STATE
  const [activeTab, setActiveTab] = useState<SearchType>(initialTab);
  // DEBOUNCED SEARCH
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
  // SEARCH ALL (FOR ALL TAB)
  const { data: allResults, isLoading: isLoadingAll } = useSearchAll(
    activeTab === "all" ? debouncedSearch : "",
    10
  );
  // SEARCH PROJECTS (FOR PROJECTS TAB)
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    fetchNextPage: fetchNextProjects,
    hasNextPage: hasNextProjects,
    isFetchingNextPage: isFetchingNextProjects,
  } = useInfiniteSearchProjects(
    activeTab === "projects" ? debouncedSearch : "",
    10
  );
  // SEARCH ARTICLES (FOR ARTICLES TAB)
  const {
    data: articlesData,
    isLoading: isLoadingArticles,
    fetchNextPage: fetchNextArticles,
    hasNextPage: hasNextArticles,
    isFetchingNextPage: isFetchingNextArticles,
  } = useInfiniteSearchArticles(
    activeTab === "articles" ? debouncedSearch : "",
    10
  );
  // SEARCH USERS (FOR USERS TAB)
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsers,
    isFetchingNextPage: isFetchingNextUsers,
  } = useInfiniteSearchUserProfiles(
    activeTab === "users" ? debouncedSearch : "",
    10
  );
  // FLATTEN PROJECTS DATA
  const allProjects = projectsData?.pages.flatMap((page) => page.items) ?? [];
  // FLATTEN ARTICLES DATA
  const allArticles = articlesData?.pages.flatMap((page) => page.items) ?? [];
  // FLATTEN USERS DATA
  const allUsers = usersData?.pages.flatMap((page) => page.items) ?? [];
  // GET TOTAL COUNT
  const getTotalCount = () => {
    // SWITCH ON ACTIVE TAB
    switch (activeTab) {
      // ALL TAB
      case "all":
        return allResults?.totalCount ?? 0;
      // PROJECTS TAB
      case "projects":
        return projectsData?.pages[0]?.total ?? 0;
      // ARTICLES TAB
      case "articles":
        return articlesData?.pages[0]?.total ?? 0;
      // USERS TAB
      case "users":
        return usersData?.pages[0]?.total ?? 0;
      // DEFAULT
      default:
        return 0;
    }
  };
  // IS LOADING
  const isLoading =
    (activeTab === "all" && isLoadingAll) ||
    (activeTab === "projects" && isLoadingProjects) ||
    (activeTab === "articles" && isLoadingArticles) ||
    (activeTab === "users" && isLoadingUsers);
  // UPDATE URL PARAMS
  useEffect(() => {
    // BUILD URL SEARCH PARAMS
    const params = new URLSearchParams();
    // ADD QUERY PARAM
    if (debouncedSearch) params.set("q", debouncedSearch);
    // ADD TYPE PARAM
    if (activeTab !== "all") params.set("type", activeTab);
    // BUILD NEW URL
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    // REPLACE URL
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, activeTab, router]);
  // HANDLE CLEAR SEARCH
  const handleClearSearch = useCallback(() => {
    // CLEAR SEARCH
    setSearch("");
  }, []);
  // HANDLE TAB CHANGE
  const handleTabChange = useCallback((value: string) => {
    // SET ACTIVE TAB
    setActiveTab(value as SearchType);
  }, []);
  // RETURN SEARCH PAGE CLIENT COMPONENT
  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 sm:mb-8"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON */}
          <div className="size-10 sm:size-14 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Search className="size-5 sm:size-7 text-primary" />
          </div>
          {/* TEXT */}
          <div className="min-w-0 flex-1">
            {/* BADGE */}
            <Badge
              variant="secondary"
              className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs"
            >
              <Search className="size-2.5 sm:size-3 mr-1" />
              Search
            </Badge>
            {/* HEADING */}
            <h1 className="text-xl sm:text-3xl font-bold font-heading mb-0.5 sm:mb-1">
              Search OpenLaunch
            </h1>
            {/* SUBTEXT */}
            <p className="text-xs sm:text-base text-muted-foreground">
              Find projects, articles, and users across the platform
            </p>
          </div>
        </div>
      </motion.div>
      {/* SEARCH INPUT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-5 sm:mb-8"
      >
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-muted-foreground" />
          <Input
            placeholder="Search projects, articles, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base"
            autoFocus
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 size-7 sm:size-8"
              onClick={handleClearSearch}
            >
              <X className="size-3.5 sm:size-4" />
            </Button>
          )}
        </div>
      </motion.div>
      {/* NO QUERY STATE */}
      {!debouncedSearch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-10 sm:py-16"
        >
          <div className="p-3 sm:p-4 rounded-full bg-secondary w-fit mx-auto mb-3 sm:mb-4">
            <Search className="size-6 sm:size-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
            Start Searching
          </h3>
          <p className="text-xs sm:text-base text-muted-foreground max-w-xs sm:max-w-sm mx-auto px-4">
            Enter a search query above to find projects, articles, and users on
            OpenLaunch.
          </p>
        </motion.div>
      )}
      {/* RESULTS */}
      {debouncedSearch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* RESULTS SUMMARY */}
          {!isLoading && (
            <SearchResultsSummary
              query={debouncedSearch}
              totalCount={getTotalCount()}
              className="mb-3 sm:mb-4"
            />
          )}
          {/* TABS */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* TAB LIST */}
            <TabsList className="mb-4 sm:mb-6 h-9 sm:h-10 p-1 w-full sm:w-auto">
              {tabOptions.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 flex-1 sm:flex-initial"
                >
                  <tab.icon className="size-3 sm:size-4" />
                  <span className="hidden xs:inline sm:inline">
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {/* ALL TAB */}
            <TabsContent value="all" className="space-y-4 sm:space-y-6">
              {isLoadingAll ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* PROJECTS SKELETONS */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                      <FolderKanban className="size-3.5 sm:size-4" />
                      Projects
                    </h3>
                    <ProjectResultItemSkeleton />
                    <ProjectResultItemSkeleton />
                  </div>
                  {/* ARTICLES SKELETONS */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                      <FileText className="size-3.5 sm:size-4" />
                      Articles
                    </h3>
                    <ArticleResultItemSkeleton />
                    <ArticleResultItemSkeleton />
                  </div>
                  {/* USERS SKELETONS */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                      <Users className="size-3.5 sm:size-4" />
                      Users
                    </h3>
                    <UserResultItemSkeleton />
                    <UserResultItemSkeleton />
                  </div>
                </div>
              ) : (
                <>
                  {/* NO RESULTS */}
                  {allResults?.totalCount === 0 && (
                    <div className="text-center py-8 sm:py-12">
                      <SearchX className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-muted-foreground">
                        No results found for &quot;{debouncedSearch}&quot;
                      </p>
                    </div>
                  )}
                  {/* PROJECTS */}
                  {(allResults?.projects.length ?? 0) > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                          <FolderKanban className="size-3.5 sm:size-4" />
                          Projects
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
                          onClick={() => setActiveTab("projects")}
                        >
                          View all
                        </Button>
                      </div>
                      {allResults?.projects.map((project) => (
                        <ProjectResultItem key={project.id} project={project} />
                      ))}
                    </div>
                  )}
                  {/* ARTICLES */}
                  {(allResults?.articles.length ?? 0) > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                          <FileText className="size-3.5 sm:size-4" />
                          Articles
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
                          onClick={() => setActiveTab("articles")}
                        >
                          View all
                        </Button>
                      </div>
                      {allResults?.articles.map((article) => (
                        <ArticleResultItem key={article.id} article={article} />
                      ))}
                    </div>
                  )}
                  {/* USERS */}
                  {(allResults?.users.length ?? 0) > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                          <Users className="size-3.5 sm:size-4" />
                          Users
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
                          onClick={() => setActiveTab("users")}
                        >
                          View all
                        </Button>
                      </div>
                      {allResults?.users.map((user) => (
                        <UserResultItem key={user.id} user={user} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            {/* PROJECTS TAB */}
            <TabsContent value="projects">
              <SearchResultsList
                items={allProjects}
                renderItem={(project) => (
                  <ProjectResultItem key={project.id} project={project} />
                )}
                isLoading={isLoadingProjects}
                renderSkeleton={(index) => (
                  <ProjectResultItemSkeleton key={index} />
                )}
                emptyMessage={`No projects found for "${debouncedSearch}"`}
                EmptyIcon={FolderKanban}
              />
              {/* LOAD MORE */}
              {hasNextProjects && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextProjects()}
                    disabled={isFetchingNextProjects}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {isFetchingNextProjects ? (
                      <>
                        <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
            {/* ARTICLES TAB */}
            <TabsContent value="articles">
              <SearchResultsList
                items={allArticles}
                renderItem={(article) => (
                  <ArticleResultItem key={article.id} article={article} />
                )}
                isLoading={isLoadingArticles}
                renderSkeleton={(index) => (
                  <ArticleResultItemSkeleton key={index} />
                )}
                emptyMessage={`No articles found for "${debouncedSearch}"`}
                EmptyIcon={FileText}
              />
              {/* LOAD MORE */}
              {hasNextArticles && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextArticles()}
                    disabled={isFetchingNextArticles}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {isFetchingNextArticles ? (
                      <>
                        <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
            {/* USERS TAB */}
            <TabsContent value="users">
              <SearchResultsList
                items={allUsers}
                renderItem={(user) => (
                  <UserResultItem key={user.id} user={user} />
                )}
                isLoading={isLoadingUsers}
                renderSkeleton={(index) => (
                  <UserResultItemSkeleton key={index} />
                )}
                emptyMessage={`No users found for "${debouncedSearch}"`}
                EmptyIcon={Users}
              />
              {/* LOAD MORE */}
              {hasNextUsers && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextUsers()}
                    disabled={isFetchingNextUsers}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {isFetchingNextUsers ? (
                      <>
                        <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
};
