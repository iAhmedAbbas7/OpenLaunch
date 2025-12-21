// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  User,
  Settings,
  Bell,
  Palette,
  Link as LinkIcon,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";

// <== SETTINGS NAV ITEMS ==>
const settingsNavItems = [
  // <== PROFILE NAV ITEM ==>
  {
    href: "/settings/profile",
    label: "Profile",
    icon: User,
    description: "Your public profile information",
  },
  // <== ACCOUNT NAV ITEM ==>
  {
    href: "/settings/account",
    label: "Account",
    icon: Settings,
    description: "Email, password, and security",
  },
  // <== NOTIFICATIONS NAV ITEM ==>
  {
    href: "/settings/notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and push notifications",
  },
  // <== APPEARANCE NAV ITEM ==>
  {
    href: "/settings/appearance",
    label: "Appearance",
    icon: Palette,
    description: "Theme and display settings",
  },
  // <== CONNECTIONS NAV ITEM ==>
  {
    href: "/settings/connections",
    label: "Connections",
    icon: LinkIcon,
    description: "Connected accounts and integrations",
  },
  // <== PRIVACY NAV ITEM ==>
  {
    href: "/settings/privacy",
    label: "Privacy",
    icon: Shield,
    description: "Privacy and data settings",
  },
];

// <== SETTINGS SIDEBAR COMPONENT ==>
export const SettingsSidebar = () => {
  // GET CURRENT PATHNAME
  const pathname = usePathname();
  // RETURNING SETTINGS SIDEBAR
  return (
    <Card className="w-full md:w-64 h-fit p-2 shrink-0">
      {/* NAV */}
      <nav className="space-y-1">
        {/* NAV ITEMS */}
        {settingsNavItems.map((item) => {
          // GET ICON
          const Icon = item.icon;
          // CHECK IF ACTIVE
          const isActive = pathname === item.href;
          // RETURN NAV ITEM
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary/50 text-foreground/80 hover:text-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
};
