// <== IMPORTS ==>
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

// <== METADATA ==>
export const metadata: Metadata = {
  // TITLE
  title: "Sign In",
  // DESCRIPTION
  description: "Sign in to your OpenLaunch account",
};

// <== SIGN IN PAGE COMPONENT ==>
const SignInPage = () => {
  // RETURNING SIGN IN PAGE COMPONENT
  return <SignInForm />;
};

// <== EXPORTING SIGN IN PAGE ==>
export default SignInPage;
