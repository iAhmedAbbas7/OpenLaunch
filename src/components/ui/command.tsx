// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as React from "react";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";

// <== COMMAND COMPONENT ==>
const Command = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) => {
  // RETURNING COMMAND COMPONENT
  return (
    // OPENING COMMAND PRIMITIVE
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  );
};

// <== COMMAND DIALOG COMPONENT ==>
const CommandDialog = ({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) => {
  // RETURNING COMMAND DIALOG COMPONENT
  return (
    // OPENING DIALOG
    <Dialog {...props}>
      {/* DIALOG CONTENT */}
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        {/* DIALOG HEADER (SR ONLY FOR ACCESSIBILITY) */}
        <DialogHeader className="sr-only">
          {/* DIALOG TITLE */}
          <DialogTitle>{title}</DialogTitle>
          {/* DIALOG DESCRIPTION */}
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {/* COMMAND COMPONENT */}
        <Command className="**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 **:[[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-input-wrapper]_svg]:h-5 **:[[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 **:[[cmdk-item]_svg]:h-5 **:[[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

// <== COMMAND INPUT COMPONENT ==>
const CommandInput = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) => {
  // RETURNING COMMAND INPUT COMPONENT
  return (
    // MAIN CONTAINER
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      {/* SEARCH ICON */}
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      {/* COMMAND INPUT */}
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
};

// <== COMMAND LIST COMPONENT ==>
const CommandList = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) => {
  // RETURNING COMMAND LIST COMPONENT
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  );
};

// <== COMMAND EMPTY COMPONENT ==>
const CommandEmpty = ({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
  // RETURNING COMMAND EMPTY COMPONENT
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
};

// <== COMMAND GROUP COMPONENT ==>
const CommandGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) => {
  // RETURNING COMMAND GROUP COMPONENT
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  );
};

// <== COMMAND SEPARATOR COMPONENT ==>
const CommandSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) => {
  // RETURNING COMMAND SEPARATOR COMPONENT
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
};

// <== COMMAND ITEM COMPONENT ==>
const CommandItem = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) => {
  // RETURNING COMMAND ITEM COMPONENT
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
};

// <== COMMAND SHORTCUT COMPONENT ==>
const CommandShortcut = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  // RETURNING COMMAND SHORTCUT COMPONENT
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
};

// <== EXPORTING COMMAND COMPONENTS ==>
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
