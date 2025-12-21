// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { Folder, ArrowUpRight } from "lucide-react";

// <== PROFILE PROJECTS PROPS ==>
interface ProfileProjectsProps {
  // <== PROFILE ID ==>
  profileId: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROFILE PROJECTS COMPONENT ==>
export const ProfileProjects = ({
  profileId,
  className,
}: ProfileProjectsProps) => {
  // FETCH PROJECTS
  const { data, isLoading, error } = useProjects({ ownerId: profileId });
  // HANDLE LOADING
  if (isLoading) {
    // RETURN PROFILE PROJECTS SKELETON
    return <ProfileProjectsSkeleton className={className} />;
  }
  // HANDLE ERROR
  if (error) {
    // RETURN ERROR MESSAGE
    return (
      <div className={cn("text-center py-12 text-muted-foreground", className)}>
        Failed to load projects
      </div>
    );
  }
  // HANDLE EMPTY
  if (!data || data.items.length === 0) {
    // RETURN EMPTY MESSAGE
    return (
      <div className={cn("text-center py-12", className)}>
        <Folder className="size-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">No projects yet</p>
      </div>
    );
  }
  // RETURN PROFILE PROJECTS COMPONENT
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {data.items.map((project) => (
        <Card
          key={project.id}
          className="p-4 hover:bg-secondary/50 transition-all duration-200 group"
        >
          <Link href={`/projects/${project.slug}`} className="block">
            {/* HEADER */}
            <div className="flex items-start gap-3">
              {/* LOGO */}
              {project.logoUrl ? (
                <div className="size-12 relative shrink-0">
                  <Image
                    src={project.logoUrl}
                    alt={project.name}
                    fill
                    sizes="48px"
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Folder className="size-6 text-primary" />
                </div>
              )}
              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold font-heading truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {project.tagline}
                </p>
              </div>
            </div>
            {/* TECH STACK */}
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                    +{project.techStack.length - 4}
                  </span>
                )}
              </div>
            )}
            {/* STATS */}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-primary font-medium">▲</span>
                {project.upvotesCount}
              </span>
              <span>{project.commentsCount} comments</span>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
};

// <== PROFILE PROJECTS SKELETON ==>
export const ProfileProjectsSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  // RETURN PROFILE PROJECTS SKELETON
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* PROJECTS SKELETON */}
      {Array.from({ length: 4 }).map((_, i) => (
        // PROJECT SKELETON
        <Card key={i} className="p-4">
          {/* HEADER SKELETON */}
          <div className="flex items-start gap-3">
            {/* LOGO SKELETON */}
            <div className="size-12 rounded-lg bg-secondary animate-pulse" />
            {/* INFO SKELETON */}
            <div className="flex-1 space-y-2">
              {/* NAME SKELETON */}
              <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
              {/* TAGLINE SKELETON */}
              <div className="h-4 w-full bg-secondary rounded animate-pulse" />
            </div>
          </div>
          {/* TECH STACK SKELETON */}
          <div className="flex gap-1.5 mt-3">
            {/* TECH SKELETON */}
            <div className="h-5 w-16 bg-secondary rounded-full animate-pulse" />
            {/* TECH SKELETON */}
            <div className="h-5 w-16 bg-secondary rounded-full animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
};
