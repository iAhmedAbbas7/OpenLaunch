// <== IMPORTS ==>
import type { Metadata } from "next";
import { MyProjectsClient } from "./my-projects-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "My Projects",
  // <== DESCRIPTION ==>
  description: "Manage and track your launched projects",
};

// <== MY PROJECTS PAGE ==>
const MyProjectsPage = () => {
  // RETURNING MY PROJECTS CLIENT
  return <MyProjectsClient />;
};

// <== EXPORTING MY PROJECTS PAGE ==>
export default MyProjectsPage;
