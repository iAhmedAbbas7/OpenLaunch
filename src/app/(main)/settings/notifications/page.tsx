// <== IMPORTS ==>
import type { Metadata } from "next";
import { NotificationSettingsClient } from "./notification-settings-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Notification Settings",
  // <== DESCRIPTION ==>
  description: "Manage your notification preferences",
};

// <== NOTIFICATIONS SETTINGS PAGE ==>
const NotificationsSettingsPage = () => {
  // RETURNING NOTIFICATIONS SETTINGS PAGE
  return <NotificationSettingsClient />;
};

// <== EXPORTING NOTIFICATIONS SETTINGS PAGE ==>
export default NotificationsSettingsPage;
