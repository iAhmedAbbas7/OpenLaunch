// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== MY PROJECTS LOADING ==>
const MyProjectsLoading = () => {
  // RETURN MY PROJECTS LOADING SKELETON
  return (
    <div className="container mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-secondary rounded animate-pulse" />
          <div className="h-5 w-64 bg-secondary rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-secondary rounded animate-pulse" />
      </div>
      {/* PROJECTS LIST */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              {/* LOGO SKELETON */}
              <div className="size-14 rounded-lg bg-secondary animate-pulse shrink-0" />
              {/* INFO SKELETON */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-40 bg-secondary rounded animate-pulse" />
                  <div className="h-5 w-16 bg-secondary rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-64 bg-secondary rounded animate-pulse" />
                <div className="flex items-center gap-4">
                  <div className="h-4 w-12 bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-12 bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-16 bg-secondary rounded animate-pulse" />
                </div>
              </div>
              {/* ACTIONS SKELETON */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-20 bg-secondary rounded animate-pulse" />
                <div className="size-9 bg-secondary rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyProjectsLoading;
