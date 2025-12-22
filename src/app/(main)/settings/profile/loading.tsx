// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== PROFILE SETTINGS LOADING ==>
const ProfileSettingsLoading = () => {
  // RETURNING PROFILE SETTINGS LOADING COMPONENT
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER SKELETON */}
      <div>
        <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 mb-2" />
        <Skeleton className="h-4 sm:h-5 w-64 sm:w-80" />
      </div>
      {/* AVATAR SKELETON */}
      <Card className="p-4 sm:p-6">
        <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-3 sm:mb-4" />
        <div className="flex items-center gap-4 sm:gap-6">
          <Skeleton className="size-16 sm:size-20 md:size-24 rounded-full shrink-0" />
          <div className="space-y-1.5 sm:space-y-2 flex-1">
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-48 max-w-full" />
            <Skeleton className="h-2.5 sm:h-3 w-32 sm:w-36 max-w-full" />
          </div>
        </div>
      </Card>
      {/* BASIC INFO SKELETON */}
      <Card className="p-4 sm:p-6">
        <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mb-3 sm:mb-4" />
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
              <Skeleton className="h-9 sm:h-10 w-full" />
            </div>
          ))}
        </div>
      </Card>
      {/* SOCIAL LINKS SKELETON */}
      <Card className="p-4 sm:p-6">
        <Skeleton className="h-4 sm:h-5 w-24 sm:w-28 mb-3 sm:mb-4" />
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              <Skeleton className="h-9 sm:h-10 w-full" />
            </div>
          ))}
        </div>
      </Card>
      {/* SUBMIT BUTTON SKELETON */}
      <div className="flex items-center justify-end">
        <Skeleton className="h-8 sm:h-9 w-28 sm:w-32" />
      </div>
    </div>
  );
};

// <== EXPORTING PROFILE SETTINGS LOADING COMPONENT ==>
export default ProfileSettingsLoading;
