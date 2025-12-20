// <== IMPORTS ==>
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// <== METADATA ==>
export const metadata: Metadata = {
  // TITLE
  title: "Reset Password",
  // DESCRIPTION
  description: "Set your new OpenLaunch password",
};

// <== RESET PASSWORD PAGE COMPONENT ==>
const ResetPasswordPage = () => {
  // RETURNING RESET PASSWORD PAGE COMPONENT
  return <ResetPasswordForm />;
};

// <== EXPORTING RESET PASSWORD PAGE ==>
export default ResetPasswordPage;
