// <== IMPORTS ==>
import { ProjectGridSkeleton } from "@/components/projects";

// <== EXPLORE LOADING ==>
const ExploreLoading = () => {
  // RETURN EXPLORE LOADING SKELETON
  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <section className="py-8 md:py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-secondary rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-secondary rounded animate-pulse" />
        </div>
      </section>
      {/* MAIN CONTENT */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* FILTERS SKELETON */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 h-11 bg-secondary rounded animate-pulse" />
              <div className="w-full sm:w-48 h-11 bg-secondary rounded animate-pulse" />
              <div className="w-full sm:w-28 h-11 bg-secondary rounded animate-pulse" />
            </div>
          </div>
          {/* PROJECTS SKELETON */}
          <ProjectGridSkeleton columns={2} count={6} />
        </div>
      </section>
    </div>
  );
};

export default ExploreLoading;
