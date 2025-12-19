// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import * as React from "react";
import { cn } from "@/lib/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";

// <== POPOVER COMPONENT ==>
const Popover = ({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) => {
  // RETURNING POPOVER COMPONENT
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
};

// <== POPOVER TRIGGER COMPONENT ==>
const PopoverTrigger = ({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) => {
  // RETURNING POPOVER TRIGGER COMPONENT
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
};

// <== POPOVER ANCHOR COMPONENT ==>
const PopoverAnchor = ({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) => {
  // RETURNING POPOVER ANCHOR COMPONENT
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
};

// <== POPOVER CONTENT COMPONENT ==>
const PopoverContent = ({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) => {
  // RETURNING POPOVER CONTENT COMPONENT
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
};

// <== EXPORTING POPOVER COMPONENTS ==>
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
