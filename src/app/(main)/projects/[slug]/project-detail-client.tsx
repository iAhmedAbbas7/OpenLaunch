// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  ProjectHeader,
  ProjectGallery,
  ProjectGalleryEmpty,
} from "@/components/projects";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectWithDetails } from "@/types/database";
import { Tags, FolderOpen, ArrowLeft } from "lucide-react";

// <== PROJECT DETAIL CLIENT PROPS ==>
interface ProjectDetailClientProps {
  // <== PROJECT ==>
  project: ProjectWithDetails;
}

// <== PROJECT DETAIL CLIENT COMPONENT ==>
export const ProjectDetailClient = ({ project }: ProjectDetailClientProps) => {
  // RETURN PROJECT DETAIL CLIENT COMPONENT
  return (
    <div className="min-h-screen pb-16">
      {/* BACK LINK */}
      <section className="py-4 border-b border-border/50">
        <div className="container mx-auto px-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Explore
          </Link>
        </div>
      </section>
      {/* MAIN CONTENT */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-2 space-y-8">
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
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      About this project
                    </h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {/* RENDER DESCRIPTION */}
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
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
              {/* COMMENTS SECTION PLACEHOLDER */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Discussion ({project.commentsCount})
                  </h2>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Comments coming soon!</p>
                  </div>
                </Card>
              </motion.div>
            </div>
            {/* SIDEBAR */}
            <div className="space-y-6">
              {/* TECH STACK */}
              {project.techStack && project.techStack.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Tags className="size-4" />
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <Link
                          key={tech}
                          href={`/explore?tech=${encodeURIComponent(tech)}`}
                        >
                          <Badge
                            variant="secondary"
                            className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
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
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FolderOpen className="size-4" />
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/explore?category=${category.id}`}
                        >
                          <Badge
                            variant="outline"
                            className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          >
                            {category.icon && (
                              <span className="mr-1">{category.icon}</span>
                            )}
                            {category.name}
                          </Badge>
                        </Link>
                      ))}
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
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Project Info</h3>
                  <dl className="space-y-3 text-sm">
                    {/* STATUS */}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <Badge
                          variant={
                            project.status === "featured"
                              ? "default"
                              : "secondary"
                          }
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
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">License</dt>
                        <dd className="font-medium">{project.license}</dd>
                      </div>
                    )}
                    {/* CREATED */}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="font-medium">
                        {new Date(project.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </dd>
                    </div>
                    {/* UPVOTES */}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Upvotes</dt>
                      <dd className="font-medium">
                        {project.upvotesCount.toLocaleString()}
                      </dd>
                    </div>
                    {/* BOOKMARKS */}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Bookmarks</dt>
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
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Related Projects</h3>
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Coming soon
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
