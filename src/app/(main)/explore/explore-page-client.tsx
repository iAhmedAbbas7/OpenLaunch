// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  ProjectGrid,
  ProjectGridSkeleton,
  ProjectFilters,
} from "@/components/projects";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import type { ProjectSortBy } from "@/lib/validations/projects";
import { Compass, Folder, RefreshCw, Loader2 } from "lucide-react";
import { useInfiniteProjects, useCategories, useDebounce } from "@/hooks";

// <== SEARCH DEBOUNCE DELAY (MS) ==>
const SEARCH_DEBOUNCE_DELAY = 400;

// <== POPULAR TECH STACK ==>
const POPULAR_TECH_STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "Rust",
  "Go",
  "Vue.js",
  "Svelte",
  "Docker",
  "AWS",
];

// <== EXPLORE PAGE CLIENT COMPONENT ==>
export const ExplorePageClient = () => {
  // ROUTER
  const router = useRouter();
  // SEARCH PARAMS
  const searchParams = useSearchParams();
  // SEARCH STATE
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  // SORT BY STATE
  const [sortBy, setSortBy] = useState<ProjectSortBy>(
    (searchParams.get("sort") as ProjectSortBy) ?? "trending"
  );
  // CATEGORY ID STATE
  const [categoryId, setCategoryId] = useState<string | undefined>(
    searchParams.get("category") ?? undefined
  );
  // TECH STACK STATE
  const [techStack, setTechStack] = useState<string[]>(
    searchParams.getAll("tech") ?? []
  );
  // IS OPEN SOURCE STATE
  const [isOpenSource, setIsOpenSource] = useState<boolean | undefined>(
    searchParams.get("openSource") === "true"
      ? true
      : searchParams.get("openSource") === "false"
      ? false
      : undefined
  );
  // DEBOUNCED SEARCH VALUE
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
  // GET CATEGORIES
  const { data: categories } = useCategories();
  // GET PROJECTS - USING DEBOUNCED SEARCH
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteProjects({
    search: debouncedSearch || undefined,
    sortBy,
    categoryId,
    techStack: techStack.length > 0 ? techStack : undefined,
    isOpenSource,
  });
  // <== UPDATE URL PARAMS - USING DEBOUNCED SEARCH ==>
  useEffect(() => {
    // BUILD URL SEARCH PARAMS
    const params = new URLSearchParams();
    // ADD SEARCH PARAM
    if (debouncedSearch) params.set("search", debouncedSearch);
    // ADD SORT BY PARAM
    if (sortBy !== "trending") params.set("sort", sortBy);
    // ADD CATEGORY ID PARAM
    if (categoryId) params.set("category", categoryId);
    // ADD TECH STACK PARAMS
    techStack.forEach((tech) => params.append("tech", tech));
    // ADD IS OPEN SOURCE PARAM
    if (isOpenSource !== undefined)
      // ADD IS OPEN SOURCE PARAM
      params.set("openSource", String(isOpenSource));
    // BUILD NEW URL
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    // REPLACE URL
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, sortBy, categoryId, techStack, isOpenSource, router]);
  // <== HANDLE CLEAR ALL ==>
  const handleClearAll = () => {
    // CLEAR SEARCH
    setSearch("");
    // CLEAR SORT BY
    setSortBy("trending");
    // CLEAR CATEGORY ID
    setCategoryId(undefined);
    // CLEAR TECH STACK
    setTechStack([]);
    // CLEAR IS OPEN SOURCE
    setIsOpenSource(undefined);
  };
  // ALL PROJECTS
  const allProjects = data?.pages.flatMap((page) => page.items) ?? [];
  // RETURN EXPLORE PAGE CLIENT COMPONENT
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON */}
          <div className="size-12 sm:size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Compass className="size-6 sm:size-7 text-primary" />
          </div>
          {/* TEXT */}
          <div className="min-w-0">
            {/* BADGE */}
            <Badge variant="secondary" className="mb-2 text-xs">
              <Folder className="size-3 mr-1" />
              Browse Projects
            </Badge>
            {/* HEADING */}
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-1">
              Explore Projects
            </h1>
            {/* SUBTEXT */}
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover amazing projects built by developers from around the
              world
            </p>
          </div>
        </div>
      </motion.div>

      {/* FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <ProjectFilters
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories ?? []}
          techStack={techStack}
          onTechStackChange={setTechStack}
          availableTechStack={POPULAR_TECH_STACK}
          isOpenSource={isOpenSource}
          onOpenSourceChange={setIsOpenSource}
          onClearAll={handleClearAll}
        />
      </motion.div>

      {/* LOADING STATE */}
      {isLoading && <ProjectGridSkeleton columns={2} count={6} />}

      {/* ERROR STATE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 sm:py-12"
        >
          <div className="p-3 sm:p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-3 sm:mb-4">
            <RefreshCw className="size-6 sm:size-8 text-destructive" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Failed to load projects
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {error.message}
          </p>
          <Button
            onClick={() => refetch()}
            size="sm"
            className="sm:size-default"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !error && allProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 sm:py-12"
        >
          <div className="p-3 sm:p-4 rounded-full bg-secondary w-fit mx-auto mb-3 sm:mb-4">
            <Folder className="size-6 sm:size-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            No projects found
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {search || categoryId || techStack.length > 0
              ? "Try adjusting your filters or search query."
              : "Be the first to launch a project!"}
          </p>
          <Button
            variant="outline"
            onClick={handleClearAll}
            size="sm"
            className="sm:size-default"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* PROJECTS GRID */}
      {!isLoading && !error && allProjects.length > 0 && (
        <>
          <ProjectGrid projects={allProjects} columns={2} />
          {/* LOAD MORE */}
          {hasNextPage && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                size="sm"
                className="sm:size-default"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-3.5 sm:size-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  "Load More Projects"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
