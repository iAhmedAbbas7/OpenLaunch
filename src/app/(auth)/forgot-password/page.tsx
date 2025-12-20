// <== IMPORTS ==>
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

// <== METADATA ==>
export const metadata: Metadata = {
  // TITLE
  title: "Forgot Password",
  // DESCRIPTION
  description: "Reset your OpenLaunch password",
};

// <== FORGOT PASSWORD PAGE COMPONENT ==>
const ForgotPasswordPage = () => {
  // RETURNING FORGOT PASSWORD PAGE COMPONENT
  return <ForgotPasswordForm />;
};

// <== EXPORTING FORGOT PASSWORD PAGE ==>
export default ForgotPasswordPage;
