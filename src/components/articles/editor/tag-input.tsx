// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback, KeyboardEvent } from "react";

// <== TAG INPUT PROPS ==>
interface TagInputProps {
  // <== VALUE ==>
  value: string[];
  // <== ON CHANGE ==>
  onChange: (tags: string[]) => void;
  // <== MAX TAGS ==>
  maxTags?: number;
  // <== PLACEHOLDER ==>
  placeholder?: string;
  // <== DISABLED ==>
  disabled?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== TAG INPUT COMPONENT ==>
export const TagInput = ({
  value,
  onChange,
  maxTags = 10,
  placeholder = "Add a tag...",
  disabled = false,
  className,
}: TagInputProps) => {
  // INPUT VALUE STATE
  const [inputValue, setInputValue] = useState("");
  // ADD TAG FUNCTION
  const addTag = useCallback(
    (tag: string) => {
      // TRIM AND LOWERCASE TAG
      const trimmedTag = tag.trim().toLowerCase();
      // CHECK IF TAG IS EMPTY
      if (!trimmedTag) return;
      // CHECK IF TAG IS LONGER THAN 50 CHARACTERS
      if (trimmedTag.length > 50) return;
      // CHECK IF TAG IS ALREADY IN VALUE
      if (value.includes(trimmedTag)) return;
      // CHECK IF MAX TAGS IS REACHED
      if (value.length >= maxTags) return;
      // ADD TAG
      onChange([...value, trimmedTag]);
      // SET INPUT VALUE TO EMPTY STRING
      setInputValue("");
    },
    [value, onChange, maxTags]
  );
  // REMOVE TAG FUNCTION
  const removeTag = useCallback(
    (tagToRemove: string) => {
      // REMOVE TAG FROM VALUE
      onChange(value.filter((tag) => tag !== tagToRemove));
    },
    [value, onChange]
  );
  // HANDLE KEY DOWN FUNCTION
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // ADD TAG ON ENTER OR COMMA
    if (e.key === "Enter" || e.key === ",") {
      // PREVENT DEFAULT FORM SUBMISSION
      e.preventDefault();
      // ADD TAG
      addTag(inputValue);
    }
    // REMOVE LAST TAG ON BACKSPACE
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // REMOVE LAST TAG
      removeTag(value[value.length - 1]);
    }
  };
  // RETURN TAG INPUT COMPONENT
  return (
    <div className={cn("space-y-2", className)}>
      {/* TAGS LIST */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 text-xs sm:text-sm pr-1"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      {/* INPUT */}
      {value.length < maxTags && (
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) {
                addTag(inputValue);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="h-8 sm:h-9 text-sm"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground">
            {value.length}/{maxTags}
          </span>
        </div>
      )}
      {/* HINT */}
      <p className="text-[10px] sm:text-xs text-muted-foreground">
        Press Enter or comma to add a tag
      </p>
    </div>
  );
};

// <== EXPORTING TAG INPUT ==>
export default TagInput;
