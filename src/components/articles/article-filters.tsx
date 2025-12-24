// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ArticleFiltersInput,
  ArticleSortBy,
} from "@/lib/validations/articles";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

// <== ARTICLE FILTERS PROPS ==>
interface ArticleFiltersProps {
  // <== CURRENT FILTERS ==>
  filters: ArticleFiltersInput;
  // <== CURRENT SORT ==>
  sortBy: ArticleSortBy;
  // <== AVAILABLE TAGS ==>
  availableTags?: string[];
  // <== ON FILTERS CHANGE ==>
  onFiltersChange: (filters: ArticleFiltersInput) => void;
  // <== ON SORT CHANGE ==>
  onSortChange: (sortBy: ArticleSortBy) => void;
  // <== ON RESET ==>
  onReset: () => void;
  // <== IS LOADING ==>
  isLoading?: boolean;
}

// <== SORT OPTIONS ==>
const SORT_OPTIONS: { value: ArticleSortBy; label: string }[] = [
  // NEWEST
  { value: "newest", label: "Newest First" },
  // OLDEST
  { value: "oldest", label: "Oldest First" },
  // POPULAR
  { value: "popular", label: "Most Popular" },
  // MOST COMMENTED
  { value: "most_commented", label: "Most Commented" },
  // TRENDING
  { value: "trending", label: "Trending" },
];

// <== ARTICLE FILTERS COMPONENT ==>
export const ArticleFilters = ({
  filters,
  sortBy,
  availableTags = [],
  onFiltersChange,
  onSortChange,
  onReset,
  isLoading,
}: ArticleFiltersProps) => {
  // SEARCH INPUT STATE
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  // MOBILE FILTERS SHEET OPEN STATE
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  // TRACK IF INITIAL MOUNT
  const isInitialMount = useRef(true);
  // FILTERS REF
  const filtersRef = useRef(filters);
  // ON FILTERS CHANGE REF
  const onFiltersChangeRef = useRef(onFiltersChange);
  // UPDATE FILTERS AND ON FILTERS CHANGE REFS WHEN PROPS CHANGE
  useEffect(() => {
    // UPDATE FILTERS REF
    filtersRef.current = filters;
    // UPDATE ON FILTERS CHANGE REF
    onFiltersChangeRef.current = onFiltersChange;
  }, [filters, onFiltersChange]);
  // DEBOUNCED SEARCH
  const debouncedSearch = useDebounce(searchInput, 300);
  // EFFECT TO HANDLE DEBOUNCED SEARCH CHANGES
  useEffect(() => {
    // SKIP INITIAL MOUNT IF TRUE
    if (isInitialMount.current) {
      // SET INITIAL MOUNT TO FALSE
      isInitialMount.current = false;
      // RETURN
      return;
    }
    // UPDATE FILTERS IF SEARCH CHANGED
    const currentFilters = filtersRef.current;
    // CHECK IF DEBOUNCED SEARCH IS NOT EQUAL TO CURRENT FILTERS SEARCH
    if (debouncedSearch !== (currentFilters.search ?? "")) {
      // UPDATE FILTERS
      onFiltersChangeRef.current({
        ...currentFilters,
        search: debouncedSearch || undefined,
      });
    }
  }, [debouncedSearch]);
  // HANDLE TAG TOGGLE
  const handleTagToggle = useCallback(
    (tag: string) => {
      // GET CURRENT TAGS
      const currentTags = filters.tags ?? [];
      // CHECK IF TAG IS ALREADY IN TAGS
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      // UPDATE FILTERS
      onFiltersChange({
        ...filters,
        tags: newTags.length > 0 ? newTags : undefined,
      });
    },
    [filters, onFiltersChange]
  );
  // HANDLE CLEAR SEARCH
  const handleClearSearch = () => {
    // SET SEARCH INPUT TO EMPTY STRING
    setSearchInput("");
    // UPDATE FILTERS
    onFiltersChange({ ...filters, search: undefined });
  };
  // CHECK IF ANY FILTERS ARE ACTIVE
  const hasActiveFilters =
    (filters.tags && filters.tags.length > 0) || filters.search;
  // RETURN ARTICLE FILTERS COMPONENT
  return (
    // ARTICLE FILTERS CONTAINER
    <div className="space-y-3 sm:space-y-4">
      {/* SEARCH AND SORT ROW */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* SEARCH INPUT BOX */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9 h-9 sm:h-10 text-sm"
            disabled={isLoading}
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {/* SORT SELECT - DESKTOP */}
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as ArticleSortBy)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-44 h-9 sm:h-10 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* MOBILE FILTERS BUTTON */}
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden h-9 gap-2"
              disabled={isLoading}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 size-5 p-0 text-xs">
                  {(filters.tags?.length ?? 0) + (filters.search ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>Filter Articles</SheetTitle>
              <SheetDescription>
                Filter articles by tags to find what you&apos;re looking for.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {/* TAGS IN MOBILE SHEET */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                    {availableTags.map((tag) => {
                      const isSelected = filters.tags?.includes(tag);
                      return (
                        <Badge
                          key={tag}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* CLEAR FILTERS */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onReset();
                    setSearchInput("");
                    setIsFiltersOpen(false);
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {/* TAGS ROW - DESKTOP */}
      {availableTags.length > 0 && (
        <div className="hidden sm:block">
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 15).map((tag) => {
              const isSelected = filters.tags?.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer text-xs hover:bg-primary/10"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              );
            })}
            {availableTags.length > 15 && (
              <Badge variant="secondary" className="text-xs">
                +{availableTags.length - 15} more
              </Badge>
            )}
          </div>
        </div>
      )}
      {/* ACTIVE FILTERS */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {filters.search && (
              <Badge
                variant="secondary"
                className="gap-1 text-xs cursor-pointer"
                onClick={handleClearSearch}
              >
                Search: {filters.search}
                <X className="size-3" />
              </Badge>
            )}
            {filters.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 text-xs cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                <X className="size-3" />
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onReset();
              setSearchInput("");
            }}
            className="h-6 px-2 text-xs ml-auto"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

// <== ARTICLE FILTERS SKELETON ==>
export const ArticleFiltersSkeleton = () => {
  // RETURNING SKELETON
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* SEARCH AND SORT ROW */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="h-9 sm:h-10 flex-1 bg-secondary rounded-md animate-pulse" />
        <div className="h-9 sm:h-10 w-full sm:w-44 bg-secondary rounded-md animate-pulse" />
        <div className="h-9 sm:hidden bg-secondary rounded-md animate-pulse" />
      </div>

      {/* TAGS ROW - DESKTOP */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-5 sm:h-6 bg-secondary rounded-full animate-pulse"
            style={{ width: `${60 + (Math.floor(i * 12) % 40)}px` }}
          />
        ))}
      </div>
    </div>
  );
};

// <== EXPORTING ARTICLE FILTERS ==>
export default ArticleFilters;
