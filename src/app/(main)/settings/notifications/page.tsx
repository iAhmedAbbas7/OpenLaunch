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
  // RETURNING PAGE
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold font-heading">Notifications</h2>
        <p className="text-muted-foreground mt-1">
          Choose what notifications you want to receive
        </p>
      </div>
      {/* INFO CARD */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <Bell className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary">Coming Soon</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Notification preferences will be available once the notification
              system is fully implemented.
            </p>
          </div>
        </div>
      </Card>
      {/* NOTIFICATION OPTIONS */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {notificationSettings.map((setting) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.title}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{setting.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
                {/* TOGGLE (DISABLED FOR NOW) */}
                <div className="h-6 w-11 rounded-full bg-secondary relative cursor-not-allowed">
                  <div className="absolute left-1 top-1 size-4 rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsSettingsPage;
