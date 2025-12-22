// <== DASHBOARD LAYOUT PROPS ==>
interface DashboardLayoutProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== DASHBOARD LAYOUT COMPONENT ==>
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // RETURNING CHILDREN
  return <>{children}</>;
};

// <== EXPORTING DASHBOARD LAYOUT ==>
export default DashboardLayout;
