// <== IMPORTS ==>
import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

// <== METADATA ==>
export const metadata: Metadata = {
  // TITLE
  title: "Sign Up",
  // DESCRIPTION
  description: "Create your OpenLaunch account",
};

// <== SIGN UP PAGE COMPONENT ==>
const SignUpPage = () => {
  // RETURNING SIGN UP PAGE COMPONENT
  return <SignUpForm />;
};

// <== EXPORTING SIGN UP PAGE ==>
export default SignUpPage;
