// <== SKELETON COMPONENT ==>
const Skeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  // RETURN SKELETON
  return (
    <div
      className={`bg-secondary rounded animate-pulse ${className}`}
      style={style}
    />
  );
};

// <== LEADERBOARD PAGE SKELETON ==>
export const LeaderboardPageSkeleton = () => {
  // RETURNING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Skeleton className="size-10 sm:size-12 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
              <Skeleton className="h-6 sm:h-7 md:h-8 w-28 sm:w-36" />
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-64" />
          </div>
          <Skeleton className="size-8 sm:size-9 rounded-md shrink-0" />
        </div>
      </div>
      {/* TYPE TABS SKELETON */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 sm:h-9 rounded-md"
              style={{ width: `${60 + ((i * 15) % 30)}px` }}
            />
          ))}
        </div>
      </div>
      {/* PERIOD FILTER SKELETON */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-7 sm:h-8 w-16 sm:w-20 rounded-md" />
          ))}
        </div>
      </div>
      {/* ACTIVE TYPE HEADER SKELETON */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-secondary/30 border mb-6 sm:mb-8">
        <Skeleton className="size-6 sm:size-8 rounded shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <Skeleton className="h-4 sm:h-5 w-36 sm:w-48" />
          <Skeleton className="h-3 sm:h-4 w-28 sm:w-40" />
        </div>
      </div>
      {/* PODIUM SKELETON */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 pb-4 mb-6 sm:mb-8">
        {[2, 1, 3].map((rank) => (
          <div key={rank} className="flex flex-col items-center">
            <Skeleton
              className={`rounded-full ${
                rank === 1 ? "size-14 sm:size-20" : "size-10 sm:size-16"
              }`}
            />
            <Skeleton className="h-3 sm:h-4 w-14 sm:w-20 mt-2 rounded" />
            <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16 mt-1 rounded" />
            <Skeleton
              className={`w-16 sm:w-24 rounded-t-lg mt-2 ${
                rank === 1
                  ? "h-28 sm:h-40"
                  : rank === 2
                  ? "h-20 sm:h-32"
                  : "h-16 sm:h-24"
              }`}
            />
          </div>
        ))}
      </div>
      {/* TABLE SKELETON */}
      <div className="space-y-2">
        <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-3 sm:mb-4" />
        {[...Array(7)].map((_, i) => (
          <div key={i} className="p-2.5 sm:p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <Skeleton className="size-8 sm:size-12 rounded-lg sm:rounded-xl shrink-0" />
              <Skeleton className="size-8 sm:size-12 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-32" />
                <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-20" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 sm:h-6 w-10 sm:w-16 ml-auto" />
                <Skeleton className="h-2.5 sm:h-3 w-8 sm:w-12 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// <== EXPORTING AS DEFAULT ==>
export default LeaderboardPageSkeleton;
