// <== MAIN LAYOUT PROPS ==>
interface MainLayoutProps {
  // CHILDREN
  children: React.ReactNode;
}

// <== MAIN LAYOUT COMPONENT ==>
const MainLayout = ({ children }: MainLayoutProps) => {
  // RETURNING MAIN LAYOUT COMPONENT
  return (
    // MAIN LAYOUT CONTAINER
    <div className="min-h-screen bg-background">
      {/* CHILDREN */}
      {children}
    </div>
  );
};

// <== EXPORTING MAIN LAYOUT ==>
export default MainLayout;

