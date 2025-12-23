// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== EDIT PROJECT LOADING ==>
const EditProjectLoading = () => {
  // RETURN EDIT PROJECT LOADING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* BACK LINK SKELETON */}
      <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mb-4 sm:mb-6" />

      {/* HEADER SKELETON */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Skeleton className="size-10 sm:size-12 rounded-xl shrink-0" />
        <div className="space-y-1.5 sm:space-y-2">
          <Skeleton className="h-6 sm:h-7 md:h-8 w-40 sm:w-48 md:w-56" />
          <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-64 md:w-72" />
        </div>
      </div>
      {/* FORM SKELETON */}
      <div className="max-w-3xl mx-auto">
        {/* PROGRESS INDICATOR SKELETON */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="size-8 sm:size-10 rounded-full" />
                {i < 3 && (
                  <Skeleton className="w-8 sm:w-12 md:w-24 h-0.5 sm:h-1 mx-1.5 sm:mx-2" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center space-y-1.5 sm:space-y-2">
            <Skeleton className="h-5 sm:h-6 w-24 sm:w-32 mx-auto" />
            <Skeleton className="h-3.5 sm:h-4 w-36 sm:w-48 mx-auto" />
          </div>
        </div>
        {/* FORM CARD SKELETON */}
        <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* NAME INPUT */}
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-9 sm:h-10 w-full" />
          </div>
          {/* TAGLINE INPUT */}
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-3.5 sm:h-4 w-14 sm:w-16" />
            <Skeleton className="h-9 sm:h-10 w-full" />
            <Skeleton className="h-3 sm:h-3.5 w-24 sm:w-28" />
          </div>
          {/* DESCRIPTION INPUT */}
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-3.5 sm:h-4 w-18 sm:w-20" />
            <Skeleton className="h-28 sm:h-32 w-full" />
            <Skeleton className="h-3 sm:h-3.5 w-28 sm:w-32" />
          </div>
        </Card>
        {/* NAVIGATION SKELETON */}
        <div className="flex items-center justify-between mt-4 sm:mt-6">
          <Skeleton className="h-9 sm:h-10 w-20 sm:w-24" />
          <Skeleton className="h-9 sm:h-10 w-20 sm:w-24" />
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING EDIT PROJECT LOADING SKELETON ==>
export default EditProjectLoading;
