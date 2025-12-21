// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import type { ProjectPreview } from "@/types/database";
import { ProjectCard, ProjectCardSkeleton } from "./project-card";

// <== PROJECT GRID PROPS ==>
interface ProjectGridProps {
  // <== PROJECTS ==>
  projects: ProjectPreview[];
  // <== CLASS NAME ==>
  className?: string;
  // <== SHOW OWNER ==>
  showOwner?: boolean;
  // <== COLUMNS ==>
  columns?: 1 | 2 | 3;
  // <== ANIMATE ==>
  animate?: boolean;
}

// <== PROJECT GRID COMPONENT ==>
export const ProjectGrid = ({
  projects,
  className,
  showOwner = true,
  columns = 2,
  animate = true,
}: ProjectGridProps) => {
  // COLUMN CLASSES
  const columnClasses = {
    // <== 1 COLUMN ==>
    1: "grid-cols-1",
    // <== 2 COLUMNS ==>
    2: "grid-cols-1 lg:grid-cols-2",
    // <== 3 COLUMNS ==>
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };
  // RETURN PROJECT GRID COMPONENT
  return (
    <div
      className={cn("grid gap-4 lg:gap-6", columnClasses[columns], className)}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          showOwner={showOwner}
          animate={animate}
          index={index}
        />
      ))}
    </div>
  );
};

// <== PROJECT GRID SKELETON ==>
export const ProjectGridSkeleton = ({
  className,
  count = 6,
  columns = 2,
}: {
  className?: string;
  count?: number;
  columns?: 1 | 2 | 3;
}) => {
  // COLUMN CLASSES
  const columnClasses = {
    // <== 1 COLUMN ==>
    1: "grid-cols-1",
    // <== 2 COLUMNS ==>
    2: "grid-cols-1 lg:grid-cols-2",
    // <== 3 COLUMNS ==>
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };
  // RETURN PROJECT GRID SKELETON
  return (
    <div
      className={cn("grid gap-4 lg:gap-6", columnClasses[columns], className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
};
