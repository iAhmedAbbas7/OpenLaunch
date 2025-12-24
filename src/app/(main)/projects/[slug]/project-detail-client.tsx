// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Tags,
  FolderOpen,
  ArrowLeft,
  Code,
  Github,
  FileText,
  Info,
  ChevronUp,
  Bookmark,
  Calendar,
  Sparkles,
  Globe,
  Terminal,
  Smartphone,
  Gamepad2,
  Cpu,
  Bot,
  Palette,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Music,
  Video,
  Camera,
  Headphones,
  Heart,
  Shield,
  Cloud,
  Database,
  Server,
  type LucideIcon,
} from "lucide-react";
import {
  ProjectHeader,
  ProjectGallery,
  ProjectGalleryEmpty,
  CodeBrowser,
} from "@/components/projects";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CommentsSection } from "@/components/comments";
import type { ProjectWithDetails } from "@/types/database";

// <== ICON MAP FOR CATEGORIES ==>
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Globe,
  Terminal,
  Smartphone,
  Gamepad2,
  Cpu,
  Bot,
  Palette,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Music,
  Video,
  Camera,
  Headphones,
  Heart,
  Shield,
  Cloud,
  Database,
  Server,
  Code,
  Tags,
};

// <== PROJECT DETAIL CLIENT PROPS ==>
interface ProjectDetailClientProps {
  // <== PROJECT ==>
  project: ProjectWithDetails;
}

// <== PROJECT DETAIL CLIENT COMPONENT ==>
export const ProjectDetailClient = ({ project }: ProjectDetailClientProps) => {
  // RETURN PROJECT DETAIL CLIENT COMPONENT
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* BACK LINK */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Explore
      </Link>
      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProjectHeader project={project} />
          </motion.div>

          {/* DESCRIPTION */}
          {project.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="size-7 sm:size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="size-3.5 sm:size-4 text-primary" />
                  </div>
                  About this project
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
          {/* GALLERY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {project.media.length > 0 ? (
              <ProjectGallery media={project.media} />
            ) : (
              <ProjectGalleryEmpty />
            )}
          </motion.div>

          {/* CODE BROWSER */}
          {project.githubUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <div className="size-7 sm:size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Code className="size-3.5 sm:size-4 text-primary" />
                    </div>
                    Source Code
                  </h2>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Github className="size-3.5 sm:size-4" />
                    <span className="hidden sm:inline">View on GitHub</span>
                  </a>
                </div>
                <CodeBrowser
                  projectId={project.id}
                  githubUrl={project.githubUrl}
                  defaultHeight="400px"
                />
              </Card>
            </motion.div>
          )}
          {/* COMMENTS SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4 sm:p-6">
              <CommentsSection
                projectId={project.id}
                commentsCount={project.commentsCount}
              />
            </Card>
          </motion.div>
        </div>
        {/* SIDEBAR */}
        <div className="space-y-4 sm:space-y-6">
          {/* TECH STACK */}
          {project.techStack && project.techStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="size-6 sm:size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Tags className="size-3 sm:size-3.5 text-primary" />
                  </div>
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.techStack.map((tech) => (
                    <Link
                      key={tech}
                      href={`/explore?tech=${encodeURIComponent(tech)}`}
                    >
                      <Badge
                        variant="secondary"
                        className="text-xs sm:text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        {tech}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
          {/* CATEGORIES */}
          {project.categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="size-6 sm:size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FolderOpen className="size-3 sm:size-3.5 text-primary" />
                  </div>
                  Categories
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.categories.map((category) => {
                    // GET CATEGORY ICON COMPONENT
                    const IconComponent = category.icon
                      ? CATEGORY_ICONS[category.icon]
                      : null;
                    return (
                      <Link
                        key={category.id}
                        href={`/explore?category=${category.id}`}
                      >
                        <Badge
                          variant="outline"
                          className="text-xs sm:text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          {IconComponent && (
                            <IconComponent className="size-3 mr-1" />
                          )}
                          {category.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
          {/* PROJECT INFO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <div className="size-6 sm:size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Info className="size-3 sm:size-3.5 text-primary" />
                </div>
                Project Info
              </h3>
              <dl className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                {/* STATUS */}
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3 sm:size-3.5" />
                    Status
                  </dt>
                  <dd>
                    <Badge
                      variant={
                        project.status === "featured" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {project.status === "featured"
                        ? "Featured"
                        : project.status === "launched"
                        ? "Launched"
                        : "Draft"}
                    </Badge>
                  </dd>
                </div>
                {/* LICENSE */}
                {project.license && (
                  <div className="flex justify-between items-center">
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <FileText className="size-3 sm:size-3.5" />
                      License
                    </dt>
                    <dd className="font-medium">{project.license}</dd>
                  </div>
                )}
                {/* CREATED */}
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3 sm:size-3.5" />
                    Created
                  </dt>
                  <dd className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                {/* UPVOTES */}
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <ChevronUp className="size-3 sm:size-3.5" />
                    Upvotes
                  </dt>
                  <dd className="font-medium">
                    {project.upvotesCount.toLocaleString()}
                  </dd>
                </div>
                {/* BOOKMARKS */}
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Bookmark className="size-3 sm:size-3.5" />
                    Bookmarks
                  </dt>
                  <dd className="font-medium">
                    {project.bookmarksCount.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </Card>
          </motion.div>
          {/* RELATED PROJECTS PLACEHOLDER */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <div className="size-6 sm:size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="size-3 sm:size-3.5 text-primary" />
                </div>
                Related Projects
              </h3>
              <div className="text-center py-4 sm:py-6">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
