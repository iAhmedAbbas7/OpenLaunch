// <== IMPORTS ==>
import type { Metadata } from "next";
import { ProfileSettingsForm } from "./profile-settings-form";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Profile Settings",
  // <== DESCRIPTION ==>
  description: "Update your profile information",
};

// <== PROFILE SETTINGS PAGE ==>
const ProfileSettingsPage = () => {
  // RETURNING PAGE
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading">Profile</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          This information will be displayed publicly on your profile
        </p>
      </div>
      {/* FORM */}
      <ProfileSettingsForm />
    </div>
  );
};

export default ProfileSettingsPage;
