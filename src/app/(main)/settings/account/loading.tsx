// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== ACCOUNT SETTINGS LOADING ==>
const AccountSettingsLoading = () => {
  // RETURNING ACCOUNT SETTINGS LOADING COMPONENT
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER SKELETON */}
      <div>
        <Skeleton className="h-6 sm:h-7 w-24 sm:w-28 mb-2" />
        <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
      </div>
      {/* EMAIL SECTION SKELETON */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="size-9 sm:size-10 rounded-lg shrink-0" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
              <Skeleton className="h-3 sm:h-4 w-36 sm:w-40" />
            </div>
          </div>
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 rounded-md" />
        </div>
      </Card>
      {/* PASSWORD SECTION SKELETON */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="size-9 sm:size-10 rounded-lg shrink-0" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
              <Skeleton className="h-3 sm:h-4 w-32 sm:w-36" />
            </div>
          </div>
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 rounded-md" />
        </div>
      </Card>
      {/* DANGER ZONE SKELETON */}
      <Card className="p-4 sm:p-6">
        <Skeleton className="h-4 sm:h-5 w-24 sm:w-28 mb-3 sm:mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="size-9 sm:size-10 rounded-lg shrink-0" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
              <Skeleton className="h-3 sm:h-4 w-48 sm:w-56" />
            </div>
          </div>
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 rounded-md" />
        </div>
      </Card>
    </div>
  );
};

// <== EXPORTING ACCOUNT SETTINGS LOADING COMPONENT ==>
export default AccountSettingsLoading;
