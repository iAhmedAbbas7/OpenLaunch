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
    <div className="min-h-screen pb-16">
      {/* HEADER */}
      <section className="py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          {/* BACK LINK */}
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to My Projects
          </Link>
          {/* TITLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-primary/10">
              <Pencil className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading">
                Edit {project.name}
              </h1>
              <p className="text-muted-foreground">
                Update your project details
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* FORM */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProjectForm project={project} categories={categories ?? []} />
          </motion.div>
        </div>
      </section>
    </div>
  );
};
