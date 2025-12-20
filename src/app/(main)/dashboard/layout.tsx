// <== IMPORTS ==>
import type { Metadata } from "next";

// <== METADATA ==>
export const metadata: Metadata = {
  // TITLE
  title: "Dashboard",
  // DESCRIPTION
  description: "Manage your projects, articles, and account settings",
};

// <== DASHBOARD LAYOUT PROPS ==>
interface DashboardLayoutProps {
  // CHILDREN
  children: React.ReactNode;
}

// <== DASHBOARD LAYOUT COMPONENT ==>
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // RETURNING CHILDREN
  return <>{children}</>;
};

// <== EXPORTING DASHBOARD LAYOUT ==>
export default DashboardLayout;
