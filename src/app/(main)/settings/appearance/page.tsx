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
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold font-heading">Appearance</h2>
        <p className="text-muted-foreground mt-1">
          Customize the look and feel of OpenLaunch
        </p>
      </div>
      {/* FORM */}
      <AppearanceSettingsForm />
    </div>
  );
};

export default AppearanceSettingsPage;
