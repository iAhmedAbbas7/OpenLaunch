// <== IMPORTS ==>
import * as React from "react";
import { cn } from "@/lib/utils";

// <== SKELETON COMPONENT ==>
const Skeleton = ({ className, ...props }: React.ComponentProps<"div">) => {
  // RETURNING SKELETON COMPONENT
  return (
    // OPENING SKELETON
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
};

// <== EXPORTING SKELETON COMPONENT ==>
export { Skeleton };
