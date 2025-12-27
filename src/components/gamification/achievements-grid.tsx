// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import type { AchievementWithProgress } from "@/hooks/use-achievements";
import { AchievementCard, AchievementCardSkeleton } from "./achievement-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// <== ACHIEVEMENTS GRID PROPS ==>
interface AchievementsGridProps {
  // <== ACHIEVEMENTS DATA ==>
  achievements: AchievementWithProgress[];
  // <== LOADING STATE ==>
  isLoading?: boolean;
  // <== SHOW PROGRESS ==>
  showProgress?: boolean;
  // <== COLUMNS ==>
  columns?: 1 | 2 | 3;
  // <== SIZE ==>
  size?: "sm" | "default" | "lg";
  // <== CLASS NAME ==>
  className?: string;
}

// <== ACHIEVEMENTS GRID COMPONENT ==>
export const AchievementsGrid = ({
  achievements,
  isLoading = false,
  showProgress = true,
  columns = 2,
  size = "default",
  className,
}: AchievementsGridProps) => {
  // COLUMN CLASSES
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };
  // LOADING STATE
  if (isLoading) {
    // RETURN SKELETONS
    return (
      <div className={cn("grid gap-4", columnClasses[columns], className)}>
        {[...Array(6)].map((_, i) => (
          <AchievementCardSkeleton key={i} size={size} />
        ))}
      </div>
    );
  }
  // RETURN ACHIEVEMENTS GRID
  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          showProgress={showProgress}
          size={size}
        />
      ))}
    </div>
  );
};

// <== ACHIEVEMENTS TABBED GRID PROPS ==>
interface AchievementsTabbedGridProps {
  // <== ACHIEVEMENTS DATA ==>
  achievements: AchievementWithProgress[];
  // <== LOADING STATE ==>
  isLoading?: boolean;
  // <== COLUMNS ==>
  columns?: 1 | 2 | 3;
  // <== SIZE ==>
  size?: "sm" | "default" | "lg";
  // <== CLASS NAME ==>
  className?: string;
}

// <== ACHIEVEMENTS TABBED GRID COMPONENT ==>
export const AchievementsTabbedGrid = ({
  achievements,
  isLoading = false,
  columns = 2,
  size = "default",
  className,
}: AchievementsTabbedGridProps) => {
  // UNLOCKED ACHIEVEMENTS
  const unlocked = achievements.filter((a) => a.isUnlocked);
  // LOCKED ACHIEVEMENTS
  const locked = achievements.filter((a) => !a.isUnlocked);
  // IN PROGRESS ACHIEVEMENTS
  const inProgress = locked.filter((a) => a.progressPercentage > 0);
  // RETURN TABBED GRID
  return (
    <Tabs defaultValue="all" className={className}>
      {/* TAB LIST */}
      <TabsList className="mb-4">
        <TabsTrigger value="all">All ({achievements.length})</TabsTrigger>
        <TabsTrigger value="unlocked">Unlocked ({unlocked.length})</TabsTrigger>
        <TabsTrigger value="in-progress">
          In Progress ({inProgress.length})
        </TabsTrigger>
        <TabsTrigger value="locked">
          Locked ({locked.length - inProgress.length})
        </TabsTrigger>
      </TabsList>
      {/* ALL TAB */}
      <TabsContent value="all">
        <AchievementsGrid
          achievements={achievements}
          isLoading={isLoading}
          columns={columns}
          size={size}
        />
      </TabsContent>
      {/* UNLOCKED TAB */}
      <TabsContent value="unlocked">
        {unlocked.length > 0 ? (
          <AchievementsGrid
            achievements={unlocked}
            isLoading={isLoading}
            showProgress={false}
            columns={columns}
            size={size}
          />
        ) : (
          <EmptyState message="No achievements unlocked yet" />
        )}
      </TabsContent>
      {/* IN PROGRESS TAB */}
      <TabsContent value="in-progress">
        {inProgress.length > 0 ? (
          <AchievementsGrid
            achievements={inProgress}
            isLoading={isLoading}
            columns={columns}
            size={size}
          />
        ) : (
          <EmptyState message="No achievements in progress" />
        )}
      </TabsContent>
      {/* LOCKED TAB */}
      <TabsContent value="locked">
        {locked.length - inProgress.length > 0 ? (
          <AchievementsGrid
            achievements={locked.filter((a) => a.progressPercentage === 0)}
            isLoading={isLoading}
            columns={columns}
            size={size}
          />
        ) : (
          <EmptyState message="All achievements are unlocked or in progress!" />
        )}
      </TabsContent>
    </Tabs>
  );
};

// <== EMPTY STATE COMPONENT ==>
const EmptyState = ({ message }: { message: string }) => {
  // RETURN EMPTY STATE
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  );
};

// <== ACHIEVEMENTS GRID DISPLAY NAME ==>
AchievementsGrid.displayName = "AchievementsGrid";
// <== ACHIEVEMENTS TABBED GRID DISPLAY NAME ==>
AchievementsTabbedGrid.displayName = "AchievementsTabbedGrid";
