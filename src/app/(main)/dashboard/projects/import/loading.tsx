// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON BASE COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== REPOSITORY CARD SKELETON ==>
const RepositoryCardSkeleton = () => {
  // RETURNING REPOSITORY CARD SKELETON COMPONENT
  return (
    <Card className="p-3 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* ICON SKELETON */}
        <Skeleton className="size-10 sm:size-12 rounded-lg shrink-0" />
        {/* INFO SKELETON */}
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
        {/* BUTTON SKELETON */}
        <Skeleton className="h-8 sm:h-10 w-16 sm:w-28 shrink-0" />
      </div>
    </Card>
  );
};

// <== IMPORT LOADING PAGE ==>
const ImportLoading = () => {
  // RETURNING IMPORT LOADING PAGE
  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
      {/* BACK LINK SKELETON */}
      <Skeleton className="h-5 w-36 sm:w-40 mb-6" />

      {/* HEADER SKELETON */}
      <div className="flex items-start gap-3 sm:gap-4 mb-8">
        {/* ICON SKELETON */}
        <Skeleton className="size-12 sm:size-14 rounded-xl shrink-0" />
        {/* TEXT SKELETON */}
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-7 sm:h-9 w-48 sm:w-64" />
          <Skeleton className="h-4 sm:h-5 w-64 sm:w-96 max-w-full" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-4 sm:space-y-6">
        {/* STATUS BANNER SKELETON */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="size-9 sm:size-10 rounded-full" />
              <div className="space-y-1.5 sm:space-y-2">
                <Skeleton className="h-4 w-32 sm:w-40" />
                <Skeleton className="h-3 w-40 sm:w-48 hidden sm:block" />
              </div>
            </div>
            <Skeleton className="h-8 sm:h-9 w-10 sm:w-24" />
          </div>
        </Card>

        {/* FILTERS SKELETON */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-10 sm:h-11 flex-1" />
          <Skeleton className="h-10 sm:h-11 w-full sm:w-52" />
          <Skeleton className="h-10 sm:h-11 w-full sm:w-11" />
        </div>

        {/* REPOSITORY LIST SKELETON */}
        <div className="grid gap-2 sm:gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <RepositoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING IMPORT LOADING PAGE ==>
export default ImportLoading;
