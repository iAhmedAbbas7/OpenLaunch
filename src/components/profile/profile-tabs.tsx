// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Folder,
  FileText,
  Activity,
  Trophy,
  Users,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileWithStats } from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// <== PROFILE TABS PROPS ==>
interface ProfileTabsProps {
  // <== PROFILE DATA ==>
  profile: ProfileWithStats;
  // <== ACTIVE TAB ==>
  activeTab?: string;
  // <== ON TAB CHANGE ==>
  onTabChange?: (tab: string) => void;
  // <== CLASS NAME ==>
  className?: string;
  // <== CHILDREN (TAB CONTENTS) ==>
  children?: React.ReactNode;
}

// <== PROFILE TABS CONFIG ==>
const tabs = [
  // <== PROJECTS TAB ==>
  {
    value: "projects",
    label: "Projects",
    icon: Folder,
  },
  // <== ARTICLES TAB ==>
  {
    value: "articles",
    label: "Articles",
    icon: FileText,
  },
  // <== ACTIVITY TAB ==>
  {
    value: "activity",
    label: "Activity",
    icon: Activity,
  },
  // <== ACHIEVEMENTS TAB ==>
  {
    value: "achievements",
    label: "Achievements",
    icon: Trophy,
  },
  // <== FOLLOWERS TAB ==>
  {
    value: "followers",
    label: "Followers",
    icon: Users,
  },
  // <== FOLLOWING TAB ==>
  {
    value: "following",
    label: "Following",
    icon: UserCheck,
  },
];

// <== PROFILE TABS COMPONENT ==>
export const ProfileTabs = ({
  profile,
  activeTab = "projects",
  onTabChange,
  className,
  children,
}: ProfileTabsProps) => {
  // GET TAB COUNTS
  const tabCounts: Record<string, number> = {
    projects: profile.projectsCount,
    articles: profile.articlesCount,
    followers: profile.followersCount,
    following: profile.followingCount,
  };
  // RETURNING PROFILE TABS COMPONENT
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className={cn("w-full", className)}
    >
      {/* TAB LIST */}
      <TabsList className="w-full h-auto p-0.5 sm:p-1 bg-secondary/30 rounded-lg sm:rounded-xl flex flex-wrap justify-start gap-0.5 sm:gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = tabCounts[tab.value];
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                "transition-all duration-200 text-xs sm:text-sm"
              )}
            >
              <Icon className="size-3.5 sm:size-4" />
              <span className="hidden md:inline">{tab.label}</span>
              {count !== undefined && (
                <span className="text-[10px] sm:text-xs text-muted-foreground bg-secondary/50 px-1 sm:px-1.5 py-0.5 rounded-full">
                  {count.toLocaleString()}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {/* TAB CONTENTS */}
      {children}
    </Tabs>
  );
};

// <== PROFILE TAB CONTENT WRAPPER ==>
export const ProfileTabContent = ({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  // RETURN PROFILE TAB CONTENT COMPONENT
  return (
    <TabsContent value={value} className={cn("mt-4 sm:mt-6", className)}>
      {children}
    </TabsContent>
  );
};
