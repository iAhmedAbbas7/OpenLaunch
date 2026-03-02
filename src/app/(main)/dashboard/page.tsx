// <== IMPORTS ==>
import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Dashboard",
  // <== DESCRIPTION ==>
  description: "Manage your projects, articles, and account settings",
};

// <== DASHBOARD PAGE ==>
const DashboardPage = () => {
  // RETURNING DASHBOARD CLIENT
  return (
    <Suspense fallback={<div />}>
      <DashboardClient />
    </Suspense>
  );
};

// <== EXPORTING DASHBOARD PAGE ==>
export default DashboardPage;
