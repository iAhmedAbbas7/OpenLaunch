// <== IMPORTS ==>
import { Suspense } from "react";
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
  return (
    <Suspense fallback={<div />}>
      <MyProjectsClient />
    </Suspense>
  );
};

// <== EXPORTING MY PROJECTS PAGE ==>
export default MyProjectsPage;
