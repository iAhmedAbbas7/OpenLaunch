// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Search,
  SlidersHorizontal,
  X,
  TrendingUp,
  Clock,
  MessageSquare,
  Flame,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/db/schema";
import type { ProjectSortBy } from "@/lib/validations/projects";

// <== PROJECT FILTERS PROPS ==>
interface ProjectFiltersProps {
  // <== SEARCH ==>
  search?: string;
  // <== ON SEARCH CHANGE ==>
  onSearchChange?: (value: string) => void;
  // <== SORT BY ==>
  sortBy?: ProjectSortBy;
  // <== ON SORT CHANGE ==>
  onSortChange?: (value: ProjectSortBy) => void;
  // <== CATEGORY ==>
  categoryId?: string;
  // <== ON CATEGORY CHANGE ==>
  onCategoryChange?: (value: string | undefined) => void;
  // <== CATEGORIES ==>
  categories?: Category[];
  // <== TECH STACK ==>
  techStack?: string[];
  // <== ON TECH STACK CHANGE ==>
  onTechStackChange?: (value: string[]) => void;
  // <== AVAILABLE TECH STACK ==>
  availableTechStack?: string[];
  // <== IS OPEN SOURCE ==>
  isOpenSource?: boolean;
  // <== ON OPEN SOURCE CHANGE ==>
  onOpenSourceChange?: (value: boolean | undefined) => void;
  // <== ON CLEAR ALL ==>
  onClearAll?: () => void;
  // <== CLASS NAME ==>
  className?: string;
}

// <== SORT OPTIONS ==>
const sortOptions: {
  value: ProjectSortBy;
  label: string;
  icon: React.ElementType;
}[] = [
  // <== TRENDING ==>
  { value: "trending", label: "Trending", icon: Flame },
  // <== NEWEST ==>
  { value: "newest", label: "Newest", icon: Clock },
  // <== POPULAR ==>
  { value: "popular", label: "Most Upvoted", icon: TrendingUp },
  // <== MOST COMMENTED ==>
  { value: "most_commented", label: "Most Discussed", icon: MessageSquare },
];

// <== PROJECT FILTERS COMPONENT ==>
export const ProjectFilters = ({
  search,
  onSearchChange,
  sortBy = "trending",
  onSortChange,
  categoryId,
  onCategoryChange,
  categories = [],
  techStack = [],
  onTechStackChange,
  availableTechStack = [],
  isOpenSource,
  onOpenSourceChange,
  onClearAll,
  className,
}: ProjectFiltersProps) => {
  // COUNT ACTIVE FILTERS
  const activeFiltersCount = [
    categoryId,
    techStack.length > 0,
    isOpenSource !== undefined,
  ].filter(Boolean).length;
  // RETURNING PROJECT FILTERS COMPONENT
  return (
    <div className={cn("space-y-4", className)}>
      {/* TOP ROW */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 h-11"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
              onClick={() => onSearchChange?.("")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        {/* SORT */}
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange?.(value as ProjectSortBy)}
        >
          <SelectTrigger className="w-full sm:w-48 h-11">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="size-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* FILTERS POPOVER */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-11 gap-2">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="size-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-auto py-1 px-2 text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              {/* CATEGORY FILTER */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={categoryId ?? "all"}
                    onValueChange={(value) =>
                      onCategoryChange?.(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* TECH STACK FILTER */}
              {availableTechStack.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tech Stack</label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {availableTechStack.map((tech) => {
                      const isSelected = techStack.includes(tech);
                      return (
                        <Badge
                          key={tech}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isSelected && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => {
                            if (isSelected) {
                              onTechStackChange?.(
                                techStack.filter((t) => t !== tech)
                              );
                            } else {
                              onTechStackChange?.([...techStack, tech]);
                            }
                          }}
                        >
                          {tech}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* OPEN SOURCE FILTER */}
              <div className="space-y-2">
                <label className="text-sm font-medium">License</label>
                <div className="flex gap-2">
                  <Badge
                    variant={isOpenSource === undefined ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onOpenSourceChange?.(undefined)}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={isOpenSource === true ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onOpenSourceChange?.(true)}
                  >
                    Open Source
                  </Badge>
                  <Badge
                    variant={isOpenSource === false ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onOpenSourceChange?.(false)}
                  >
                    Proprietary
                  </Badge>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {/* ACTIVE FILTERS */}
      {(categoryId || techStack.length > 0 || isOpenSource !== undefined) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {categoryId && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {categories.find((c) => c.id === categoryId)?.name ?? "Category"}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() => onCategoryChange?.(undefined)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="gap-1 pr-1">
              {tech}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() =>
                  onTechStackChange?.(techStack.filter((t) => t !== tech))
                }
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
          {isOpenSource !== undefined && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {isOpenSource ? "Open Source" : "Proprietary"}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() => onOpenSourceChange?.(undefined)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
