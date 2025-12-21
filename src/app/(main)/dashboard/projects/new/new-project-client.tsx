// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks";
import { ArrowLeft, Rocket } from "lucide-react";
import { ProjectForm } from "@/components/projects";

// <== NEW PROJECT CLIENT COMPONENT ==>
export const NewProjectClient = () => {
  // GET CATEGORIES
  const { data: categories } = useCategories();
  // RETURN NEW PROJECT CLIENT COMPONENT
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
              <Rocket className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading">
                Create New Project
              </h1>
              <p className="text-muted-foreground">
                Share your project with the developer community
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
            <ProjectForm categories={categories ?? []} />
          </motion.div>
        </div>
      </section>
    </div>
  );
};
