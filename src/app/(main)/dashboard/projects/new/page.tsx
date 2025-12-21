// <== IMPORTS ==>
import type { Metadata } from "next";
import { NewProjectClient } from "./new-project-client";

// <== PAGE METADATA ==>
export const metadata: Metadata = {
  // TITLE
  title: "New Project",
  // DESCRIPTION
  description:
    "Launch your project on OpenLaunch and share it with the developer community.",
};

// <== NEW PROJECT PAGE ==>
const NewProjectPage = () => {
  // RETURN NEW PROJECT PAGE
  return <NewProjectClient />;
};

export default NewProjectPage;
