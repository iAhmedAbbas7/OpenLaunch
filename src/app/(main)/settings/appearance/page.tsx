// <== IMPORTS ==>
import type { Metadata } from "next";
import { AppearanceSettingsForm } from "./appearance-settings-form";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Appearance Settings",
  // <== DESCRIPTION ==>
  description: "Customize the look and feel of OpenLaunch",
};

// <== APPEARANCE SETTINGS PAGE ==>
const AppearanceSettingsPage = () => {
  // RETURNING PAGE
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading">
          Appearance
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Customize the look and feel of OpenLaunch
        </p>
      </div>
      {/* FORM */}
      <AppearanceSettingsForm />
    </div>
  );
};

// <== EXPORTING APPEARANCE SETTINGS PAGE ==>
export default AppearanceSettingsPage;
