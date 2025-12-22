// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== APPEARANCE SETTINGS LOADING ==>
const AppearanceSettingsLoading = () => {
  // RETURNING APPEARANCE SETTINGS LOADING COMPONENT
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER SKELETON */}
      <div>
        <Skeleton className="h-6 sm:h-7 w-28 sm:w-32 mb-2" />
        <Skeleton className="h-4 sm:h-5 w-52 sm:w-64" />
      </div>
      {/* THEME SECTION SKELETON */}
      <Card className="p-4 sm:p-6">
        <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-2 sm:mb-3" />
        <Skeleton className="h-3 sm:h-4 w-44 sm:w-56 mb-3 sm:mb-4" />
        {/* THEME OPTIONS SKELETON */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 p-2.5 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-border"
            >
              <Skeleton className="size-8 sm:size-10 md:size-12 rounded-full" />
              <Skeleton className="h-3 sm:h-4 w-10 sm:w-12 md:w-14" />
              <Skeleton className="h-2.5 sm:h-3 w-full max-w-16 sm:max-w-20 hidden sm:block" />
            </div>
          ))}
        </div>
      </Card>
      {/* PREVIEW SECTION SKELETON */}
      <Card className="p-4 sm:p-6">
        <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-3 sm:mb-4" />
        <div className="rounded-lg border border-border overflow-hidden">
          {/* MOCK NAVBAR SKELETON */}
          <div className="h-10 sm:h-12 bg-background border-b border-border flex items-center px-3 sm:px-4 gap-3 sm:gap-4">
            <Skeleton className="size-5 sm:size-6 rounded-full" />
            <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20" />
            <div className="flex-1" />
            <Skeleton className="size-6 sm:size-8 rounded-full" />
          </div>
          {/* MOCK CONTENT SKELETON */}
          <div className="p-4 sm:p-6 bg-background">
            <div className="space-y-2.5 sm:space-y-4">
              <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
              <div className="flex gap-2 mt-4 sm:mt-6">
                <Skeleton className="h-7 sm:h-9 w-20 sm:w-24 rounded-lg" />
                <Skeleton className="h-7 sm:h-9 w-20 sm:w-24 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// <== EXPORTING APPEARANCE SETTINGS LOADING COMPONENT ==>
export default AppearanceSettingsLoading;
