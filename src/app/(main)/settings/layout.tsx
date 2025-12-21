// <== IMPORTS ==>
import { SettingsSidebar } from "./settings-sidebar";

// <== SETTINGS LAYOUT COMPONENT ==>
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  // RETURNING SETTINGS LAYOUT
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>
      {/* CONTENT */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <SettingsSidebar />
        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default SettingsLayout;
