// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Bell,
  UserPlus,
  ArrowUp,
  MessageSquare,
  Reply,
  Heart,
  Trophy,
  Star,
  Mail,
} from "lucide-react";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notifications";
import {
  notificationPreferenceLabels,
  type NotificationPreferenceKey,
} from "@/lib/notifications/types";
import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

// <== NOTIFICATION PREFERENCE ICONS ==>
const notificationPreferenceIcons: Record<
  NotificationPreferenceKey,
  React.ComponentType<{ className?: string }>
> = {
  newFollower: UserPlus,
  projectUpvoted: ArrowUp,
  commentReceived: MessageSquare,
  commentReply: Reply,
  articleLiked: Heart,
  achievementUnlocked: Trophy,
  projectFeatured: Star,
  messageReceived: Mail,
};

// <== NOTIFICATION SETTINGS CLIENT COMPONENT ==>
export const NotificationSettingsClient = () => {
  // FETCH NOTIFICATION PREFERENCES
  const { data: preferences, isLoading } = useNotificationPreferences();
  // UPDATE MUTATION
  const updateMutation = useUpdateNotificationPreferences();
  // <== HANDLE TOGGLE ==>
  const handleToggle = useCallback(
    (key: NotificationPreferenceKey, enabled: boolean) => {
      // UPDATE PREFERENCE
      updateMutation.mutate({ [key]: enabled });
    },
    [updateMutation]
  );
  // RETURN NOTIFICATION SETTINGS
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
              In-App Notifications
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Control which notifications you receive in the app. Disabled
              notifications won&apos;t appear in your notification feed.
            </p>
          </div>
        </div>
      </Card>
      {/* NOTIFICATION OPTIONS */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
          Notification Preferences
        </h3>
        {isLoading ? (
          // LOADING SKELETON
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 sm:py-3 border-b border-border last:border-0"
              >
                <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                  <Skeleton className="size-8 sm:size-9 md:size-10 rounded-lg shrink-0" />
                  <div>
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-40 sm:w-56" />
                  </div>
                </div>
                <Skeleton className="h-5 w-9 sm:h-6 sm:w-11 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          // NOTIFICATION OPTIONS
          <div className="space-y-0">
            {(
              Object.keys(
                notificationPreferenceLabels
              ) as NotificationPreferenceKey[]
            ).map((key) => {
              // GET ICON
              const Icon = notificationPreferenceIcons[key];
              // GET LABEL
              const label = notificationPreferenceLabels[key];
              // GET CURRENT VALUE
              const isEnabled = preferences?.[key] ?? true;
              // RETURN SETTING ROW
              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 sm:py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                    <div className="size-8 sm:size-9 md:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Icon className="size-4 sm:size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">
                        {label.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {label.description}
                      </p>
                    </div>
                  </div>
                  {/* TOGGLE SWITCH */}
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(key, checked)}
                    disabled={updateMutation.isPending}
                    className="shrink-0 ml-2"
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// <== NOTIFICATION SETTINGS CLIENT COMPONENT DISPLAY NAME ==>
NotificationSettingsClient.displayName = "NotificationSettingsClient";
