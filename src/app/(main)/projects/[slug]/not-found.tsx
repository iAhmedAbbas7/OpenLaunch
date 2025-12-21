// <== IMPORTS ==>
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Folder, ArrowLeft, Search } from "lucide-react";

// <== PROJECT NOT FOUND PAGE ==>
const ProjectNotFound = () => {
  // RETURN PROJECT NOT FOUND PAGE
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* ICON */}
        <div className="p-6 rounded-full bg-secondary w-fit mx-auto mb-6">
          <Folder className="size-12 text-muted-foreground" />
        </div>
        {/* TITLE */}
        <h1 className="text-2xl font-bold font-heading mb-2">
          Project Not Found
        </h1>
        {/* DESCRIPTION */}
        <p className="text-muted-foreground mb-6">
          The project you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="size-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/explore">
              <Search className="size-4 mr-2" />
              Explore Projects
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectNotFound;
