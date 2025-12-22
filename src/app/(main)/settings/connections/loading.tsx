// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT`
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== CONNECTIONS SETTINGS LOADING ==>
const ConnectionsSettingsLoading = () => {
  // RETURNING CONNECTION SETTINGS LOADING SKELETON
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER SKELETON */}
      <div>
        <Skeleton className="h-6 sm:h-7 w-28 sm:w-32 mb-2" />
        <Skeleton className="h-4 sm:h-5 w-64 sm:w-80" />
      </div>
      {/* INFO CARD SKELETON */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Skeleton className="size-7 sm:size-8 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-md" />
            <Skeleton className="h-3 sm:h-4 w-3/4" />
          </div>
        </div>
      </Card>
      {/* GITHUB CONNECTION SKELETON */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="size-10 sm:size-12 rounded-lg shrink-0" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              <Skeleton className="h-3 sm:h-4 w-40 sm:w-52" />
            </div>
          </div>
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 shrink-0" />
        </div>
      </Card>
      {/* TWITTER CONNECTION SKELETON */}
      <Card className="p-4 sm:p-6 opacity-60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="size-10 sm:size-12 rounded-lg shrink-0" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
              <Skeleton className="h-3 sm:h-4 w-44 sm:w-56" />
            </div>
          </div>
          <Skeleton className="h-8 sm:h-9 w-28 sm:w-32 shrink-0" />
        </div>
      </Card>
    </div>
  );
};

// <== EXPORTING CONNECTIONS SETTINGS LOADING COMPONENT ==>
export default ConnectionsSettingsLoading;
