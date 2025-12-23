// <== IMPORTS ==>
import { Card } from "@/components/ui/card";
import { ProjectHeaderSkeleton } from "@/components/projects";

// <== SKELETON ==>
const Skeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  // RETURNING SKELETON COMPONENT
  return (
    <div
      className={`bg-secondary rounded animate-pulse ${className}`}
      style={style}
    />
  );
};

// <== PROJECT LOADING SKELETON ==>
const ProjectLoading = () => {
  // RETURN PROJECT LOADING SKELETON
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* BACK LINK SKELETON */}
      <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-4 sm:mb-6" />
      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* HEADER */}
          <ProjectHeaderSkeleton />
          {/* DESCRIPTION */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="size-7 sm:size-8 rounded-lg" />
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 sm:h-4 w-full" />
              <Skeleton className="h-3.5 sm:h-4 w-full" />
              <Skeleton className="h-3.5 sm:h-4 w-4/5" />
              <Skeleton className="h-3.5 sm:h-4 w-3/4" />
            </div>
          </Card>
          {/* GALLERY / SCREENSHOTS */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="size-7 sm:size-8 rounded-lg" />
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-28" />
            </div>
            {/* EMPTY STATE - CIRCULAR ICON + TEXT */}
            <div className="flex flex-col items-center justify-center py-6 sm:py-8">
              <Skeleton className="size-12 sm:size-14 rounded-full mb-3" />
              <Skeleton className="h-4 sm:h-5 w-32 sm:w-36 mb-1" />
              <Skeleton className="h-3 sm:h-3.5 w-48 sm:w-56" />
            </div>
          </Card>
          {/* CODE BROWSER */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 sm:size-8 rounded-lg" />
                <Skeleton className="h-5 sm:h-6 w-24 sm:w-28" />
              </div>
              <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-24" />
            </div>
            {/* CODE BROWSER CARD - RESPONSIVE LAYOUT */}
            <div className="border border-border rounded-lg overflow-hidden">
              {/* VERTICAL ON MOBILE, HORIZONTAL ON DESKTOP */}
              <div className="flex flex-col md:flex-row h-[350px] sm:h-[400px]">
                {/* SIDEBAR */}
                <div className="w-full md:w-[280px] h-[140px] md:h-full border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0">
                  {/* SIDEBAR HEADER */}
                  <div className="flex items-center justify-between p-1.5 sm:p-2 border-b bg-secondary/20">
                    <Skeleton className="h-3.5 sm:h-4 w-8 sm:w-10" />
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Skeleton className="size-5 sm:size-6" />
                      <Skeleton className="size-5 sm:size-6" />
                      <Skeleton className="size-5 sm:size-6" />
                      <Skeleton className="hidden md:block size-5 sm:size-6" />
                    </div>
                  </div>
                  {/* SEARCH */}
                  <div className="p-1.5 sm:p-2 border-b">
                    <Skeleton className="h-6 sm:h-7 w-full" />
                  </div>
                  {/* FILE TREE */}
                  <div className="flex-1 p-1.5 sm:p-2 space-y-0.5 sm:space-y-1 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-5 sm:h-6"
                        style={{
                          width: `${[70, 85, 55, 75, 60, 80][i]}%`,
                          marginLeft: `${[0, 0, 8, 8, 16, 0][i]}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* FILE VIEWER */}
                <div className="flex-1 flex flex-col min-h-[150px] md:min-h-0">
                  {/* EMPTY STATE */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <Skeleton className="size-8 sm:size-10 mb-2 sm:mb-3" />
                    <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
          {/* DISCUSSION */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="size-7 sm:size-8 rounded-lg" />
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
            </div>
            <div className="text-center py-6 sm:py-8">
              <Skeleton className="size-12 sm:size-14 rounded-full mx-auto mb-3" />
              <Skeleton className="h-4 sm:h-5 w-36 sm:w-44 mx-auto" />
            </div>
          </Card>
        </div>
        {/* SIDEBAR */}
        <div className="space-y-4 sm:space-y-6">
          {/* TECH STACK */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="size-6 sm:size-7 rounded-lg" />
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-5 sm:h-6 rounded-full"
                  style={{ width: `${[48, 64, 56, 72, 52, 60][i]}px` }}
                />
              ))}
            </div>
          </Card>
          {/* CATEGORIES */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="size-6 sm:size-7 rounded-lg" />
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-5 sm:h-6 rounded-full"
                  style={{ width: `${[72, 64][i]}px` }}
                />
              ))}
            </div>
          </Card>
          {/* PROJECT INFO */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="size-6 sm:size-7 rounded-lg" />
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="size-3 sm:size-3.5" />
                    <Skeleton className="h-3.5 sm:h-4 w-14 sm:w-16" />
                  </div>
                  <Skeleton
                    className="h-3.5 sm:h-4"
                    style={{ width: `${[48, 40, 56, 32, 28][i]}px` }}
                  />
                </div>
              ))}
            </div>
          </Card>
          {/* RELATED PROJECTS */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Skeleton className="size-6 sm:size-7 rounded-lg" />
              <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
            </div>
            <div className="text-center py-4 sm:py-6">
              <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24 mx-auto" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING PROJECT LOADING SKELETON ==>
export default ProjectLoading;
