// <== IMPORTS ==>
import { Settings } from "lucide-react";
import { SettingsSidebar } from "./settings-sidebar";

// <== SETTINGS LAYOUT COMPONENT ==>
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  // RETURNING SETTINGS LAYOUT
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* CONTAINER */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">
              Settings
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        {/* CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* SIDEBAR */}
          <SettingsSidebar />
          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};

// <== EXPORTING SETTINGS LAYOUT COMPONENT ==>
export default SettingsLayout;
