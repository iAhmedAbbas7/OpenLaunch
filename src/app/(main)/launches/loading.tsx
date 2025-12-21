// <== IMPORTS ==>
import { Card } from "@/components/ui/card";
import { ProjectGridSkeleton } from "@/components/projects";

// <== LAUNCHES LOADING ==>
const LaunchesLoading = () => {
  // RETURN LAUNCHES LOADING SKELETON
  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <section className="py-8 md:py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-9 rounded-lg bg-secondary animate-pulse" />
            <div className="h-5 w-40 bg-secondary rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-64 bg-secondary rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-secondary rounded animate-pulse" />
        </div>
      </section>
      {/* FEATURED SECTION */}
      <section className="py-8 bg-linear-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="size-5 bg-secondary rounded animate-pulse" />
              <div className="h-6 w-40 bg-secondary rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-secondary rounded animate-pulse" />
          </div>
          <ProjectGridSkeleton columns={2} count={4} />
        </div>
      </section>
      {/* MAIN CONTENT */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* TABS SKELETON */}
          <Card className="p-1 w-fit mb-6 bg-secondary/50">
            <div className="flex gap-1">
              <div className="h-9 w-24 bg-secondary rounded animate-pulse" />
              <div className="h-9 w-28 bg-secondary rounded animate-pulse" />
              <div className="h-9 w-28 bg-secondary rounded animate-pulse" />
            </div>
          </Card>
          {/* PROJECTS SKELETON */}
          <ProjectGridSkeleton columns={2} count={6} />
        </div>
      </section>
    </div>
  );
};

export default LaunchesLoading;
