// <== IMPORTS ==>
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Bell, Mail, MessageSquare, Trophy, Users, Folder } from "lucide-react";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Notification Settings",
  // <== DESCRIPTION ==>
  description: "Manage your notification preferences",
};

// <== NOTIFICATION SETTINGS ==>
const notificationSettings = [
  // <== NEW FOLLOWERS ==>
  {
    icon: Users,
    title: "New Followers",
    description: "When someone follows you",
  },
  // <== COMMENTS ==>
  {
    icon: MessageSquare,
    title: "Comments",
    description: "When someone comments on your projects or articles",
  },
  // <== PROJECT UPVOTES ==>
  {
    icon: Folder,
    title: "Project Upvotes",
    description: "When someone upvotes your project",
  },
  // <== ACHIEVEMENTS ==>
  {
    icon: Trophy,
    title: "Achievements",
    description: "When you unlock a new achievement",
  },
  // <== MESSAGES ==>
  {
    icon: Mail,
    title: "Messages",
    description: "When you receive a new message",
  },
];

// <== NOTIFICATIONS SETTINGS PAGE ==>
const NotificationsSettingsPage = () => {
  // RETURNING NOTIFICATIONS SETTINGS PAGE
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading">
          Notifications
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Choose what notifications you want to receive
        </p>
      </div>
      {/* INFO CARD */}
      <Card className="p-3 sm:p-4 md:p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
          <div className="size-8 sm:size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="size-4 sm:size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-primary">
              Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Notification preferences will be available once the notification
              system is fully implemented.
            </p>
          </div>
        </div>
      </Card>
      {/* NOTIFICATION OPTIONS */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
          Email Notifications
        </h3>
        <div className="space-y-0">
          {notificationSettings.map((setting) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.title}
                className="flex items-center justify-between py-2.5 sm:py-3 border-b border-border last:border-0"
              >
                <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                  <div className="size-8 sm:size-9 md:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="size-4 sm:size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">
                      {setting.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
                {/* TOGGLE (DISABLED FOR NOW) */}
                <div className="h-5 w-9 sm:h-6 sm:w-11 rounded-full bg-secondary relative cursor-not-allowed shrink-0 ml-2">
                  <div className="absolute left-1 top-1 size-3 sm:size-4 rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
// <== EXPORTING NOTIFICATIONS SETTINGS PAGE ==>
export default NotificationsSettingsPage;
