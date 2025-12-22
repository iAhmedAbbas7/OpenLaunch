// <== IMPORTS ==>
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Github } from "lucide-react";
import { ImportFromGitHubClient } from "./import-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Import",
  // <== DESCRIPTION ==>
  description: "Import a repository from GitHub as a new project",
};

// <== IMPORT FROM GITHUB PAGE ==>
const ImportFromGitHubPage = () => {
  // RETURNING PAGE
  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
      {/* BACK LINK */}
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to My Projects
      </Link>

      {/* HEADER */}
      <div className="flex items-start gap-3 sm:gap-4 mb-8">
        <div className="size-12 sm:size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Github className="size-6 sm:size-7 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-1">
            Import from GitHub
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Select a repository to import as a new project. We&apos;ll
            automatically extract details from your repository.
          </p>
        </div>
      </div>

      {/* IMPORT CLIENT */}
      <ImportFromGitHubClient />
    </div>
  );
};

// <== EXPORTING IMPORT FROM GITHUB PAGE ==>
export default ImportFromGitHubPage;
