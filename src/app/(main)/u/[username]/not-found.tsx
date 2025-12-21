// <== IMPORTS ==>
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserX, ArrowLeft, Search } from "lucide-react";

// <== NOT FOUND COMPONENT ==>
const ProfileNotFound = () => {
  // RETURNING NOT FOUND PAGE
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      {/* CONTENT */}
      <div className="text-center">
        {/* ICON */}
        <div className="size-24 mx-auto mb-8 rounded-full bg-secondary/50 flex items-center justify-center">
          <UserX className="size-12 text-muted-foreground" />
        </div>
        {/* TITLE */}
        <h1 className="text-3xl font-bold font-heading mb-4">
          Profile Not Found
        </h1>
        {/* DESCRIPTION */}
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          The user you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>
        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* BACK BUTTON */}
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="size-4 mr-2" />
              Go Home
            </Link>
          </Button>
          {/* EXPLORE BUTTON */}
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

export default ProfileNotFound;
