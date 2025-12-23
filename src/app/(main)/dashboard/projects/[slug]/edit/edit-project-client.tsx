// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks";
import { ArrowLeft, Pencil } from "lucide-react";
import { ProjectForm } from "@/components/projects";
import type { ProjectWithDetails } from "@/types/database";

// <== EDIT PROJECT CLIENT PROPS ==>
interface EditProjectClientProps {
  // <== PROJECT ==>
  project: ProjectWithDetails;
}

// <== EDIT PROJECT CLIENT COMPONENT ==>
export const EditProjectClient = ({ project }: EditProjectClientProps) => {
  // GET CATEGORIES
  const { data: categories } = useCategories();
  // RETURN EDIT PROJECT CLIENT COMPONENT
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* BACK LINK */}
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6"
      >
        <ArrowLeft className="size-3.5 sm:size-4" />
        Back to My Projects
      </Link>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        <div className="size-10 sm:size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Pencil className="size-5 sm:size-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading truncate">
            Edit {project.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update your project details and settings
          </p>
        </div>
      </motion.div>
      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ProjectForm project={project} categories={categories ?? []} />
      </motion.div>
    </div>
  );
};
