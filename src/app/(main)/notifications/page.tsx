// <== IMPORTS ==>
import type { Metadata } from "next";
import { NotificationsPageClient } from "./notifications-page-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Notifications",
  // <== DESCRIPTION ==>
  description: "View and manage your notifications on OpenLaunch.",
};

// <== NOTIFICATIONS PAGE ==>
const NotificationsPage = () => {
  // RETURNING NOTIFICATIONS PAGE CLIENT
  return <NotificationsPageClient />;
};

// <== EXPORTING NOTIFICATIONS PAGE ==>
export default NotificationsPage;

