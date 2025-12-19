// <== IMPORTS ==>
import * as React from "react";
import { cn } from "@/lib/utils";

// <== CARD COMPONENT ==>
const Card = ({ className, ...props }: React.ComponentProps<"div">) => {
  // RETURNING CARD COMPONENT
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
};

// <== CARD HEADER COMPONENT ==>
const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  // RETURNING CARD HEADER COMPONENT
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
};

// <== CARD TITLE COMPONENT ==>
const CardTitle = ({ className, ...props }: React.ComponentProps<"div">) => {
  // RETURNING CARD TITLE COMPONENT
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
};

// <== CARD DESCRIPTION COMPONENT ==>
const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  // RETURNING CARD DESCRIPTION COMPONENT
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};

// <== CARD ACTION COMPONENT ==>
const CardAction = ({ className, ...props }: React.ComponentProps<"div">) => {
  // RETURNING CARD ACTION COMPONENT
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
};

// <== CARD CONTENT COMPONENT ==>
const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  // RETURNING CARD CONTENT COMPONENT
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
};

// <== CARD FOOTER COMPONENT ==>
const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  // RETURNING CARD FOOTER COMPONENT
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
};

// <== EXPORTING CARD COMPONENTS ==>
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
