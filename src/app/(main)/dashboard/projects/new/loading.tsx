// <== IMPORTS ==>
import { Card } from "@/components/ui/card";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== NEW PROJECT LOADING ==>
const NewProjectLoading = () => {
  // RETURN NEW PROJECT LOADING SKELETON
  return (
    <div className="min-h-screen pb-16">
      {/* HEADER */}
      <section className="py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          {/* BACK LINK SKELETON */}
          <Skeleton className="h-5 w-40 mb-4" />
          {/* TITLE SKELETON */}
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-5 w-72" />
            </div>
          </div>
        </div>
      </section>
      {/* FORM SKELETON */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* PROGRESS INDICATOR SKELETON */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="size-10 rounded-full" />
                    {i < 3 && <Skeleton className="w-12 md:w-24 h-1 mx-2" />}
                  </div>
                ))}
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </div>
            {/* FORM CARD SKELETON */}
            <Card className="p-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
              </div>
            </Card>
            {/* NAVIGATION SKELETON */}
            <div className="flex items-center justify-between mt-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// <== EXPORTING NEW PROJECT LOADING SKELETON ==>
export default NewProjectLoading;
