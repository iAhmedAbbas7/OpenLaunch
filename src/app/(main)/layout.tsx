// <== IMPORTS ==>
import { Navbar, Footer } from "@/components/layout";

// <== MAIN LAYOUT PROPS ==>
interface MainLayoutProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== MAIN LAYOUT COMPONENT ==>
const MainLayout = ({ children }: MainLayoutProps) => {
  // RETURNING MAIN LAYOUT COMPONENT
  return (
    // MAIN LAYOUT CONTAINER
    <div className="min-h-dvh bg-background flex flex-col">
      {/* NAVBAR */}
      <Navbar />
      {/* MAIN CONTENT */}
      <main className="flex-1">{children}</main>
      {/* FOOTER */}
      <Footer />
    </div>
  );
};

// <== EXPORTING MAIN LAYOUT ==>
export default MainLayout;
