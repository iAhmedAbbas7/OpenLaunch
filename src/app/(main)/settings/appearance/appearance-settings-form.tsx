// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Sun, Moon, Monitor, Check } from "lucide-react";

// <== THEME OPTIONS ==>
const themeOptions = [
  // <== LIGHT THEME ==>
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "A bright and clean look",
  },
  // <== DARK THEME ==>
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes",
  },
  // <== SYSTEM THEME ==>
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Follow your device settings",
  },
];

// <== APPEARANCE SETTINGS FORM COMPONENT ==>
export const AppearanceSettingsForm = () => {
  // GET THEME
  const { theme, setTheme } = useTheme();
  // RETURNING APPEARANCE SETTINGS FORM
  return (
    <div className="space-y-6">
      {/* THEME SECTION */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Theme</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select your preferred color scheme
        </p>
        {/* THEME OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* THEME OPTIONS */}
          {themeOptions.map((option) => {
            // GET ICON
            const Icon = option.icon;
            // GET IS SELECTED
            const isSelected = theme === option.value;
            // RETURN THEME OPTION
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                {/* CHECK ICON */}
                {isSelected && (
                  <div className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="size-3 text-primary-foreground" />
                  </div>
                )}
                {/* ICON */}
                <div
                  className={cn(
                    "size-12 rounded-full flex items-center justify-center",
                    isSelected ? "bg-primary/10" : "bg-secondary"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-6",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                {/* LABEL */}
                <span
                  className={cn(
                    "font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
                {/* DESCRIPTION */}
                <span className="text-xs text-muted-foreground text-center">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
      {/* PREVIEW SECTION */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Preview</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          {/* MOCK NAVBAR */}
          <div className="h-12 bg-background border-b border-border flex items-center px-4 gap-4">
            <div className="size-6 rounded-full bg-primary/20" />
            <div className="h-3 w-20 rounded bg-secondary" />
            <div className="flex-1" />
            <div className="size-8 rounded-full bg-secondary" />
          </div>
          {/* MOCK CONTENT */}
          <div className="p-6 bg-background">
            <div className="space-y-4">
              <div className="h-6 w-48 rounded bg-secondary" />
              <div className="h-4 w-full rounded bg-secondary/50" />
              <div className="h-4 w-3/4 rounded bg-secondary/50" />
              <div className="flex gap-2 mt-6">
                <div className="h-9 w-24 rounded-lg bg-primary" />
                <div className="h-9 w-24 rounded-lg bg-secondary" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
