// <== SETTINGS PAGE ==>
import { redirect } from "next/navigation";

// <== REDIRECT TO PROFILE SETTINGS ==>
const SettingsPage = () => {
  // REDIRECT TO PROFILE SETTINGS
  redirect("/settings/profile");
};

export default SettingsPage;
