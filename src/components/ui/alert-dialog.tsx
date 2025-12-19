// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

// <== ALERT DIALOG COMPONENT ==>
const AlertDialog = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) => {
  // RETURNING ALERT DIALOG COMPONENT
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
};

// <== ALERT DIALOG TRIGGER COMPONENT ==>
const AlertDialogTrigger = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) => {
  // RETURNING ALERT DIALOG TRIGGER COMPONENT
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
};

// <== ALERT DIALOG PORTAL COMPONENT ==>
const AlertDialogPortal = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) => {
  // RETURNING ALERT DIALOG PORTAL COMPONENT
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
};

// <== ALERT DIALOG OVERLAY COMPONENT ==>
const AlertDialogOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) => {
  // RETURNING ALERT DIALOG OVERLAY COMPONENT
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
};

// <== ALERT DIALOG CONTENT COMPONENT ==>
const AlertDialogContent = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) => {
  // RETURNING ALERT DIALOG CONTENT COMPONENT
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
};

// <== ALERT DIALOG HEADER COMPONENT ==>
const AlertDialogHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  // RETURNING ALERT DIALOG HEADER COMPONENT
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
};

// <== ALERT DIALOG FOOTER COMPONENT ==>
const AlertDialogFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  // RETURNING ALERT DIALOG FOOTER COMPONENT
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
};

// <== ALERT DIALOG TITLE COMPONENT ==>
const AlertDialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) => {
  // RETURNING ALERT DIALOG TITLE COMPONENT
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
};

// <== ALERT DIALOG DESCRIPTION COMPONENT ==>
const AlertDialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) => {
  // RETURNING ALERT DIALOG DESCRIPTION COMPONENT
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};

// <== ALERT DIALOG ACTION COMPONENT ==>
const AlertDialogAction = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) => {
  // RETURNING ALERT DIALOG ACTION COMPONENT
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
};

// <== ALERT DIALOG CANCEL COMPONENT ==>
const AlertDialogCancel = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) => {
  // RETURNING ALERT DIALOG CANCEL COMPONENT
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
};

// <== EXPORTING ALERT DIALOG COMPONENTS ==>
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
