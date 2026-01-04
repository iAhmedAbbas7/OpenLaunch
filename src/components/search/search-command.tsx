// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Search,
  FileText,
  FolderKanban,
  User,
  ArrowRight,
  BadgeCheck,
  TrendingUp,
  Newspaper,
  Compass,
  X,
  Clock,
  Trash2,
  Settings,
  LayoutDashboard,
  MessageCircle,
  Rocket,
  BookOpen,
  Trophy,
  Bell,
  Palette,
  Link as LinkIcon,
  Shield,
  PlusCircle,
  Import,
  Globe,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback, useMemo } from "react";
import { useSearchSuggestions } from "@/hooks/use-search";
import type { SearchResult } from "@/lib/validations/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== RECENT SEARCH ITEM TYPE ==>
interface RecentSearchItem {
  // <== ID ==>
  id: string;
  // <== TYPE ==>
  type: "project" | "article" | "user";
  // <== PRIMARY LABEL (NAME/TITLE/DISPLAY NAME) ==>
  label: string;
  // <== SECONDARY LABEL (TAGLINE/SUBTITLE/USERNAME) ==>
  subLabel: string | null;
  // <== HREF ==>
  href: string;
  // <== IMAGE URL ==>
  imageUrl: string | null;
  // <== STATS (UPVOTES/LIKES/REPUTATION) ==>
  stats: number;
  // <== STATS LABEL ==>
  statsLabel: string;
  // <== IS VERIFIED (FOR USERS) ==>
  isVerified?: boolean;
  // <== TIMESTAMP ==>
  timestamp: number;
}

// <== NAVIGATION ITEM TYPE ==>
interface NavigationItem {
  // <== ID ==>
  id: string;
  // <== HREF ==>
  href: string;
  // <== LABEL ==>
  label: string;
  // <== DESCRIPTION ==>
  description: string;
  // <== ICON ==>
  icon: LucideIcon;
  // <== CATEGORY ==>
  category: "dashboard" | "settings" | "actions";
  // <== KEYWORDS FOR SEARCH ==>
  keywords: string[];
}

// <== NAVIGATION ITEMS FOR LOGGED-IN USERS ==>
const getNavigationItems = (username?: string): NavigationItem[] => [
  // DASHBOARD ITEMS
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    description: "Your personal dashboard overview",
    icon: LayoutDashboard,
    category: "dashboard",
    keywords: ["home", "overview", "stats", "analytics"],
  },
  // MESSAGES ITEM
  {
    id: "messages",
    href: "/messages",
    label: "Messages",
    description: "Your conversations and messages",
    icon: MessageCircle,
    category: "dashboard",
    keywords: ["chat", "inbox", "conversations", "dm", "direct"],
  },
  // MY PROFILE ITEM
  {
    id: "my-profile",
    href: username ? `/u/${username}` : "/settings/profile",
    label: "My Profile",
    description: "View your public profile",
    icon: User,
    category: "dashboard",
    keywords: ["profile", "public", "view", "me"],
  },
  // MY PROJECTS ITEM
  {
    id: "my-projects",
    href: "/dashboard/projects",
    label: "My Projects",
    description: "Manage your launched projects",
    icon: Rocket,
    category: "dashboard",
    keywords: ["projects", "launched", "products", "apps"],
  },
  // MY ARTICLES ITEM
  {
    id: "my-articles",
    href: "/dashboard/articles",
    label: "My Articles",
    description: "Manage your published articles",
    icon: BookOpen,
    category: "dashboard",
    keywords: ["articles", "blog", "posts", "writing"],
  },
  // ACHIEVEMENTS ITEM
  {
    id: "achievements",
    href: "/dashboard/achievements",
    label: "Achievements",
    description: "View your badges and achievements",
    icon: Trophy,
    category: "dashboard",
    keywords: ["badges", "rewards", "trophies", "milestones"],
  },
  // NOTIFICATIONS ITEM
  {
    id: "notifications",
    href: "/notifications",
    label: "Notifications",
    description: "View all your notifications",
    icon: Bell,
    category: "dashboard",
    keywords: ["alerts", "updates", "activity"],
  },
  // NEW PROJECT ITEM
  {
    id: "new-project",
    href: "/dashboard/projects/new",
    label: "New Project",
    description: "Launch a new project",
    icon: PlusCircle,
    category: "actions",
    keywords: ["create", "launch", "add", "new", "project"],
  },
  // NEW ARTICLE ITEM
  {
    id: "new-article",
    href: "/dashboard/articles/new",
    label: "New Article",
    description: "Write a new article",
    icon: PlusCircle,
    category: "actions",
    keywords: ["create", "write", "add", "new", "article", "blog"],
  },
  // IMPORT PROJECT ITEM
  {
    id: "import-project",
    href: "/dashboard/projects/import",
    label: "Import from GitHub",
    description: "Import a project from GitHub",
    icon: Import,
    category: "actions",
    keywords: ["github", "import", "repository", "repo"],
  },
  // PROFILE SETTINGS ITEM
  {
    id: "settings-profile",
    href: "/settings/profile",
    label: "Profile Settings",
    description: "Edit your public profile information",
    icon: User,
    category: "settings",
    keywords: ["profile", "bio", "avatar", "display name", "username", "edit"],
  },
  // ACCOUNT SETTINGS ITEM
  {
    id: "settings-account",
    href: "/settings/account",
    label: "Account Settings",
    description: "Email, password, and security",
    icon: Settings,
    category: "settings",
    keywords: [
      "account",
      "email",
      "password",
      "security",
      "change password",
      "delete account",
    ],
  },
  // NOTIFICATIONS SETTINGS ITEM
  {
    id: "settings-notifications",
    href: "/settings/notifications",
    label: "Notification Preferences",
    description: "Email and push notification settings",
    icon: Bell,
    category: "settings",
    keywords: [
      "notifications",
      "email",
      "push",
      "alerts",
      "preferences",
      "subscribe",
      "unsubscribe",
    ],
  },
  // APPEARANCE SETTINGS ITEM
  {
    id: "settings-appearance",
    href: "/settings/appearance",
    label: "Appearance",
    description: "Theme and display settings",
    icon: Palette,
    category: "settings",
    keywords: ["theme", "dark mode", "light mode", "appearance", "display"],
  },
  // CONNECTIONS SETTINGS ITEM
  {
    id: "settings-connections",
    href: "/settings/connections",
    label: "Connections",
    description: "Connected accounts and integrations",
    icon: LinkIcon,
    category: "settings",
    keywords: [
      "connections",
      "github",
      "integrations",
      "linked accounts",
      "oauth",
    ],
  },
  // PRIVACY SETTINGS ITEM
  {
    id: "settings-privacy",
    href: "/settings/privacy",
    label: "Privacy Settings",
    description: "Privacy and data settings",
    icon: Shield,
    category: "settings",
    keywords: ["privacy", "data", "visibility", "public", "private"],
  },
];

// <== LOCAL STORAGE KEY ==>
const RECENT_SEARCHES_KEY = "openlaunch_recent_searches";
// <== MAX RECENT SEARCHES ==>
const MAX_RECENT_SEARCHES = 5;

// <== GET RECENT SEARCHES FROM LOCAL STORAGE ==>
const getRecentSearches = (): RecentSearchItem[] => {
  // CHECK IF WINDOW IS DEFINED
  if (typeof window === "undefined") return [];
  // TRY TO GET RECENT SEARCHES FROM LOCAL STORAGE
  try {
    // GET RECENT SEARCHES FROM LOCAL STORAGE
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    // CHECK IF STORED IS DEFINED
    if (!stored) return [];
    // PARSE STORED AS RECENT SEARCH ITEMS
    return JSON.parse(stored) as RecentSearchItem[];
  } catch {
    // RETURN EMPTY ARRAY IF ERROR
    return [];
  }
};

// <== SAVE RECENT SEARCHES TO LOCAL STORAGE ==>
const saveRecentSearches = (searches: RecentSearchItem[]) => {
  // CHECK IF WINDOW IS DEFINED
  if (typeof window === "undefined") return;
  // TRY TO SAVE RECENT SEARCHES TO LOCAL STORAGE
  try {
    // SAVE RECENT SEARCHES TO LOCAL STORAGE
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // IGNORE ERRORS IF ERROR OCCURS
  }
};

// <== ADD RECENT SEARCH ==>
const addRecentSearch = (item: RecentSearchItem): RecentSearchItem[] => {
  // GET CURRENT RECENT SEARCHES
  const current = getRecentSearches();
  // FILTER OUT DUPLICATE IF EXISTS
  const filtered = current.filter((s) => s.id !== item.id);
  // ADD NEW ITEM AT THE BEGINNING
  const updated = [item, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  // SAVE UPDATED RECENT SEARCHES
  saveRecentSearches(updated);
  // RETURN UPDATED RECENT SEARCHES
  return updated;
};

// <== REMOVE RECENT SEARCH ==>
const removeRecentSearch = (id: string): RecentSearchItem[] => {
  // GET CURRENT RECENT SEARCHES
  const current = getRecentSearches();
  // REMOVE ITEM BY ID
  const updated = current.filter((s) => s.id !== id);
  // SAVE UPDATED RECENT SEARCHES
  saveRecentSearches(updated);
  // RETURN UPDATED RECENT SEARCHES
  return updated;
};

// <== CLEAR ALL RECENT SEARCHES ==>
const clearAllRecentSearches = (): RecentSearchItem[] => {
  // CLEAR RECENT SEARCHES
  saveRecentSearches([]);
  // RETURN EMPTY ARRAY
  return [];
};

// <== SEARCH MODE TYPE ==>
type SearchMode = "global" | "settings";

// <== SEARCH COMMAND PROPS ==>
interface SearchCommandProps {
  // <== OPEN STATE ==>
  open?: boolean;
  // <== ON OPEN CHANGE ==>
  onOpenChange?: (open: boolean) => void;
  // <== IS AUTHENTICATED ==>
  isAuthenticated?: boolean;
  // <== USERNAME ==>
  username?: string;
}

// <== QUICK LINKS ==>
const quickLinks = [
  // EXPLORE
  { href: "/explore", label: "Explore Projects", icon: Compass },
  // ARTICLES
  { href: "/articles", label: "Browse Articles", icon: Newspaper },
  // LEADERBOARD
  { href: "/leaderboard", label: "Leaderboard", icon: TrendingUp },
];

// <== KEYBOARD KEY COMPONENT ==>
const Kbd = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <kbd
    className={cn(
      "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium font-mono",
      "bg-secondary/80 text-muted-foreground rounded border border-border/60",
      className
    )}
  >
    {children}
  </kbd>
);

// <== SEARCH RESULT SKELETON ==>
const SearchResultSkeleton = () => (
  <div className="flex items-center gap-3 py-2.5 px-3">
    <Skeleton className="size-8 rounded-md shrink-0" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="size-4 rounded shrink-0" />
  </div>
);

// <== CUSTOM COMMAND ITEM STYLES (PINK BORDER ON HOVER) ==>
const commandItemStyles =
  "flex items-center gap-3 py-2.5 px-3 cursor-pointer rounded-md border-2 border-transparent transition-all data-[selected=true]:border-primary/60 data-[selected=true]:bg-transparent data-[selected=true]:text-foreground [&_span]:data-[selected=true]:text-foreground [&_p]:data-[selected=true]:text-muted-foreground";

// <== SEARCH COMMAND COMPONENT ==>
export const SearchCommand = ({
  open = false,
  onOpenChange,
  isAuthenticated = false,
  username,
}: SearchCommandProps) => {
  // ROUTER
  const router = useRouter();
  // SEARCH INPUT STATE
  const [search, setSearch] = useState("");
  // SEARCH MODE STATE
  const [searchMode, setSearchMode] = useState<SearchMode>("global");
  // RECENT SEARCHES STATE (LAZY INIT FROM LOCAL STORAGE)
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() =>
    getRecentSearches()
  );
  // DEBOUNCED SEARCH
  const debouncedSearch = useDebounce(search, 200);
  // SEARCH SUGGESTIONS (ONLY IN GLOBAL MODE)
  const { data: suggestions, isFetching } = useSearchSuggestions(
    searchMode === "global" ? debouncedSearch : "",
    8
  );
  // IS ACTIVELY SEARCHING (typing but debounce not settled, or fetching)
  const isSearching =
    searchMode === "global" &&
    ((search.trim().length >= 2 && search !== debouncedSearch) ||
      (debouncedSearch.length >= 2 && isFetching));
  // NAVIGATION ITEMS
  const navigationItems = useMemo(
    () => getNavigationItems(username),
    [username]
  );
  // FILTERED NAVIGATION ITEMS
  const filteredNavigationItems = useMemo(() => {
    // CHECK IF NOT IN SETTINGS MODE OR NO SEARCH
    if (searchMode !== "settings" || !search.trim()) {
      // RETURN ALL NAVIGATION ITEMS
      return navigationItems;
    }
    // GET QUERY
    const query = search.toLowerCase().trim();
    // FILTER NAVIGATION ITEMS BY QUERY
    return navigationItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    );
  }, [navigationItems, search, searchMode]);
  // GROUP NAVIGATION ITEMS BY CATEGORY
  const groupedNavItems = useMemo(() => {
    // GROUP NAVIGATION ITEMS BY CATEGORY
    return {
      dashboard: filteredNavigationItems.filter(
        (item) => item.category === "dashboard"
      ),
      actions: filteredNavigationItems.filter(
        (item) => item.category === "actions"
      ),
      settings: filteredNavigationItems.filter(
        (item) => item.category === "settings"
      ),
    };
  }, [filteredNavigationItems]);
  // HANDLE OPEN CHANGE (RESET ON CLOSE)
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // RESET SEARCH STATE
        setSearch("");
        // RESET MODE TO GLOBAL
        setSearchMode("global");
      }
      // CALL PARENT HANDLER
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );
  // NAVIGATE TO HREF
  const navigateTo = useCallback(
    (href: string) => {
      // CLOSE DIALOG
      handleOpenChange(false);
      // NAVIGATE TO HREF
      router.push(href);
    },
    [handleOpenChange, router]
  );
  // HANDLE RESULT CLICK (ADDS TO RECENT)
  const handleResultClick = useCallback(
    (href: string, result: SearchResult) => {
      // BUILD RECENT ITEM BASED ON TYPE
      let recentItem: RecentSearchItem;
      // CHECK IF RESULT IS A PROJECT
      if (result.type === "project") {
        // BUILD RECENT ITEM FOR PROJECT
        recentItem = {
          id: `project-${result.slug}`,
          type: "project",
          label: result.name,
          subLabel: result.tagline,
          href,
          imageUrl: result.logoUrl,
          stats: result.upvotesCount,
          statsLabel: "upvotes",
          timestamp: Date.now(),
        };
      } else if (result.type === "article") {
        // BUILD RECENT ITEM FOR ARTICLE
        recentItem = {
          id: `article-${result.slug}`,
          type: "article",
          label: result.title,
          subLabel: result.subtitle,
          href,
          imageUrl: result.coverImageUrl,
          stats: result.likesCount,
          statsLabel: "likes",
          timestamp: Date.now(),
        };
      } else {
        // BUILD RECENT ITEM FOR USER
        recentItem = {
          id: `user-${result.username}`,
          type: "user",
          label: result.displayName ?? result.username,
          subLabel: `@${result.username}`,
          href,
          imageUrl: result.avatarUrl,
          stats: result.reputationScore,
          statsLabel: "rep",
          isVerified: result.isVerified,
          timestamp: Date.now(),
        };
      }
      // ADD RECENT ITEM TO RECENT SEARCHES
      setRecentSearches(addRecentSearch(recentItem));
      // NAVIGATE TO HREF
      navigateTo(href);
    },
    [navigateTo]
  );
  // HANDLE QUICK LINK / RECENT / NAV CLICK (NO ADD TO RECENT)
  const handleLinkClick = useCallback(
    (href: string) => {
      // NAVIGATE TO HREF
      navigateTo(href);
    },
    [navigateTo]
  );
  // HANDLE SEARCH
  const handleSearch = useCallback(() => {
    // SKIP IF NO SEARCH
    if (!search.trim()) return;
    // CLOSE DIALOG
    handleOpenChange(false);
    // NAVIGATE TO SEARCH PAGE
    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  }, [search, handleOpenChange, router]);
  // HANDLE CLEAR SEARCH
  const handleClearSearch = useCallback(() => {
    // RESET SEARCH
    setSearch("");
  }, []);
  // HANDLE REMOVE RECENT SEARCH
  const handleRemoveRecentSearch = useCallback(
    (e: React.MouseEvent, id: string) => {
      // STOP PROPAGATION AND PREVENT DEFAULT
      e.stopPropagation();
      // PREVENT DEFAULT
      e.preventDefault();
      // REMOVE RECENT SEARCH
      setRecentSearches(removeRecentSearch(id));
    },
    []
  );
  // HANDLE CLEAR ALL RECENT SEARCHES
  const handleClearAllRecentSearches = useCallback(() => {
    // CLEAR ALL RECENT SEARCHES
    setRecentSearches(clearAllRecentSearches());
  }, []);
  // TOGGLE SEARCH MODE
  const toggleSearchMode = useCallback(() => {
    // TOGGLE SEARCH MODE
    setSearchMode((prev) => (prev === "global" ? "settings" : "global"));
    // RESET SEARCH
    setSearch("");
  }, []);
  // GET RESULT HREF
  const getResultHref = (result: SearchResult): string => {
    // GET RESULT HREF BASED ON TYPE
    switch (result.type) {
      // RETURN PROJECT HREF
      case "project":
        return `/projects/${result.slug}`;
      // RETURN ARTICLE HREF
      case "article":
        return `/articles/${result.slug}`;
      // RETURN USER HREF
      case "user":
        return `/u/${result.username}`;
      // RETURN DEFAULT HREF
      default:
        return "/";
    }
  };
  // GET TYPE ICON
  const getTypeIcon = (type: "project" | "article" | "user") => {
    // GET TYPE ICON BASED ON TYPE
    switch (type) {
      // RETURN PROJECT ICON
      case "project":
        return FolderKanban;
      // RETURN ARTICLE ICON
      case "article":
        return FileText;
      // RETURN USER ICON
      case "user":
        // RETURN USER ICON
        return User;
    }
  };
  // RENDER RESULT ITEM
  const renderResultItem = (result: SearchResult) => {
    // GET COMMON PROPS
    const href = getResultHref(result);
    // RENDER BASED ON TYPE
    switch (result.type) {
      // RETURN PROJECT ITEM
      case "project":
        // RETURN PROJECT ITEM
        return (
          <CommandItem
            key={`project-${result.id}`}
            value={`project-${result.id}-${result.name}`}
            onSelect={() => handleResultClick(href, result)}
            className={commandItemStyles}
          >
            {/* PROJECT LOGO */}
            <Avatar className="size-8 rounded-md shrink-0">
              <AvatarImage
                src={result.logoUrl ?? undefined}
                alt={result.name}
              />
              <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-medium">
                {result.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* PROJECT INFO */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {result.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {result.upvotesCount} upvotes
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {result.tagline}
              </p>
            </div>
            {/* ICON */}
            <FolderKanban className="size-4 text-muted-foreground shrink-0" />
          </CommandItem>
        );
      case "article":
        // RETURN ARTICLE ITEM
        return (
          <CommandItem
            key={`article-${result.id}`}
            value={`article-${result.id}-${result.title}`}
            onSelect={() => handleResultClick(href, result)}
            className={commandItemStyles}
          >
            {/* ARTICLE COVER */}
            <Avatar className="size-8 rounded-md shrink-0">
              <AvatarImage
                src={result.coverImageUrl ?? undefined}
                alt={result.title}
              />
              <AvatarFallback className="rounded-md bg-primary/10">
                <FileText className="size-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            {/* ARTICLE INFO */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {result.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {result.likesCount} likes
                </span>
              </div>
              {result.subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {result.subtitle}
                </p>
              )}
            </div>
            {/* ICON */}
            <FileText className="size-4 text-muted-foreground shrink-0" />
          </CommandItem>
        );
      case "user":
        // RETURN USER ITEM
        return (
          <CommandItem
            key={`user-${result.id}`}
            value={`user-${result.id}-${result.username}`}
            onSelect={() => handleResultClick(href, result)}
            className={commandItemStyles}
          >
            {/* USER AVATAR */}
            <Avatar className="size-8 shrink-0">
              <AvatarImage
                src={result.avatarUrl ?? undefined}
                alt={result.displayName ?? result.username}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {(result.displayName ?? result.username)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* USER INFO */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm truncate">
                  {result.displayName ?? result.username}
                </span>
                {result.isVerified && (
                  <BadgeCheck className="size-3.5 text-primary shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                @{result.username}
              </p>
            </div>
            {/* ICON */}
            <User className="size-4 text-muted-foreground shrink-0" />
          </CommandItem>
        );
      default:
        return null;
    }
  };
  // RENDER NAVIGATION ITEM
  const renderNavigationItem = (item: NavigationItem) => (
    <CommandItem
      key={item.id}
      value={`nav-${item.id}-${item.label}-${item.keywords.join("-")}`}
      onSelect={() => handleLinkClick(item.href)}
      className={commandItemStyles}
    >
      {/* ICON */}
      <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <item.icon className="size-4 text-primary" />
      </div>
      {/* INFO */}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm">{item.label}</span>
        <p className="text-xs text-muted-foreground truncate">
          {item.description}
        </p>
      </div>
      {/* ARROW */}
      <ArrowRight className="size-4 text-muted-foreground shrink-0" />
    </CommandItem>
  );
  // GROUP SUGGESTIONS BY TYPE
  const groupedSuggestions = {
    // RETURN PROJECT SUGGESTIONS
    projects:
      suggestions?.suggestions.filter((s) => s.type === "project") ?? [],
    // RETURN ARTICLE SUGGESTIONS
    articles:
      suggestions?.suggestions.filter((s) => s.type === "article") ?? [],
    // RETURN USER SUGGESTIONS
    users: suggestions?.suggestions.filter((s) => s.type === "user") ?? [],
  };
  // CHECK IF HAS SUGGESTIONS
  const hasSuggestions =
    groupedSuggestions.projects.length > 0 ||
    groupedSuggestions.articles.length > 0 ||
    groupedSuggestions.users.length > 0;
  // RETURN COMPONENT
  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={
        searchMode === "global" ? "Search OpenLaunch" : "Navigate to Settings"
      }
      description={
        searchMode === "global"
          ? "Search for projects, articles, and users"
          : "Search for settings and navigation"
      }
      className="max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl"
      showCloseButton={false}
    >
      {/* MODE TOGGLE + SEARCH INPUT */}
      <div className="flex items-center border-b border-border/60">
        {/* MODE TOGGLE BUTTON (ONLY FOR AUTHENTICATED USERS) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSearchMode}
          className={cn(
            "h-12 px-3 rounded-none border-r border-border/60 shrink-0",
            searchMode === "settings" && "bg-primary/10 text-primary",
            !isAuthenticated && "hidden"
          )}
          title={
            searchMode === "global"
              ? "Switch to Settings Search"
              : "Switch to Global Search"
          }
        >
          {searchMode === "global" ? (
            <Settings className="size-4" />
          ) : (
            <Globe className="size-4" />
          )}
        </Button>
        {/* COMMAND INPUT */}
        <div className="relative flex-1">
          <CommandInput
            placeholder={
              searchMode === "global"
                ? "Search projects, articles, users..."
                : "Search settings and navigation..."
            }
            value={search}
            onValueChange={setSearch}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                search.trim() &&
                searchMode === "global"
              ) {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="border-0"
          />
          {/* CLEAR BUTTON */}
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              type="button"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
      {/* COMMAND LIST */}
      <CommandList className="max-h-[60vh] sm:max-h-[400px]">
        {/* GLOBAL SEARCH MODE */}
        {searchMode === "global" && (
          <>
            {/* LOADING SKELETONS */}
            {isSearching && (
              <CommandGroup heading="Searching...">
                <SearchResultSkeleton />
                <SearchResultSkeleton />
                <SearchResultSkeleton />
              </CommandGroup>
            )}
            {/* NO RESULTS */}
            {!isSearching && search.trim().length >= 2 && !hasSuggestions && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Search className="size-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No results found for &quot;{debouncedSearch}&quot;
                  </p>
                  <button
                    onClick={handleSearch}
                    className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    View all results
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </CommandEmpty>
            )}
            {/* SEARCH RESULTS */}
            {!isSearching && search.trim().length >= 2 && hasSuggestions && (
              <>
                {/* PROJECTS */}
                {groupedSuggestions.projects.length > 0 && (
                  <CommandGroup heading="Projects">
                    {groupedSuggestions.projects.map(renderResultItem)}
                  </CommandGroup>
                )}
                {/* ARTICLES */}
                {groupedSuggestions.articles.length > 0 && (
                  <CommandGroup heading="Articles">
                    {groupedSuggestions.articles.map(renderResultItem)}
                  </CommandGroup>
                )}
                {/* USERS */}
                {groupedSuggestions.users.length > 0 && (
                  <CommandGroup heading="Users">
                    {groupedSuggestions.users.map(renderResultItem)}
                  </CommandGroup>
                )}
                {/* VIEW ALL RESULTS */}
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleSearch}
                    className={commandItemStyles}
                  >
                    <Search className="size-4" />
                    <span>
                      View all results for &quot;{debouncedSearch}&quot;
                    </span>
                    <ArrowRight className="size-4 ml-auto" />
                  </CommandItem>
                </CommandGroup>
              </>
            )}
            {/* RECENT SEARCHES (WHEN NO SEARCH) */}
            {!search && recentSearches.length > 0 && (
              <CommandGroup>
                {/* HEADER WITH CLEAR ALL */}
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3" />
                    Recent Searches
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllRecentSearches}
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3 mr-1" />
                    Clear all
                  </Button>
                </div>
                {/* RECENT SEARCH ITEMS */}
                {recentSearches.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <CommandItem
                      key={item.id}
                      value={`recent-${item.id}`}
                      onSelect={() => handleLinkClick(item.href)}
                      className={cn(commandItemStyles, "group")}
                    >
                      {/* AVATAR */}
                      <Avatar
                        className={cn(
                          "size-8 shrink-0",
                          item.type === "user" ? "rounded-full" : "rounded-md"
                        )}
                      >
                        <AvatarImage
                          src={item.imageUrl ?? undefined}
                          alt={item.label}
                        />
                        <AvatarFallback
                          className={cn(
                            "text-xs font-medium bg-primary/10",
                            item.type === "user" ? "rounded-full" : "rounded-md"
                          )}
                        >
                          {item.type === "article" ? (
                            <FileText className="size-4 text-primary" />
                          ) : (
                            <span className="text-primary">
                              {item.label.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {item.label}
                          </span>
                          {item.isVerified && (
                            <BadgeCheck className="size-3.5 text-primary shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {item.stats} {item.statsLabel}
                          </span>
                        </div>
                        {item.subLabel && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.subLabel}
                          </p>
                        )}
                      </div>
                      {/* TYPE ICON */}
                      <TypeIcon className="size-4 text-muted-foreground shrink-0" />
                      {/* REMOVE BUTTON */}
                      <button
                        onClick={(e) => handleRemoveRecentSearch(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                        type="button"
                        aria-label="Remove from recent"
                      >
                        <X className="size-3" />
                      </button>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {/* QUICK LINKS (WHEN NO SEARCH) */}
            {!search && (
              <CommandGroup heading="Quick Links">
                {quickLinks.map((link) => (
                  <CommandItem
                    key={link.href}
                    value={link.label}
                    onSelect={() => handleLinkClick(link.href)}
                    className={commandItemStyles}
                  >
                    <link.icon className="size-4 text-muted-foreground" />
                    <span>{link.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
        {/* SETTINGS SEARCH MODE */}
        {searchMode === "settings" && isAuthenticated && (
          <>
            {/* NO RESULTS */}
            {search.trim() && filteredNavigationItems.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Settings className="size-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No settings found for &quot;{search}&quot;
                  </p>
                </div>
              </CommandEmpty>
            )}
            {/* DASHBOARD ITEMS */}
            {groupedNavItems.dashboard.length > 0 && (
              <CommandGroup heading="Dashboard">
                {groupedNavItems.dashboard.map(renderNavigationItem)}
              </CommandGroup>
            )}
            {/* ACTION ITEMS */}
            {groupedNavItems.actions.length > 0 && (
              <CommandGroup heading="Actions">
                {groupedNavItems.actions.map(renderNavigationItem)}
              </CommandGroup>
            )}
            {/* SETTINGS ITEMS */}
            {groupedNavItems.settings.length > 0 && (
              <CommandGroup heading="Settings">
                {groupedNavItems.settings.map(renderNavigationItem)}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
      {/* KEYBOARD SHORTCUTS FOOTER */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-border/60 bg-secondary/30">
        {/* LEFT SIDE - NAVIGATION HINTS */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span className="ml-1">Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd>↵</Kbd>
            <span className="ml-1">Select</span>
          </div>
        </div>
        {/* RIGHT SIDE - MODE INDICATOR + SHORTCUTS */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* MODE INDICATOR */}
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border/60",
              isAuthenticated ? "hidden sm:inline" : "hidden"
            )}
          >
            {searchMode === "global" ? "Global" : "Settings"}
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <span className="mr-1">Open</span>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1">Close</span>
            <Kbd>Esc</Kbd>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
};

// <== SEARCH TRIGGER BUTTON ==>
interface SearchTriggerProps {
  // <== ON CLICK ==>
  onClick?: () => void;
  // <== CLASS NAME ==>
  className?: string;
  // <== SHOW SHORTCUT ==>
  showShortcut?: boolean;
  // <== COMPACT ==>
  compact?: boolean;
}

// <== SEARCH TRIGGER COMPONENT ==>
export const SearchTrigger = ({
  onClick,
  className,
  showShortcut = true,
  compact = false,
}: SearchTriggerProps) => {
  // RETURN COMPONENT
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        "transition-colors duration-200 hover:text-foreground",
        compact
          ? "p-2 rounded-full border border-border/60 hover:border-border hover:bg-secondary/50"
          : "px-3 py-2 rounded-lg border border-border/60 hover:border-border hover:bg-secondary/50 w-full sm:w-64",
        className
      )}
      type="button"
    >
      <Search className={cn(compact ? "size-4" : "size-4")} />
      {!compact && (
        <>
          <span className="flex-1 text-left">Search...</span>
          {showShortcut && (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-secondary rounded border border-border">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </>
      )}
    </button>
  );
};
