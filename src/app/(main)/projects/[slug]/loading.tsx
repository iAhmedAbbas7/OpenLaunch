// <== IMPORTS ==>
import { Card } from "@/components/ui/card";
import { ProjectHeaderSkeleton } from "@/components/projects";

// <== SKELETON ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== PROJECT LOADING SKELETON ==>
const ProjectLoading = () => {
  // RETURN PROJECT LOADING SKELETON
  return (
    <div className="min-h-screen pb-16">
      {/* BACK LINK SKELETON */}
      <section className="py-4 border-b border-border/50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-5 w-32" />
        </div>
      </section>
      {/* MAIN CONTENT */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-2 space-y-8">
              {/* HEADER */}
              <ProjectHeaderSkeleton />
              {/* DESCRIPTION */}
              <Card className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
              {/* GALLERY */}
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video rounded-lg" />
                  ))}
                </div>
              </Card>
            </div>
            {/* SIDEBAR */}
            <div className="space-y-6">
              {/* TECH STACK */}
              <Card className="p-6">
                <Skeleton className="h-6 w-28 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </Card>
              {/* PROJECT INFO */}
              <Card className="p-6">
                <Skeleton className="h-6 w-28 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// <== EXPORTING PROJECT LOADING SKELETON ==>
export default ProjectLoading;
