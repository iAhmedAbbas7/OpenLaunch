// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== NOTIFICATIONS SETTINGS LOADING ==>
const NotificationsSettingsLoading = () => {
  // RETURNING NOTIFICATIONS SETTINGS LOADING COMPONENT
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER SKELETON */}
      <div>
        <Skeleton className="h-6 sm:h-7 w-28 sm:w-32 mb-2" />
        <Skeleton className="h-4 sm:h-5 w-56 sm:w-72" />
      </div>
      {/* INFO CARD SKELETON */}
      <Card className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
          <Skeleton className="size-8 sm:size-9 rounded-lg shrink-0" />
          <div className="space-y-1.5 sm:space-y-2 flex-1">
            <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
            <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-md" />
          </div>
        </div>
      </Card>
      {/* NOTIFICATION OPTIONS SKELETON */}
      <Card className="p-4 sm:p-6">
        <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mb-3 sm:mb-4" />
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 sm:py-3 border-b border-border last:border-0"
            >
              <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                <Skeleton className="size-8 sm:size-9 md:size-10 rounded-lg shrink-0" />
                <div className="space-y-1.5 sm:space-y-2">
                  <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
                  <Skeleton className="h-3 sm:h-4 w-40 sm:w-52" />
                </div>
              </div>
              <Skeleton className="h-5 w-9 sm:h-6 sm:w-11 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// <== EXPORTING NOTIFICATIONS SETTINGS LOADING COMPONENT ==>
export default NotificationsSettingsLoading;
